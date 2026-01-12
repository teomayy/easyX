package uz.easyx.mobile.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.CallReceived
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.QrCodeScanner
import androidx.compose.material.icons.outlined.SwapVert
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults.SecondaryIndicator
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import uz.easyx.mobile.ui.theme.BitcoinOrange
import uz.easyx.mobile.ui.theme.BinanceYellow
import uz.easyx.mobile.ui.theme.DarkNavy
import uz.easyx.mobile.ui.theme.EthereumPurple
import uz.easyx.mobile.ui.theme.PurpleEnd
import uz.easyx.mobile.ui.theme.PurpleStart
import uz.easyx.mobile.ui.theme.RippleBlue
import uz.easyx.mobile.ui.theme.Success
import uz.easyx.mobile.ui.theme.TetherGreen
import uz.easyx.mobile.ui.theme.TextOnDark
import uz.easyx.mobile.ui.theme.TextPrimary
import uz.easyx.mobile.ui.theme.TextSecondary
import uz.easyx.mobile.ui.theme.White

data class CryptoAsset(
    val id: String,
    val name: String,
    val symbol: String,
    val balance: String,
    val balanceUzs: String,
    val color: Color,
    val isSaved: Boolean = false
)

private val sampleCryptoAssets = listOf(
    CryptoAsset("eth", "Ethereum", "ETH", "0.004", "157 600.82 so'm", EthereumPurple, true),
    CryptoAsset("usdt", "USDT", "USDT", "0.00", "0.00 so'm", TetherGreen, true),
    CryptoAsset("btc", "Bitcoin", "BTC", "0.00002226", "24 427.21 so'm", BitcoinOrange, true),
    CryptoAsset("xrp", "Ripple", "XRP", "0.00", "0.00 so'm", RippleBlue),
    CryptoAsset("bnb", "Binance Coin", "BNB", "0.00", "0.00 so'm", BinanceYellow),
)

@Composable
fun HomeScreen(
    onNavigateToProfile: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    onNavigateToCryptoDetail: (String) -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("Saqlangan", "Barchasi")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header with gradient
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(PurpleStart, PurpleEnd)
                    )
                )
                .padding(top = 48.dp)
        ) {
            Column(
                modifier = Modifier.padding(horizontal = 24.dp)
            ) {
                // Top bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // User avatar and name
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .clickable { onNavigateToProfile() }
                            .padding(4.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(Success),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "MB",
                                style = MaterialTheme.typography.labelSmall,
                                color = White,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Mirzo",
                            style = MaterialTheme.typography.titleMedium,
                            color = White
                        )
                        Text(
                            text = " >",
                            style = MaterialTheme.typography.titleMedium,
                            color = White.copy(alpha = 0.7f)
                        )
                    }

                    // Icons
                    Row {
                        IconButton(onClick = onNavigateToNotifications) {
                            Icon(
                                imageVector = Icons.Outlined.Notifications,
                                contentDescription = "Notifications",
                                tint = White
                            )
                        }
                        IconButton(onClick = { /* QR Scanner */ }) {
                            Icon(
                                imageVector = Icons.Outlined.QrCodeScanner,
                                contentDescription = "QR Scanner",
                                tint = White
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Balance
                Text(
                    text = "Umumiy balans",
                    style = MaterialTheme.typography.bodyMedium,
                    color = White.copy(alpha = 0.8f)
                )
                Row(
                    verticalAlignment = Alignment.Bottom
                ) {
                    Text(
                        text = "35 110",
                        style = MaterialTheme.typography.displaySmall,
                        color = White,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = ".37 so'm",
                        style = MaterialTheme.typography.headlineSmall,
                        color = White.copy(alpha = 0.8f)
                    )
                }
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "-369.30 so'm",
                        style = MaterialTheme.typography.bodyMedium,
                        color = White.copy(alpha = 0.7f)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "-0.21%",
                        style = MaterialTheme.typography.bodyMedium,
                        color = White.copy(alpha = 0.7f)
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Action buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    ActionButton(
                        icon = Icons.Outlined.SwapVert,
                        label = "Bozor",
                        onClick = { }
                    )
                    ActionButton(
                        icon = Icons.AutoMirrored.Outlined.Send,
                        label = "Yuborish",
                        onClick = { }
                    )
                    ActionButton(
                        icon = Icons.AutoMirrored.Outlined.CallReceived,
                        label = "Qabul qilish",
                        onClick = { }
                    )
                    ActionButton(
                        icon = Icons.Outlined.History,
                        label = "Tarix",
                        onClick = { }
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))
            }
        }

        // Crypto list section
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
            colors = CardDefaults.cardColors(containerColor = White)
        ) {
            Column {
                // Tabs
                TabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = White,
                    contentColor = TextPrimary,
                    indicator = { tabPositions ->
                        SecondaryIndicator(
                            modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                            color = DarkNavy
                        )
                    },
                    modifier = Modifier.padding(horizontal = 16.dp)
                ) {
                    tabs.forEachIndexed { index, title ->
                        Tab(
                            selected = selectedTab == index,
                            onClick = { selectedTab = index },
                            text = {
                                Text(
                                    text = title,
                                    style = MaterialTheme.typography.titleSmall,
                                    color = if (selectedTab == index) TextPrimary else TextSecondary
                                )
                            }
                        )
                    }
                }

                // Crypto list
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val filteredAssets = if (selectedTab == 0) {
                        sampleCryptoAssets.filter { it.isSaved }
                    } else {
                        sampleCryptoAssets
                    }

                    items(filteredAssets) { asset ->
                        CryptoListItem(
                            asset = asset,
                            onClick = { onNavigateToCryptoDetail(asset.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ActionButton(
    icon: ImageVector,
    label: String,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable { onClick() }
    ) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .clip(CircleShape)
                .background(White.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = White,
                modifier = Modifier.size(24.dp)
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = White
        )
    }
}

@Composable
private fun CryptoListItem(
    asset: CryptoAsset,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .clickable { onClick() }
            .padding(vertical = 12.dp, horizontal = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Crypto icon
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(asset.color),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = asset.symbol.first().toString(),
                style = MaterialTheme.typography.titleMedium,
                color = White,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.width(12.dp))

        // Name and balance in UZS
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = asset.name,
                style = MaterialTheme.typography.titleSmall,
                color = TextPrimary
            )
            Text(
                text = asset.balanceUzs,
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
            )
        }

        // Crypto balance
        Column(horizontalAlignment = Alignment.End) {
            Text(
                text = "${asset.balanceUzs}",
                style = MaterialTheme.typography.titleSmall,
                color = TextPrimary
            )
            Text(
                text = asset.balance,
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
            )
        }
    }
}
