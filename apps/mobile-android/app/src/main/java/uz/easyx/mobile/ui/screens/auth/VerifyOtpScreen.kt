package uz.easyx.mobile.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import uz.easyx.mobile.ui.components.PrimaryButton
import uz.easyx.mobile.ui.components.TextLinkButton
import uz.easyx.mobile.ui.theme.*

@Composable
fun VerifyOtpScreen(
    phone: String,
    onNavigateToCreatePin: () -> Unit,
    onNavigateBack: () -> Unit
) {
    var otpCode by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var resendCountdown by remember { mutableIntStateOf(60) }
    val focusRequester = remember { FocusRequester() }

    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
    }

    LaunchedEffect(resendCountdown) {
        if (resendCountdown > 0) {
            delay(1000)
            resendCountdown--
        }
    }

    // Auto-submit when 6 digits entered
    LaunchedEffect(otpCode) {
        if (otpCode.length == 6) {
            isLoading = true
            delay(1000) // Simulate API call
            // TODO: Verify OTP with API
            onNavigateToCreatePin()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp)
    ) {
        // Header with close button and language selector
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onNavigateBack,
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(Lime)
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Close",
                    tint = Color.Black,
                    modifier = Modifier.size(20.dp)
                )
            }

            // Language selector
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .clickable { /* Open language selector */ }
                    .padding(8.dp)
            ) {
                Text(
                    text = "🇺🇿",
                    style = MaterialTheme.typography.bodyLarge
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "UZ",
                    style = MaterialTheme.typography.labelLarge,
                    color = TextPrimary
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Title
        Text(
            text = "Tasdiqlash kodini kiriting",
            style = MaterialTheme.typography.headlineSmall,
            color = TextPrimary
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Subtitle with phone number
        Text(
            text = "$phone raqamiga yuborilgan kodni kiriting",
            style = MaterialTheme.typography.bodyMedium,
            color = TextSecondary
        )

        Spacer(modifier = Modifier.height(32.dp))

        // OTP Input boxes
        BasicTextField(
            value = otpCode,
            onValueChange = {
                if (it.length <= 6 && it.all { char -> char.isDigit() }) {
                    otpCode = it
                    errorMessage = null
                }
            },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier
                .fillMaxWidth()
                .focusRequester(focusRequester),
            decorationBox = {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    repeat(6) { index ->
                        val char = otpCode.getOrNull(index)?.toString() ?: ""
                        val isFocused = otpCode.length == index

                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .weight(1f)
                                .height(56.dp)
                                .border(
                                    width = if (isFocused) 2.dp else 1.dp,
                                    color = when {
                                        errorMessage != null -> Error
                                        isFocused -> Lime
                                        char.isNotEmpty() -> CardBorder
                                        else -> CardBorder
                                    },
                                    shape = RoundedCornerShape(12.dp)
                                )
                                .background(
                                    color = if (char.isNotEmpty()) LightGray else Color.Transparent,
                                    shape = RoundedCornerShape(12.dp)
                                )
                        ) {
                            Text(
                                text = char,
                                style = MaterialTheme.typography.headlineMedium,
                                color = TextPrimary,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            }
        )

        // Error message
        if (errorMessage != null) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = errorMessage!!,
                style = MaterialTheme.typography.bodySmall,
                color = Error
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Resend timer or button
        Box(
            modifier = Modifier.fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            if (resendCountdown > 0) {
                Text(
                    text = "Kodni qayta yuborish: ${resendCountdown}s",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
            } else {
                TextLinkButton(
                    text = "Kodni qayta yuborish",
                    onClick = {
                        resendCountdown = 60
                        // TODO: Resend OTP
                    },
                    color = Info
                )
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        // Verify button
        PrimaryButton(
            text = if (isLoading) "Tekshirilmoqda..." else "Tasdiqlash",
            onClick = {
                if (otpCode.length == 6) {
                    isLoading = true
                    // TODO: Verify OTP with API
                    onNavigateToCreatePin()
                } else {
                    errorMessage = "6 xonali kodni kiriting"
                }
            },
            enabled = otpCode.length == 6 && !isLoading
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Change phone number link
        Box(
            modifier = Modifier.fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            TextLinkButton(
                text = "Telefon raqamini o'zgartirish",
                onClick = onNavigateBack
            )
        }

        Spacer(modifier = Modifier.height(16.dp))
    }
}
