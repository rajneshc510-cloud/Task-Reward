package com.taskreward.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.Stars
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.taskreward.app.data.model.RewardTask
import com.taskreward.app.ui.theme.*
import com.taskreward.app.viewmodel.ClaimUiEvent
import com.taskreward.app.viewmodel.TaskRewardViewModel
import kotlinx.coroutines.flow.collectLatest

@Composable
fun TasksScreen(
    userId: String,
    viewModel: TaskRewardViewModel
) {
    val claimedIds by viewModel.claimedTaskIds.collectAsState()
    val isClaiming by viewModel.isClaiming.collectAsState()

    var snackbarMessage by remember { mutableStateOf<String?>(null) }
    var isSuccessMessage by remember { mutableStateOf(true) }

    LaunchedEffect(viewModel) {
        viewModel.uiEvents.collectLatest { event ->
            when (event) {
                is ClaimUiEvent.Success -> {
                    snackbarMessage = event.message
                    isSuccessMessage = true
                }
                is ClaimUiEvent.Error -> {
                    snackbarMessage = event.message
                    isSuccessMessage = false
                }
            }
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(BackgroundLight)
                .padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(top = 24.dp, bottom = 32.dp)
        ) {
            item {
                Column {
                    Text(
                        text = "Tasks & Rewards",
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextDark
                        )
                    )
                    Text(
                        text = "Claim your daily tasks and accumulate demo points",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = TextSecondary
                        )
                    )
                }
            }

            // Status banner if message present
            snackbarMessage?.let { msg ->
                item {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (isSuccessMessage) RewardGreenLight else Color(0xFFFEE2E2),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = msg,
                                color = if (isSuccessMessage) RewardGreen else DangerRed,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 13.sp,
                                modifier = Modifier.weight(1f)
                            )
                            TextButton(onClick = { snackbarMessage = null }) {
                                Text(
                                    text = "Dismiss",
                                    color = if (isSuccessMessage) RewardGreen else DangerRed,
                                    fontSize = 12.sp
                                )
                            }
                        }
                    }
                }
            }

            // Task list: Daily Check-in (+10), Daily Bonus (+20), Complete Activity (+30)
            items(viewModel.dailyTasks.size) { index ->
                val task = viewModel.dailyTasks[index]
                val isClaimed = claimedIds.contains(task.id)

                TaskItemCard(
                    task = task,
                    isClaimed = isClaimed,
                    isClaiming = isClaiming,
                    onClaim = {
                        viewModel.claimTask(userId, task)
                    }
                )
            }
        }
    }
}

@Composable
fun TaskItemCard(
    task: RewardTask,
    isClaimed: Boolean,
    isClaiming: Boolean,
    onClaim: () -> Unit
) {
    val (icon, iconTint) = when (task.id) {
        "daily_checkin" -> Icons.Default.CheckCircle to BluePrimary
        "daily_bonus" -> Icons.Default.CardGiftcard to Color(0xFFF59E0B)
        else -> Icons.Default.Stars to RewardGreen
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(18.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .background(iconTint.copy(alpha = 0.12f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconTint,
                        modifier = Modifier.size(24.dp)
                    )
                }

                Spacer(modifier = Modifier.width(14.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = task.title,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextDark
                        )
                    )
                    Text(
                        text = task.description,
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = TextSecondary
                        )
                    )
                }

                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = RewardGreenLight
                ) {
                    Text(
                        text = "+${task.points} pts",
                        color = RewardGreen,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = onClaim,
                enabled = !isClaimed && !isClaiming,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(46.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isClaimed) Color(0xFFE2E8F0) else BluePrimary,
                    disabledContainerColor = if (isClaimed) Color(0xFFE2E8F0) else BluePrimary.copy(alpha = 0.5f)
                )
            ) {
                if (isClaimed) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = null,
                            tint = TextSecondary,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Claimed Today",
                            color = TextSecondary,
                            fontWeight = FontWeight.Bold
                        )
                    }
                } else {
                    Text(
                        text = "Earn +${task.points} Points",
                        color = SurfaceWhite,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
