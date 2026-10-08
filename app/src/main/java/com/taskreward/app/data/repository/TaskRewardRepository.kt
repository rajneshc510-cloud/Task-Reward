package com.taskreward.app.data.repository

import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.taskreward.app.data.model.RewardTask
import com.taskreward.app.data.model.TaskClaim
import com.taskreward.app.data.model.TransactionRecord
import com.taskreward.app.data.model.TransactionType
import com.taskreward.app.data.model.UserProfile
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class TaskRewardRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    private val usersCollection = firestore.collection("users")
    private val tasksCollection = firestore.collection("tasks")
    private val taskClaimsCollection = firestore.collection("taskClaims")
    private val transactionsCollection = firestore.collection("transactions")

    private val dateFormatter = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

    fun getTodayKey(): String = dateFormatter.format(Date())

    // Observe user profile real-time
    fun observeUserProfile(userId: String): Flow<UserProfile?> = callbackFlow {
        val listener = usersCollection.document(userId).addSnapshotListener { snapshot, error ->
            if (error != null) {
                close(error)
                return@addSnapshotListener
            }
            val profile = snapshot?.toObject(UserProfile::class.java)
            trySend(profile)
        }
        awaitClose { listener.remove() }
    }

    // Observe transaction history
    fun observeTransactions(userId: String): Flow<List<TransactionRecord>> = callbackFlow {
        val listener = transactionsCollection
            .whereEqualTo("userId", userId)
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val list = snapshot?.documents?.mapNotNull { it.toObject(TransactionRecord::class.java) } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }

    // Observe claims for today to disable buttons
    fun observeTodayClaims(userId: String, dateKey: String): Flow<Set<String>> = callbackFlow {
        val listener = taskClaimsCollection
            .whereEqualTo("userId", userId)
            .whereEqualTo("dateKey", dateKey)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val taskIds = snapshot?.documents?.mapNotNull { it.getString("taskId") }?.toSet() ?: emptySet()
                trySend(taskIds)
            }
        awaitClose { listener.remove() }
    }

    // Atomic claim execution
    suspend fun claimTask(userId: String, task: RewardTask): Result<Unit> {
        val dateKey = getTodayKey()
        val claimDocId = "${userId}_${task.id}_${dateKey}"
        val claimRef = taskClaimsCollection.document(claimDocId)
        val userRef = usersCollection.document(userId)
        val newTxRef = transactionsCollection.document()

        return try {
            firestore.runTransaction { transaction ->
                val claimSnap = transaction.get(claimRef)
                if (claimSnap.exists()) {
                    throw IllegalStateException("You have already claimed this reward today.")
                }

                val userSnap = transaction.get(userRef)
                val currentCoins = userSnap.getLong("coins") ?: 0L
                val currentTotalEarned = userSnap.getLong("totalEarned") ?: 0L

                val newCoins = currentCoins + task.points
                val newTotalEarned = currentTotalEarned + task.points

                val claim = TaskClaim(
                    claimId = claimDocId,
                    userId = userId,
                    taskId = task.id,
                    dateKey = dateKey,
                    claimedAt = Timestamp.now(),
                    pointsAwarded = task.points
                )

                val tx = TransactionRecord(
                    id = newTxRef.id,
                    userId = userId,
                    title = task.title,
                    description = "Claimed daily reward (${task.title})",
                    points = task.points,
                    type = TransactionType.REWARD_EARNED,
                    timestamp = Timestamp.now()
                )

                transaction.set(claimRef, claim)
                transaction.set(newTxRef, tx)
                transaction.update(userRef, mapOf(
                    "coins" to newCoins,
                    "totalEarned" to newTotalEarned
                ))
            }.await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
