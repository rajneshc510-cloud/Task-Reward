package com.taskreward.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.taskreward.app.ui.components.BottomNavBar
import com.taskreward.app.ui.components.Screen
import com.taskreward.app.ui.screens.*
import com.taskreward.app.ui.theme.TaskRewardTheme
import com.taskreward.app.viewmodel.AuthState
import com.taskreward.app.viewmodel.AuthViewModel
import com.taskreward.app.viewmodel.TaskRewardViewModel

class MainActivity : ComponentActivity() {

    private val authViewModel: AuthViewModel by viewModels()
    private val taskRewardViewModel: TaskRewardViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            TaskRewardTheme {
                val authState by authViewModel.authState.collectAsState()

                when (val state = authState) {
                    is AuthState.Authenticated -> {
                        val userId = state.user.uid
                        LaunchedEffect(userId) {
                            taskRewardViewModel.bindUser(userId)
                        }

                        MainAppContent(
                            userId = userId,
                            authViewModel = authViewModel,
                            taskRewardViewModel = taskRewardViewModel
                        )
                    }
                    else -> {
                        AuthScreen(authViewModel = authViewModel)
                    }
                }
            }
        }
    }
}

@Composable
fun MainAppContent(
    userId: String,
    authViewModel: AuthViewModel,
    taskRewardViewModel: TaskRewardViewModel
) {
    var currentScreen by remember { mutableStateOf(Screen.HOME) }
    val userProfile by taskRewardViewModel.userProfile.collectAsState()
    val transactions by taskRewardViewModel.transactions.collectAsState()

    // Android back navigation handling: if not on Home, back button returns to Home
    BackHandler(enabled = currentScreen != Screen.HOME) {
        currentScreen = Screen.HOME
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            BottomNavBar(
                currentScreen = currentScreen,
                onScreenSelected = { currentScreen = it }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // STRICT SCREEN SEPARATION: Never stack screens. Only active screen is shown.
            when (currentScreen) {
                Screen.HOME -> {
                    HomeScreen(
                        userProfile = userProfile,
                        onNavigateToTasks = { currentScreen = Screen.TASKS }
                    )
                }
                Screen.TASKS -> {
                    TasksScreen(
                        userId = userId,
                        viewModel = taskRewardViewModel
                    )
                }
                Screen.WALLET -> {
                    WalletScreen(
                        userProfile = userProfile,
                        transactions = transactions
                    )
                }
                Screen.PROFILE -> {
                    ProfileScreen(
                        userProfile = userProfile,
                        onNavigateToWallet = { currentScreen = Screen.WALLET },
                        onLogout = { authViewModel.logout() }
                    )
                }
            }
        }
    }
}
