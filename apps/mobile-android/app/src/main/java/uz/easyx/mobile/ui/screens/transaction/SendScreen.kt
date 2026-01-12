package uz.easyx.mobile.ui.screens.transaction

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import uz.easyx.mobile.ui.components.PrimaryButton
import uz.easyx.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SendScreen(
    cryptoId: String,
    onNavigateBack: () -> Unit,
    onSendComplete: () -> Unit
) {
    var address by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }

    // Mock crypto data
    val cryptoName = when (cryptoId) {
        "btc" -> "Bitcoin"
        "eth" -> "Ethereum"
        "usdt" -> "USDT"
        else -> "Crypto"
    }
    val cryptoSymbol = cryptoId.uppercase()
    val balance = "0.00234"

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Yuborish",
                        style = MaterialTheme.typography.titleLarge,
                        color = TextPrimary
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = TextPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(24.dp)
        ) {
            // Crypto info
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = White),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(
                                when (cryptoId) {
                                    "btc" -> BitcoinOrange
                                    "eth" -> EthereumPurple
                                    "usdt" -> TetherGreen
                                    else -> PurpleStart
                                }
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = cryptoSymbol.first().toString(),
                            style = MaterialTheme.typography.titleMedium,
                            color = White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = cryptoName,
                            style = MaterialTheme.typography.titleMedium,
                            color = TextPrimary
                        )
                        Text(
                            text = "Balans: $balance $cryptoSymbol",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Address input
            Text(
                text = "Qabul qiluvchi manzili",
                style = MaterialTheme.typography.labelMedium,
                color = TextSecondary
            )
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = address,
                onValueChange = { address = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Manzilni kiriting") },
                trailingIcon = {
                    IconButton(onClick = { /* Scan QR */ }) {
                        Icon(
                            imageVector = Icons.Default.QrCodeScanner,
                            contentDescription = "Scan QR",
                            tint = TextSecondary
                        )
                    }
                },
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Lime,
                    unfocusedBorderColor = CardBorder
                )
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Amount input
            Text(
                text = "Miqdor",
                style = MaterialTheme.typography.labelMedium,
                color = TextSecondary
            )
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = amount,
                onValueChange = { amount = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("0.00") },
                suffix = { Text(cryptoSymbol, color = TextSecondary) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Lime,
                    unfocusedBorderColor = CardBorder
                )
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Max button
            TextButton(
                onClick = { amount = balance }
            ) {
                Text(
                    text = "Maksimum: $balance $cryptoSymbol",
                    style = MaterialTheme.typography.bodySmall,
                    color = Info
                )
            }

            Spacer(modifier = Modifier.weight(1f))

            // Network fee info
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = LightGray),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Tarmoq komissiyasi",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary
                    )
                    Text(
                        text = "~0.0001 $cryptoSymbol",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextPrimary
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Send button
            PrimaryButton(
                text = if (isLoading) "Yuborilmoqda..." else "Yuborish",
                onClick = {
                    isLoading = true
                    // TODO: Process send
                    onSendComplete()
                },
                enabled = address.isNotEmpty() && amount.isNotEmpty() && !isLoading
            )
        }
    }
}
