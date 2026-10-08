package com.taskreward.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.taskreward.app.data.model.RewardTask
import com.taskreward.app.data.model.TransactionRecord
import com.taskreward.app.data.model.UserProfile
import com.taskreward.app.data.repository.TaskRewardRepository
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch

sealed class ClaimUiEvent {
    data class Success(val message: String, val points: Int) : ClaimUiEvent()
    data class Error(val message: String) : ClaimUiEvent()
}

class TaskRewardViewModel(
    private val repository: TaskRewardRepository = TaskRewardRepository()
) : ViewModel() {

    val dailyTasks = listOf(
        RewardTask(
            id = "daily_checkin",
            title = "Daily Check-in",
            description = "Check in daily to claim your bonus points",
            points = 10,
            iconName = "checkin"
        ),
        RewardTask(
            id = "daily_bonus",
            title = "Daily Bonus",
            description = "Special daily reward for active members",
            points = 20,
            iconName = "bonus"
        ),
        RewardTask(
            id = "complete_activity",
            title = "Complete Activity",
            description = "Complete your daily featured task",
            points = 30,
            iconName = "activity"
        )
    )

    private val _userProfile = MutableStateFlow<UserProfile?>(null)
    val userProfile: StateFlow<UserProfile?> = _userProfile.asStateFlow()

    private val _claimedTaskIds = MutableStateFlow<Set<String>>(emptySet())
    val claimedTaskIds: StateFlow<Set<String>> = _claimedTaskIds.asStateFlow()

    private val _transactions = MutableStateFlow<List<TransactionRecord>>(emptyList())
    val transactions: StateFlow<List<TransactionRecord>> = _transactions.asStateFlow()

    private val _uiEvents = MutableSharedFlow<ClaimUiEvent>()
    val uiEvents: SharedFlow<ClaimUiEvent> = _uiEvents.asSharedFlow()

    private val _isClaiming = MutableStateFlow(false)
    val isClaiming: StateFlow<Boolean> = _isClaiming.asStateFlow()

    fun bindUser(userId: String) {
        viewModelScope.launch {
            repository.observeUserProfile(userId)
                .catch { /* handle error */ }
                .collect { _userProfile.value = it }
        }
        viewModelScope.launch {
            repository.observeTodayClaims(userId, repository.getTodayKey())
                .catch { /* handle error */ }
                .collect { _claimedTaskIds.value = it }
        }
        viewModelScope.launch {
            repository.observeTransactions(userId)
                .catch { /* handle error */ }
                .collect { _transactions.value = it }
        }
    }

    fun claimTask(userId: String, task: RewardTask) {
        if (_claimedTaskIds.value.contains(task.id)) {
            viewModelScope.launch {
                _uiEvents.emit(ClaimUiEvent.Error("You have already claimed ${task.title} today!"))
            }
            return
        }

        viewModelScope.launch {
            _isClaiming.value = true
            val result = repository.claimTask(userId, task)
            _isClaiming.value = false
            result.fold(
                onSuccess = {
                    _uiEvents.emit(ClaimUiEvent.Success("Successfully earned +${task.points} demo points!", task.points))
                },
                onFailure = { error ->
                    _uiEvents.emit(ClaimUiEvent.Error(error.message ?: "Failed to claim reward"))
                }
            )
        }
    }
}
