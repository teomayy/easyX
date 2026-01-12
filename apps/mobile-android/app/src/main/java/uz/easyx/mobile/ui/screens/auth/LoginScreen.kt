package uz.easyx.mobile.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import uz.easyx.mobile.ui.components.PrimaryButton
import uz.easyx.mobile.ui.components.TextLinkButton
import uz.easyx.mobile.ui.theme.CardBorder
import uz.easyx.mobile.ui.theme.Info
import uz.easyx.mobile.ui.theme.Lime
import uz.easyx.mobile.ui.theme.TextPrimary
import uz.easyx.mobile.ui.theme.TextSecondary

@Composable
fun LoginScreen(
    onNavigateToVerifyOtp: (String) -> Unit,
    onNavigateToSupport: () -> Unit,
    onNavigateBack: () -> Unit
) {
    var phoneNumber by remember { mutableStateOf("") }

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
            text = "Davom etish uchun telefon raqamingizni kiriting",
            style = MaterialTheme.typography.headlineSmall,
            color = TextPrimary
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Phone input label
        Text(
            text = "Telefon raqami",
            style = MaterialTheme.typography.bodyMedium,
            color = TextSecondary
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Phone input field
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, CardBorder, RoundedCornerShape(12.dp))
                .padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "+998",
                    style = MaterialTheme.typography.bodyLarge,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Box(
                    modifier = Modifier
                        .width(1.dp)
                        .height(24.dp)
                        .background(CardBorder)
                )
                Spacer(modifier = Modifier.width(8.dp))
                BasicTextField(
                    value = phoneNumber,
                    onValueChange = {
                        if (it.length <= 9 && it.all { char -> char.isDigit() }) {
                            phoneNumber = it
                        }
                    },
                    modifier = Modifier.weight(1f),
                    textStyle = MaterialTheme.typography.bodyLarge.copy(color = TextPrimary),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    decorationBox = { innerTextField ->
                        if (phoneNumber.isEmpty()) {
                            Text(
                                text = "Telefon raqami",
                                style = MaterialTheme.typography.bodyLarge,
                                color = TextSecondary
                            )
                        }
                        innerTextField()
                    }
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Continue button
        PrimaryButton(
            text = "Davom etish",
            onClick = { onNavigateToVerifyOtp("+998$phoneNumber") },
            enabled = phoneNumber.length == 9
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Terms text
        Text(
            text = buildAnnotatedString {
                append("Davom etish tugmasini bosish orqali ")
                withStyle(SpanStyle(color = Info)) {
                    append("Xizmat ko'rsatish haqidagi oferta shartlari")
                }
                append("ga rozilik bildirasiz")
            },
            style = MaterialTheme.typography.bodySmall,
            color = TextSecondary,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.weight(1f))

        // Support link
        Box(
            modifier = Modifier.fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            TextLinkButton(
                text = "Yordam kerakmi?",
                onClick = onNavigateToSupport
            )
        }

        Spacer(modifier = Modifier.height(16.dp))
    }
}
