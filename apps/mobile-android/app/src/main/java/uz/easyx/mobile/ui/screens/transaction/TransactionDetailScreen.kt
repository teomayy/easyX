package uz.easyx.mobile.ui.screens.transaction

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import uz.easyx.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransactionDetailScreen(
    transactionId: String,
    onNavigateBack: () -> Unit
) {
    val clipboardManager = LocalClipboardManager.current

    // Mock transaction data
    val transaction = TransactionData(
        id = transactionId,
        type = "Yuborish",
        status = "Tasdiqlangan",
        amount = "0.00234",
        amountUzs = "99 450.30 so'm",
        crypto = "BTC",
        cryptoName = "Bitcoin",
        fromAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        toAddress = "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
        fee = "0.00001 BTC",
        date = "2024-01-15 14:30",
        txHash = "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Tranzaksiya tafsilotlari",
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
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Status icon
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(CircleShape)
                    .background(Success.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = "Success",
                    tint = Success,
                    modifier = Modifier.size(48.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = transaction.status,
                style = MaterialTheme.typography.titleMedium,
                color = Success
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Amount
            Text(
                text = "-${transaction.amount} ${transaction.crypto}",
                style = MaterialTheme.typography.headlineMedium,
                color = TextPrimary,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "≈ ${transaction.amountUzs}",
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Details card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = White),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    DetailRow(label = "Turi", value = transaction.type)
                    HorizontalDivider(color = CardBorder)
                    DetailRow(label = "Kriptovalyuta", value = "${transaction.cryptoName} (${transaction.crypto})")
                    HorizontalDivider(color = CardBorder)
                    DetailRow(label = "Sana", value = transaction.date)
                    HorizontalDivider(color = CardBorder)
                    DetailRow(label = "Komissiya", value = transaction.fee)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Addresses card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = White),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    AddressRow(
                        label = "Kimdan",
                        address = transaction.fromAddress,
                        onCopy = {
                            clipboardManager.setText(AnnotatedString(transaction.fromAddress))
                        }
                    )
                    HorizontalDivider(color = CardBorder)
                    AddressRow(
                        label = "Kimga",
                        address = transaction.toAddress,
                        onCopy = {
                            clipboardManager.setText(AnnotatedString(transaction.toAddress))
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Transaction hash
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = White),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    AddressRow(
                        label = "Tranzaksiya ID (Hash)",
                        address = transaction.txHash,
                        onCopy = {
                            clipboardManager.setText(AnnotatedString(transaction.txHash))
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // View on explorer button
            OutlinedButton(
                onClick = { /* Open in browser */ },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(text = "Blockchainда ko'rish")
            }
        }
    }
}

@Composable
private fun DetailRow(
    label: String,
    value: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = TextSecondary
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            color = TextPrimary
        )
    }
}

@Composable
private fun AddressRow(
    label: String,
    address: String,
    onCopy: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp)
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = TextSecondary
        )
        Spacer(modifier = Modifier.height(4.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = address,
                style = MaterialTheme.typography.bodyMedium,
                color = TextPrimary,
                modifier = Modifier.weight(1f),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            IconButton(
                onClick = onCopy,
                modifier = Modifier.size(32.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.ContentCopy,
                    contentDescription = "Copy",
                    tint = TextSecondary,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}

private data class TransactionData(
    val id: String,
    val type: String,
    val status: String,
    val amount: String,
    val amountUzs: String,
    val crypto: String,
    val cryptoName: String,
    val fromAddress: String,
    val toAddress: String,
    val fee: String,
    val date: String,
    val txHash: String
)
