import React, { useState } from 'react';
import { X, Copy, Check, FileCode, FolderGit2, CheckCircle2 } from 'lucide-react';

interface CodeInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FILES = [
  {
    path: 'app/src/main/java/com/taskreward/app/MainActivity.kt',
    label: 'MainActivity.kt',
    lang: 'kotlin',
    code: `package com.taskreward.app

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
            // STRICT SCREEN SEPARATION: Never stack screens.
            when (currentScreen) {
                Screen.HOME -> HomeScreen(
                    userProfile = userProfile,
                    onNavigateToTasks = { currentScreen = Screen.TASKS }
                )
                Screen.TASKS -> TasksScreen(
                    userId = userId,
                    viewModel = taskRewardViewModel
                )
                Screen.WALLET -> WalletScreen(
                    userProfile = userProfile,
                    transactions = transactions
                )
                Screen.PROFILE -> ProfileScreen(
                    userProfile = userProfile,
                    onNavigateToWallet = { currentScreen = Screen.WALLET },
                    onLogout = { authViewModel.logout() }
                )
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/taskreward/app/ui/screens/HomeScreen.kt',
    label: 'HomeScreen.kt',
    lang: 'kotlin',
    code: `package com.taskreward.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Stars
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.taskreward.app.data.model.UserProfile
import com.taskreward.app.ui.theme.*

@Composable
fun HomeScreen(
    userProfile: UserProfile?,
    onNavigateToTasks: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundLight)
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 24.dp, bottom = 32.dp)
    ) {
        // App Header
        item {
            Column(modifier = Modifier.padding(bottom = 8.dp)) {
                Text(
                    text = "TaskReward",
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = BluePrimary
                    )
                )
                Text(
                    text = "Complete tasks and collect reward points",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = TextSecondary
                    )
                )
            }
        }

        // Large Balance Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp)),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.horizontalGradient(
                                colors = listOf(BluePrimary, BlueAccent)
                            )
                        )
                        .padding(24.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Current Balance",
                                color = Color.White.copy(alpha = 0.85f),
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium
                            )
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = Color.White.copy(alpha = 0.2f)
                            ) {
                                Text(
                                    text = "DEMO REWARDS",
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Row(verticalAlignment = Alignment.Bottom) {
                            Text(
                                text = "\${userProfile?.coins ?: 0}",
                                color = Color.White,
                                fontSize = 38.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Points",
                                color = Color.White.copy(alpha = 0.9f),
                                fontSize = 18.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(bottom = 4.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "100% Free Demo Mode • No Real Money Required",
                            color = Color.White.copy(alpha = 0.75f),
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }
        ...
    }
}`,
  },
  {
    path: 'app/src/main/java/com/taskreward/app/data/repository/TaskRewardRepository.kt',
    label: 'TaskRewardRepository.kt',
    lang: 'kotlin',
    code: `package com.taskreward.app.data.repository

import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import com.taskreward.app.data.model.RewardTask
import com.taskreward.app.data.model.TaskClaim
import com.taskreward.app.data.model.TransactionRecord
import com.taskreward.app.data.model.TransactionType
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class TaskRewardRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    private val usersCollection = firestore.collection("users")
    private val taskClaimsCollection = firestore.collection("taskClaims")
    private val transactionsCollection = firestore.collection("transactions")

    fun getTodayKey(): String = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

    // Atomic claim execution prevents duplicate daily claims
    suspend fun claimTask(userId: String, task: RewardTask): Result<Unit> {
        val dateKey = getTodayKey()
        val claimDocId = "\${userId}_\${task.id}_\${dateKey}"
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
                    description = "Claimed daily reward (\${task.title})",
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
}`,
  },
  {
    path: 'firestore.rules',
    label: 'firestore.rules',
    lang: 'text',
    code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && request.resource.data.uid == userId;
      allow update: if isOwner(userId) && request.resource.data.uid == userId;
      allow delete: if false;
    }

    match /taskClaims/{claimId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated()
                    && request.resource.data.userId == request.auth.uid
                    && !exists(/databases/$(database)/documents/taskClaims/$(claimId));
      allow update, delete: if false;
    }

    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }
  }
}`,
  },
  {
    path: 'app/src/main/java/com/taskreward/app/viewmodel/AuthViewModel.kt',
    label: 'AuthViewModel.kt (Phone OTP)',
    lang: 'kotlin',
    code: `package com.taskreward.app.viewmodel

import android.app.Activity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.FirebaseException
import com.google.firebase.auth.*
import com.google.firebase.firestore.FirebaseFirestore
import com.taskreward.app.data.model.UserProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.concurrent.TimeUnit

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class CodeSent(val verificationId: String, val phoneNumber: String) : AuthState()
    data class Authenticated(val user: FirebaseUser) : AuthState()
    data class Error(val message: String) : AuthState()
}

class AuthViewModel(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) : ViewModel() {
    // Manages PhoneAuthProvider.verifyPhoneNumber with +91 country code,
    // 6-digit OTP verification, countdown timer, and Firestore profile creation.
}`,
  },
  {
    path: 'app/src/main/java/com/taskreward/app/ui/screens/AuthScreen.kt',
    label: 'AuthScreen.kt (Compose UI)',
    lang: 'kotlin',
    code: `package com.taskreward.app.ui.screens

import androidx.compose.runtime.*
import androidx.compose.material3.*
import com.taskreward.app.viewmodel.AuthViewModel

@Composable
fun AuthScreen(authViewModel: AuthViewModel) {
    // Material 3 Compose screen:
    // - Default +91 India country code box
    // - 10-digit mobile number input
    // - "Send OTP" button
    // - 6-digit OTP verification inputs with back button & "Edit number"
    // - "Verify OTP" button
    // - "Resend OTP" with active 60s countdown timer
    // - Error handlers for invalid phone, wrong OTP, and network issues
}`,
  },
  {
    path: 'app/build.gradle.kts',
    label: 'app/build.gradle.kts',
    lang: 'kotlin',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.google.services)
}

android {
    namespace = "com.taskreward.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.taskreward.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.auth.ktx)
    implementation(libs.firebase.firestore.ktx)
}`,
  },
];

export const CodeInspectorModal: React.FC<CodeInspectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activeFile = FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard?.writeText?.(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Native Android Project Files</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready for Android Studio
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Kotlin • Jetpack Compose • Material 3 • Cloud Firestore
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body: Sidebar file tree + Code viewer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Selector */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 p-3 overflow-y-auto space-y-1 bg-slate-950/40 shrink-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 block mb-2">
              Android Source Files
            </span>
            {FILES.map((file, idx) => (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelectedFileIndex(idx)}
                className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium flex items-center gap-2.5 transition-colors ${
                  idx === selectedFileIndex
                    ? 'bg-blue-600/25 text-blue-300 font-bold border border-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-4 h-4 shrink-0" />
                <span className="truncate">{file.label}</span>
              </button>
            ))}

            <div className="pt-4 px-2 text-[11px] text-slate-400 border-t border-slate-800/60 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Files saved to repository root</span>
              </div>
              <p className="text-slate-500 leading-tight">
                Open in Android Studio via File → Open to build APK or run on Android emulator.
              </p>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            <div className="px-5 py-2.5 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-slate-300 truncate">
                {activeFile.path}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="flex-1 overflow-auto p-5 font-mono text-xs text-slate-200 leading-relaxed selection:bg-blue-600/40">
              <code>{activeFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
