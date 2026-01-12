package uz.easyx.mobile.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import uz.easyx.mobile.ui.theme.*

data class BankCard(
    val id: String,
    val cardNumber: String,
    val holderName: String,
    val expiryDate: String,
    val bankName: String,
    val cardType: String
)

private val sampleCards = listOf(
    BankCard("1", "**** **** **** 1234", "MIRZO BEDIL", "12/25", "Uzcard", "UZCARD"),
    BankCard("2", "**** **** **** 5678", "MIRZO BEDIL", "08/26", "Humo", "HUMO")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CardsScreen(
    onNavigateBack: () -> Unit,
    onAddCard: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Kartalar",
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
                actions = {
                    IconButton(onClick = onAddCard) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Add card",
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
        if (sampleCards.isEmpty()) {
            // Empty state
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.CreditCard,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = TextSecondary
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Kartalar yo'q",
                        style = MaterialTheme.typography.bodyLarge,
                        color = TextSecondary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Karta qo'shish uchun + tugmasini bosing",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextTertiary
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(sampleCards) { card ->
                    BankCardItem(card = card)
                }
            }
        }
    }
}

@Composable
private fun BankCardItem(card: BankCard) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(180.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = DarkNavy)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.linearGradient(
                        colors = listOf(
                            PurpleStart,
                            PurpleEnd
                        )
                    )
                )
                .padding(20.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = card.bankName,
                        style = MaterialTheme.typography.titleMedium,
                        color = White,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = card.cardType,
                        style = MaterialTheme.typography.labelMedium,
                        color = White.copy(alpha = 0.8f)
                    )
                }

                Text(
                    text = card.cardNumber,
                    style = MaterialTheme.typography.headlineSmall,
                    color = White,
                    fontWeight = FontWeight.Medium
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "Karta egasi",
                            style = MaterialTheme.typography.labelSmall,
                            color = White.copy(alpha = 0.6f)
                        )
                        Text(
                            text = card.holderName,
                            style = MaterialTheme.typography.bodyMedium,
                            color = White
                        )
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = "Amal qilish",
                            style = MaterialTheme.typography.labelSmall,
                            color = White.copy(alpha = 0.6f)
                        )
                        Text(
                            text = card.expiryDate,
                            style = MaterialTheme.typography.bodyMedium,
                            color = White
                        )
                    }
                }
            }
        }
    }
}
