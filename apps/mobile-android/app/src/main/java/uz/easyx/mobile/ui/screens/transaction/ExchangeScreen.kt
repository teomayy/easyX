package uz.easyx.mobile.ui.screens.transaction

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.SwapVert
import androidx.compose.material.icons.filled.KeyboardArrowDown
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
fun ExchangeScreen(
    onNavigateBack: () -> Unit,
    onExchangeComplete: () -> Unit
) {
    var fromAmount by remember { mutableStateOf("") }
    var toAmount by remember { mutableStateOf("") }
    var fromCrypto by remember { mutableStateOf("BTC") }
    var toCrypto by remember { mutableStateOf("USDT") }
    var isLoading by remember { mutableStateOf(false) }

    // Mock exchange rate
    val exchangeRate = 42500.0

    LaunchedEffect(fromAmount) {
        if (fromAmount.isNotEmpty()) {
            val amount = fromAmount.toDoubleOrNull() ?: 0.0
            toAmount = String.format("%.2f", amount * exchangeRate)
        } else {
            toAmount = ""
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Almashtirish",
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
            // From section
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = White),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Berish",
                            style = MaterialTheme.typography.labelMedium,
                            color = TextSecondary
                        )
                        Text(
                            text = "Balans: 0.00234 BTC",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = fromAmount,
                            onValueChange = { fromAmount = it },
                            modifier = Modifier.weight(1f),
                            placeholder = { Text("0.00") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Lime,
                                unfocusedBorderColor = CardBorder
                            ),
                            shape = RoundedCornerShape(12.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        CryptoSelector(
                            crypto = fromCrypto,
                            onClick = { /* Show crypto picker */ }
                        )
                    }
                }
            }

            // Swap button
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .offset(y = (-16).dp),
                contentAlignment = Alignment.Center
            ) {
                IconButton(
                    onClick = {
                        val temp = fromCrypto
                        fromCrypto = toCrypto
                        toCrypto = temp
                        fromAmount = ""
                        toAmount = ""
                    },
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(Lime)
                ) {
                    Icon(
                        imageVector = Icons.Default.SwapVert,
                        contentDescription = "Swap",
                        tint = TextOnLime
                    )
                }
            }

            // To section
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .offset(y = (-16).dp),
                colors = CardDefaults.cardColors(containerColor = White),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Olish",
                        style = MaterialTheme.typography.labelMedium,
                        color = TextSecondary
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = toAmount,
                            onValueChange = { },
                            modifier = Modifier.weight(1f),
                            placeholder = { Text("0.00") },
                            readOnly = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Lime,
                                unfocusedBorderColor = CardBorder
                            ),
                            shape = RoundedCornerShape(12.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        CryptoSelector(
                            crypto = toCrypto,
                            onClick = { /* Show crypto picker */ }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Exchange rate info
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = LightGray),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Kurs",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary
                        )
                        Text(
                            text = "1 $fromCrypto = ${String.format("%.2f", exchangeRate)} $toCrypto",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextPrimary
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Komissiya",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary
                        )
                        Text(
                            text = "0.1%",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextPrimary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Exchange button
            PrimaryButton(
                text = if (isLoading) "Almashtirilmoqda..." else "Almashtirish",
                onClick = {
                    isLoading = true
                    // TODO: Process exchange
                    onExchangeComplete()
                },
                enabled = fromAmount.isNotEmpty() && !isLoading
            )
        }
    }
}

@Composable
private fun CryptoSelector(
    crypto: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(LightGray)
            .clickable { onClick() }
            .padding(horizontal = 12.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(24.dp)
                .clip(CircleShape)
                .background(
                    when (crypto) {
                        "BTC" -> BitcoinOrange
                        "ETH" -> EthereumPurple
                        "USDT" -> TetherGreen
                        else -> PurpleStart
                    }
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = crypto.first().toString(),
                style = MaterialTheme.typography.labelSmall,
                color = White,
                fontWeight = FontWeight.Bold
            )
        }
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = crypto,
            style = MaterialTheme.typography.titleSmall,
            color = TextPrimary
        )
        Icon(
            imageVector = Icons.Default.KeyboardArrowDown,
            contentDescription = "Select",
            tint = TextSecondary
        )
    }
}
