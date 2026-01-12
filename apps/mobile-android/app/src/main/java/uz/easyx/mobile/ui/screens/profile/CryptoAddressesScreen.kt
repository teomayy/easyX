package uz.easyx.mobile.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Wallet
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

data class CryptoAddress(
    val id: String,
    val name: String,
    val symbol: String,
    val address: String,
    val network: String,
    val color: androidx.compose.ui.graphics.Color
)

private val sampleAddresses = listOf(
    CryptoAddress("btc", "Bitcoin", "BTC", "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", "Bitcoin", BitcoinOrange),
    CryptoAddress("eth", "Ethereum", "ETH", "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", "ERC-20", EthereumPurple),
    CryptoAddress("usdt", "Tether", "USDT", "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9", "TRC-20", TetherGreen)
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CryptoAddressesScreen(
    onNavigateBack: () -> Unit
) {
    val clipboardManager = LocalClipboardManager.current
    var copiedAddress by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Kripto manzillar",
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
        if (sampleAddresses.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Wallet,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = TextSecondary
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Manzillar yo'q",
                        style = MaterialTheme.typography.bodyLarge,
                        color = TextSecondary
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(sampleAddresses) { address ->
                    CryptoAddressItem(
                        address = address,
                        isCopied = copiedAddress == address.id,
                        onCopy = {
                            clipboardManager.setText(AnnotatedString(address.address))
                            copiedAddress = address.id
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun CryptoAddressItem(
    address: CryptoAddress,
    isCopied: Boolean,
    onCopy: () -> Unit
) {
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
                    .background(address.color),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = address.symbol.first().toString(),
                    style = MaterialTheme.typography.titleMedium,
                    color = White,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = address.name,
                        style = MaterialTheme.typography.titleSmall,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = address.network,
                        style = MaterialTheme.typography.labelSmall,
                        color = TextSecondary,
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(LightGray)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = address.address,
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            IconButton(onClick = onCopy) {
                Icon(
                    imageVector = Icons.Default.ContentCopy,
                    contentDescription = "Copy",
                    tint = if (isCopied) Success else TextSecondary
                )
            }
        }
    }
}
