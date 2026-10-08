package com.taskreward.app.ui.screens

import android.app.Activity
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Stars
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.taskreward.app.ui.theme.*
import com.taskreward.app.viewmodel.AuthState
import com.taskreward.app.viewmodel.AuthViewModel
import kotlinx.coroutines.delay

@Composable
fun AuthScreen(
    authViewModel: AuthViewModel
) {
    val context = LocalContext.current
    val activity = context as? Activity
    val authState by authViewModel.authState.collectAsState()

    var phoneNumber by remember { mutableStateOf("") }
    var otpDigits by remember { mutableStateOf(List(6) { "" }) }
    var validationError by remember { mutableStateOf<String?>(null) }
    var resendCountdown by remember { mutableStateOf(60) }
    var isTimerRunning by remember { mutableStateOf(false) }

    // Countdown effect for OTP resend
    LaunchedEffect(isTimerRunning, resendCountdown) {
        if (isTimerRunning && resendCountdown > 0) {
            delay(1000L)
            resendCountdown -= 1
        } else if (resendCountdown == 0) {
            isTimerRunning = false
        }
    }

    // Trigger timer when code is sent
    LaunchedEffect(authState) {
        if (authState is AuthState.CodeSent) {
            resendCountdown = 60
            isTimerRunning = true
            validationError = null
            otpDigits = List(6) { "" }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundLight)
            .padding(horizontal = 24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .widthIn(max = 440.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // App Branding Header
            Box(
                modifier = Modifier
                    .size(68.dp)
                    .background(BluePrimary, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Stars,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(38.dp)
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "TaskReward",
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = BluePrimary
                )
            )

            Text(
                text = "Complete daily tasks and collect reward points",
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = TextSecondary
                ),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(28.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(22.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    when (val state = authState) {
                        is AuthState.CodeSent -> {
                            // 6-digit OTP Verification View
                            OtpVerificationView(
                                phoneNumber = state.phoneNumber,
                                otpDigits = otpDigits,
                                onOtpDigitChange = { index, value ->
                                    val updated = otpDigits.toMutableList()
                                    updated[index] = value
                                    otpDigits = updated
                                    validationError = null
                                },
                                onVerifyOtp = {
                                    val fullOtp = otpDigits.joinToString("")
                                    if (fullOtp.length != 6) {
                                        validationError = "Please enter all 6 digits of the OTP"
                                    } else {
                                        authViewModel.verifyOtp(fullOtp)
                                    }
                                },
                                onResendOtp = {
                                    if (!isTimerRunning && activity != null) {
                                        authViewModel.resendOtp(activity)
                                    }
                                },
                                onChangePhone = {
                                    authViewModel.resetToPhoneInput()
                                },
                                resendCountdown = resendCountdown,
                                isTimerRunning = isTimerRunning,
                                isLoading = false,
                                errorMessage = validationError
                            )
                        }
                        else -> {
                            // Phone Number Input View
                            val generalError = when (state) {
                                is AuthState.Error -> state.message
                                else -> validationError
                            }
                            val isLoading = state is AuthState.Loading

                            PhoneInputView(
                                phoneNumber = phoneNumber,
                                onPhoneChange = { input ->
                                    if (input.length <= 10 && input.all { it.isDigit() }) {
                                        phoneNumber = input
                                        validationError = null
                                    }
                                },
                                onSendOtp = {
                                    if (phoneNumber.length != 10) {
                                        validationError = "Please enter a valid 10-digit mobile number"
                                    } else if (phoneNumber[0] !in listOf('6', '7', '8', '9')) {
                                        validationError = "Indian mobile numbers start with 6, 7, 8, or 9"
                                    } else if (activity != null) {
                                        authViewModel.sendOtp(activity, phoneNumber)
                                    } else {
                                        validationError = "Activity context unavailable"
                                    }
                                },
                                isLoading = isLoading,
                                errorMessage = generalError
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Shield,
                    contentDescription = null,
                    tint = TextSecondary,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Secure Firebase Phone Authentication",
                    fontSize = 11.sp,
                    color = TextSecondary,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

@Composable
fun PhoneInputView(
    phoneNumber: String,
    onPhoneChange: (String) -> Unit,
    onSendOtp: () -> Unit,
    isLoading: Boolean,
    errorMessage: String?
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.Start
    ) {
        Text(
            text = "Mobile Login",
            style = MaterialTheme.typography.titleLarge.copy(
                fontWeight = FontWeight.Bold,
                color = TextDark
            )
        )
        Text(
            text = "Enter your 10-digit mobile number to receive an OTP",
            style = MaterialTheme.typography.bodySmall.copy(
                color = TextSecondary
            ),
            modifier = Modifier.padding(top = 2.dp, bottom = 18.dp)
        )

        // Mobile Number Input with +91 Country Code
        Text(
            text = "Mobile Number",
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = TextDark,
            modifier = Modifier.padding(bottom = 6.dp)
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Country Code +91 Box
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = BlueLight,
                border = androidx.compose.foundation.BorderStroke(1.dp, BlueAccent.copy(alpha = 0.4f)),
                modifier = Modifier
                    .height(52.dp)
                    .padding(end = 8.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "🇮🇳 +91",
                        fontWeight = FontWeight.Bold,
                        color = BluePrimary,
                        fontSize = 14.sp
                    )
                }
            }

            // 10-digit Number TextField
            OutlinedTextField(
                value = phoneNumber,
                onValueChange = onPhoneChange,
                placeholder = { Text("98765 43210", color = TextSecondary.copy(alpha = 0.6f)) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .weight(1f)
                    .height(52.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = BluePrimary,
                    unfocusedBorderColor = BorderColor
                )
            )
        }

        if (errorMessage != null) {
            Spacer(modifier = Modifier.height(10.dp))
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFFFEE2E2),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = errorMessage,
                    color = DangerRed,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        Button(
            onClick = onSendOtp,
            enabled = !isLoading,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = BluePrimary)
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    color = Color.White,
                    modifier = Modifier.size(22.dp),
                    strokeWidth = 2.dp
                )
            } else {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Phone,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Send OTP",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }
}

@Composable
fun OtpVerificationView(
    phoneNumber: String,
    otpDigits: List<String>,
    onOtpDigitChange: (Int, String) -> Unit,
    onVerifyOtp: () -> Unit,
    onResendOtp: () -> Unit,
    onChangePhone: () -> Unit,
    resendCountdown: Int,
    isTimerRunning: Boolean,
    isLoading: Boolean,
    errorMessage: String?
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.Start
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(bottom = 8.dp)
        ) {
            IconButton(
                onClick = onChangePhone,
                modifier = Modifier.size(28.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = TextDark,
                    modifier = Modifier.size(18.dp)
                )
            }
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = "Verify OTP",
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Bold,
                    color = TextDark
                )
            )
        }

        Text(
            text = "Enter the 6-digit code sent to $phoneNumber",
            style = MaterialTheme.typography.bodySmall.copy(
                color = TextSecondary
            )
        )

        TextButton(
            onClick = onChangePhone,
            contentPadding = PaddingValues(0.dp),
            modifier = Modifier.padding(bottom = 12.dp)
        ) {
            Text(
                text = "Edit phone number",
                color = BluePrimary,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )
        }

        // 6-digit OTP input boxes
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            for (i in 0 until 6) {
                OutlinedTextField(
                    value = otpDigits.getOrElse(i) { "" },
                    onValueChange = { newVal ->
                        val digit = newVal.filter { it.isDigit() }.takeLast(1)
                        onOtpDigitChange(i, digit)
                    },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    textStyle = LocalTextStyle.current.copy(
                        textAlign = TextAlign.Center,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = TextDark
                    ),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(52.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BluePrimary,
                        unfocusedBorderColor = BorderColor
                    )
                )
            }
        }

        if (errorMessage != null) {
            Spacer(modifier = Modifier.height(10.dp))
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFFFEE2E2),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = errorMessage,
                    color = DangerRed,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Verify OTP Button
        Button(
            onClick = onVerifyOtp,
            enabled = !isLoading,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = BluePrimary)
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    color = Color.White,
                    modifier = Modifier.size(22.dp),
                    strokeWidth = 2.dp
                )
            } else {
                Text(
                    text = "Verify OTP",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Resend OTP with Countdown Timer
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (isTimerRunning) {
                Text(
                    text = "Resend OTP in ${resendCountdown}s",
                    fontSize = 12.sp,
                    color = TextSecondary,
                    fontWeight = FontWeight.Medium
                )
            } else {
                TextButton(
                    onClick = onResendOtp,
                    contentPadding = PaddingValues(horizontal = 8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = null,
                        tint = BluePrimary,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Resend OTP",
                        color = BluePrimary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
