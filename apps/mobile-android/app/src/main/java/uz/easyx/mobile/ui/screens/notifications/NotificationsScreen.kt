package uz.easyx.mobile.ui.screens.notifications

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.DoneAll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import uz.easyx.mobile.ui.theme.*

data class NotificationItem(
    val id: String,
    val title: String,
    val description: String,
    val time: String,
    val isRead: Boolean = false,
    val actionLink: String? = null
)

private val sampleNotifications = listOf(
    NotificationItem(
        id = "1",
        title = "ETH yana oshdi",
        description = "ETH oxirgi 24 soatda 5.02% foizga oshdi va USDT hisobida 3.117",
        time = "Today, 14:30",
        isRead = false
    ),
    NotificationItem(
        id = "2",
        title = "Very long and long notification text for test",
        description = "Discription",
        time = "Today, 14:30",
        isRead = false
    ),
    NotificationItem(
        id = "3",
        title = "Example notification text",
        description = "Discription",
        time = "Today, 14:30",
        isRead = false,
        actionLink = "Action link"
    )
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(
    onNavigateBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Bildirishnomalar",
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
                    IconButton(onClick = { /* Mark all as read */ }) {
                        Icon(
                            imageVector = Icons.Default.DoneAll,
                            contentDescription = "Mark all as read",
                            tint = Info
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
        if (sampleNotifications.isEmpty()) {
            // Empty state
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Bildirishnomalar yo'q",
                    style = MaterialTheme.typography.bodyLarge,
                    color = TextSecondary
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
            ) {
                items(sampleNotifications) { notification ->
                    NotificationListItem(
                        notification = notification,
                        onClick = { /* Handle notification click */ }
                    )
                }
            }
        }
    }
}

@Composable
private fun NotificationListItem(
    notification: NotificationItem,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 12.dp),
        verticalAlignment = Alignment.Top
    ) {
        // Unread indicator
        if (!notification.isRead) {
            Box(
                modifier = Modifier
                    .padding(top = 6.dp)
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(Success)
            )
        } else {
            Spacer(modifier = Modifier.size(8.dp))
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            // Title and time row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = notification.title,
                    style = MaterialTheme.typography.titleSmall,
                    color = TextPrimary,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    text = notification.time,
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Description
            Text(
                text = notification.description,
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary
            )

            // Action link
            notification.actionLink?.let { link ->
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = link,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Info,
                    modifier = Modifier.clickable { /* Handle action */ }
                )
            }
        }
    }

    HorizontalDivider(
        color = CardBorder,
        thickness = 0.5.dp
    )
}
