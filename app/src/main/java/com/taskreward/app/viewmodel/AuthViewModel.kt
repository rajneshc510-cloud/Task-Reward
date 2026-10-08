package com.taskreward.app.viewmodel

import android.app.Activity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.FirebaseException
import com.google.firebase.FirebaseTooManyRequestsException
import com.google.firebase.Timestamp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthOptions
import com.google.firebase.auth.PhoneAuthProvider
import com.google.firebase.firestore.FirebaseFirestore
import com.taskreward.app.data.model.UserProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
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

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    private var storedVerificationId: String? = null
    private var resendToken: PhoneAuthProvider.ForceResendingToken? = null
    private var currentPhoneNumber: String = ""

    init {
        auth.currentUser?.let {
            _authState.value = AuthState.Authenticated(it)
        }
    }

    fun sendOtp(activity: Activity, rawPhone: String) {
        val cleaned = rawPhone.filter { it.isDigit() }
        if (cleaned.length != 10) {
            _authState.value = AuthState.Error("Please enter a valid 10-digit Indian mobile number")
            return
        }
        if (cleaned[0] !in listOf('6', '7', '8', '9')) {
            _authState.value = AuthState.Error("Indian mobile numbers must start with 6, 7, 8, or 9")
            return
        }

        val fullPhone = "+91$cleaned"
        currentPhoneNumber = fullPhone
        _authState.value = AuthState.Loading

        val callbacks = object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
            override fun onVerificationCompleted(credential: PhoneAuthCredential) {
                // Instant auto-verification
                signInWithPhoneCredential(credential)
            }

            override fun onVerificationFailed(e: FirebaseException) {
                val errorMsg = when (e) {
                    is FirebaseAuthInvalidCredentialsException -> "Invalid phone number format or quota exceeded."
                    is FirebaseTooManyRequestsException -> "Too many requests. Please try again later."
                    else -> e.localizedMessage ?: "Network error. Please check your connection."
                }
                _authState.value = AuthState.Error(errorMsg)
            }

            override fun onCodeSent(
                verificationId: String,
                token: PhoneAuthProvider.ForceResendingToken
            ) {
                storedVerificationId = verificationId
                resendToken = token
                _authState.value = AuthState.CodeSent(verificationId, fullPhone)
            }
        }

        val options = PhoneAuthOptions.newBuilder(auth)
            .setPhoneNumber(fullPhone)
            .setTimeout(60L, TimeUnit.SECONDS)
            .setActivity(activity)
            .setCallbacks(callbacks)
            .build()

        PhoneAuthProvider.verifyPhoneNumber(options)
    }

    fun resendOtp(activity: Activity) {
        if (currentPhoneNumber.isBlank() || resendToken == null) {
            _authState.value = AuthState.Error("Unable to resend OTP. Please enter phone number again.")
            return
        }

        _authState.value = AuthState.Loading

        val callbacks = object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
            override fun onVerificationCompleted(credential: PhoneAuthCredential) {
                signInWithPhoneCredential(credential)
            }

            override fun onVerificationFailed(e: FirebaseException) {
                _authState.value = AuthState.Error(e.localizedMessage ?: "Failed to resend OTP. Try again.")
            }

            override fun onCodeSent(
                verificationId: String,
                token: PhoneAuthProvider.ForceResendingToken
            ) {
                storedVerificationId = verificationId
                resendToken = token
                _authState.value = AuthState.CodeSent(verificationId, currentPhoneNumber)
            }
        }

        val options = PhoneAuthOptions.newBuilder(auth)
            .setPhoneNumber(currentPhoneNumber)
            .setTimeout(60L, TimeUnit.SECONDS)
            .setActivity(activity)
            .setCallbacks(callbacks)
            .setForceResendingToken(resendToken!!)
            .build()

        PhoneAuthProvider.verifyPhoneNumber(options)
    }

    fun verifyOtp(otp: String) {
        val verificationId = storedVerificationId
        if (verificationId == null) {
            _authState.value = AuthState.Error("Session expired. Please request a new OTP.")
            return
        }

        val cleanOtp = otp.filter { it.isDigit() }
        if (cleanOtp.length != 6) {
            _authState.value = AuthState.Error("Please enter the complete 6-digit OTP.")
            return
        }

        _authState.value = AuthState.Loading
        val credential = PhoneAuthProvider.getCredential(verificationId, cleanOtp)
        signInWithPhoneCredential(credential)
    }

    private fun signInWithPhoneCredential(credential: PhoneAuthCredential) {
        viewModelScope.launch {
            try {
                val result = auth.signInWithCredential(credential).await()
                val user = result.user
                if (user != null) {
                    ensureUserProfile(user)
                    _authState.value = AuthState.Authenticated(user)
                } else {
                    _authState.value = AuthState.Error("Authentication failed. Please retry.")
                }
            } catch (e: Exception) {
                val message = when (e) {
                    is FirebaseAuthInvalidCredentialsException -> "Incorrect OTP code. Please check and try again."
                    else -> e.localizedMessage ?: "Failed to verify OTP. Please try again."
                }
                // Return to CodeSent state with error
                storedVerificationId?.let { vId ->
                    _authState.value = AuthState.Error(message)
                } ?: run {
                    _authState.value = AuthState.Error(message)
                }
            }
        }
    }

    private suspend fun ensureUserProfile(user: FirebaseUser) {
        val userDoc = firestore.collection("users").document(user.uid)
        val snap = userDoc.get().await()
        if (!snap.exists()) {
            val phone = user.phoneNumber ?: currentPhoneNumber
            val displayName = if (phone.isNotBlank()) "User ${phone.takeLast(4)}" else "Reward Member"
            val profile = UserProfile(
                uid = user.uid,
                name = displayName,
                email = user.email ?: "",
                phoneNumber = phone,
                coins = 0,
                totalEarned = 0,
                createdAt = Timestamp.now()
            )
            userDoc.set(profile).await()
        }
    }

    fun resetToPhoneInput() {
        storedVerificationId = null
        resendToken = null
        _authState.value = AuthState.Idle
    }

    fun logout() {
        auth.signOut()
        storedVerificationId = null
        resendToken = null
        currentPhoneNumber = ""
        _authState.value = AuthState.Idle
    }
}
