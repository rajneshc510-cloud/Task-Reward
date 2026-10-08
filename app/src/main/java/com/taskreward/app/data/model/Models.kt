package com.taskreward.app.data.model

import com.google.firebase.Timestamp

data class UserProfile(
    val uid: String = "",
    val name: String = "",
    val email: String = "",
    val phoneNumber: String = "",
    val coins: Long = 0,
    val totalEarned: Long = 0,
    val createdAt: Timestamp = Timestamp.now()
)

data class RewardTask(
    val id: String = "",
    val title: String = "",
    val description: String = "",
    val points: Int = 0,
    val iconName: String = "",
    val isDaily: Boolean = true
)

data class TaskClaim(
    val claimId: String = "",
    val userId: String = "",
    val taskId: String = "",
    val dateKey: String = "", // Format: YYYY-MM-DD
    val claimedAt: Timestamp = Timestamp.now(),
    val pointsAwarded: Int = 0
)

enum class TransactionType {
    REWARD_EARNED,
    BONUS
}

data class TransactionRecord(
    val id: String = "",
    val userId: String = "",
    val title: String = "",
    val description: String = "",
    val points: Int = 0,
    val type: TransactionType = TransactionType.REWARD_EARNED,
    val timestamp: Timestamp = Timestamp.now()
)
