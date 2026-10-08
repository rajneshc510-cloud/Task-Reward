package com.taskreward.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.taskreward.app.data.model.TransactionRecord
import com.taskreward.app.data.model.UserProfile
import com.taskreward.app.ui.theme.*
import java.text.SimpleDateFormat
import java.util.Locale

@Composable
fun WalletScreen(
    userProfile: UserProfile?,
    transactions: List<TransactionRecord>
) {
    val totalCoins = userProfile?.coins ?: 0L
    // Demo calculation: e.g. 100 points = $1.00 Demo Value
    val demoDollarValue = totalCoins * 0.01

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundLight)
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 24.dp, bottom = 32.dp)
    ) {
        // Wallet Screen Header
        item {
            Column {
                Text(
                    text = "Demo Wallet",
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = TextDark
                    )
                )
                Text(
                    text = "Review your accumulated demonstration rewards",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = TextSecondary
                    )
                )
            }
        }

        // Wallet Balance Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp)),
                colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                ) {
                    Text(
                        text = "TOTAL REWARD BALANCE",
                        color = TextSecondary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(
                            text = "$totalCoins",
                            fontSize = 36.sp,
                            fontWeight = FontWeight.Bold,
                            color = BluePrimary
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Points",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextSecondary,
                            modifier = Modifier.padding(bottom = 4.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    HorizontalDivider(color = BorderColor)
                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Estimated Demo Value",
                                fontSize = 12.sp,
                                color = TextSecondary
                            )
                            Text(
                                text = "$${String.format(Locale.US, "%.2f", demoDollarValue)} USD",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = RewardGreen
                            )
                        }
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = BlueLight
                        ) {
                            Text(
                                text = "Demo Only",
                                color = BluePrimary,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }
        }

        // Compliance / Demo Safety Notice Card
        item {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFFEFF6FF),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFBFDBFE))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        tint = BluePrimary,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Demo points are for in-app gamification & tracking purposes only. This app does not process real-money payouts or collect bank / UPI credentials.",
                        color = TextDark,
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )
                }
            }
        }

        // Transaction & Reward History Header
        item {
            Text(
                text = "Reward History",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = TextDark
                ),
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        // Empty state vs Transactions List
        if (transactions.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(36.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .background(BackgroundLight, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.ReceiptLong,
                                contentDescription = null,
                                tint = TextSecondary,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "No transactions yet",
                            fontWeight = FontWeight.SemiBold,
                            color = TextDark,
                            fontSize = 15.sp
                        )
                        Text(
                            text = "Complete daily tasks in the Tasks tab to start earning points!",
                            color = TextSecondary,
                            fontSize = 13.sp,
                            modifier = Modifier.padding(top = 4.dp),
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            }
        } else {
            items(transactions) { tx ->
                TransactionRow(tx = tx)
            }
        }
    }
}

@Composable
fun TransactionRow(tx: TransactionRecord) {
    val dateString = SimpleDateFormat("MMM dd, yyyy • HH:mm", Locale.getDefault())
        .format(tx.timestamp.toDate())

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(RewardGreenLight, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.AccountBalanceWallet,
                    contentDescription = null,
                    tint = RewardGreen,
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = tx.title,
                    fontWeight = FontWeight.SemiBold,
                    color = TextDark,
                    fontSize = 14.sp
                )
                Text(
                    text = dateString,
                    color = TextSecondary,
                    fontSize = 11.sp
                )
            }

            Text(
                text = "+${tx.points}",
                color = RewardGreen,
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp
            )
        }
    }
}
