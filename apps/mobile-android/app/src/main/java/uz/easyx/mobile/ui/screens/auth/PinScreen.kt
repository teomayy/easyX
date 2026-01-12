package uz.easyx.mobile.ui.screens.auth

import androidx.compose.foundation.background
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Backspace
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.unit.dp
import uz.easyx.mobile.ui.theme.CardBorder
import uz.easyx.mobile.ui.theme.Info
import uz.easyx.mobile.ui.theme.LightGray
import uz.easyx.mobile.ui.theme.Lime
import uz.easyx.mobile.ui.theme.TextPrimary
import uz.easyx.mobile.ui.theme.TextSecondary

@Composable
fun PinScreen(
    isCreating: Boolean,
    onPinEntered: () -> Unit,
    onNavigateBack: () -> Unit
) {
    var pin by remember { mutableStateOf("") }
    var confirmPin by remember { mutableStateOf("") }
    var isConfirming by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val haptic = LocalHapticFeedback.current

    val currentPin = if (isConfirming) confirmPin else pin

    LaunchedEffect(currentPin) {
        if (currentPin.length == 4) {
            if (isCreating) {
                if (!isConfirming) {
                    isConfirming = true
                } else {
                    if (pin == confirmPin) {
                        onPinEntered()
                    } else {
                        error = "PIN-kodlar mos kelmadi"
                        confirmPin = ""
                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    }
                }
            } else {
                // Verify PIN (in real app, check against stored PIN)
                onPinEntered()
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp)
    ) {
        // Header
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

            TextButton(onClick = { /* Logout */ }) {
                Text(
                    text = "Chiqish",
                    color = Info
                )
            }
        }

        Spacer(modifier = Modifier.height(64.dp))

        // Title
        Text(
            text = if (isCreating) {
                if (isConfirming) "PIN-kodni tasdiqlang" else "PIN-kod yarating"
            } else {
                "PIN-kodni kiriting"
            },
            style = MaterialTheme.typography.headlineSmall,
            color = TextPrimary,
            modifier = Modifier.align(Alignment.CenterHorizontally)
        )

        Spacer(modifier = Modifier.height(32.dp))

        // PIN dots
        Row(
            modifier = Modifier.align(Alignment.CenterHorizontally),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            repeat(4) { index ->
                val isFilled = index < currentPin.length
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(CircleShape)
                        .background(
                            if (isFilled) TextPrimary else CardBorder
                        )
                )
            }
        }

        // Error message
        error?.let {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = it,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.align(Alignment.CenterHorizontally)
            )
        }

        Spacer(modifier = Modifier.weight(1f))

        // Number pad
        NumberPad(
            onNumberClick = { number ->
                if (currentPin.length < 4) {
                    if (isConfirming) {
                        confirmPin += number
                    } else {
                        pin += number
                    }
                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                }
                error = null
            },
            onBackspaceClick = {
                if (isConfirming) {
                    if (confirmPin.isNotEmpty()) {
                        confirmPin = confirmPin.dropLast(1)
                    }
                } else {
                    if (pin.isNotEmpty()) {
                        pin = pin.dropLast(1)
                    }
                }
            }
        )

        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
private fun NumberPad(
    onNumberClick: (String) -> Unit,
    onBackspaceClick: () -> Unit
) {
    val numbers = listOf(
        listOf("1", "2", "3"),
        listOf("4", "5", "6"),
        listOf("7", "8", "9"),
        listOf("", "0", "back")
    )

    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        numbers.forEach { row ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                row.forEach { item ->
                    when (item) {
                        "" -> Spacer(modifier = Modifier.size(72.dp))
                        "back" -> {
                            Box(
                                modifier = Modifier
                                    .size(72.dp)
                                    .clip(CircleShape)
                                    .clickable { onBackspaceClick() },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.Backspace,
                                    contentDescription = "Backspace",
                                    tint = TextPrimary
                                )
                            }
                        }
                        else -> {
                            Box(
                                modifier = Modifier
                                    .size(72.dp)
                                    .clip(CircleShape)
                                    .background(LightGray)
                                    .clickable { onNumberClick(item) },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = item,
                                    style = MaterialTheme.typography.headlineMedium,
                                    color = TextPrimary
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
