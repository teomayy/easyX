package uz.easyx.mobile.ui.screens.profile

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.outlined.CreditCard
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.Language
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Policy
import androidx.compose.material.icons.outlined.ReceiptLong
import androidx.compose.material.icons.outlined.Wallet
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import uz.easyx.mobile.ui.theme.CardBorder
import uz.easyx.mobile.ui.theme.Error
import uz.easyx.mobile.ui.theme.Lime
import uz.easyx.mobile.ui.theme.Success
import uz.easyx.mobile.ui.theme.TextPrimary
import uz.easyx.mobile.ui.theme.TextSecondary
import uz.easyx.mobile.ui.theme.White

@Composable
fun ProfileScreen(
    onNavigateBack: () -> Unit,
    onNavigateToPersonalInfo: () -> Unit,
    onNavigateToCards: () -> Unit,
    onNavigateToCryptoAddresses: () -> Unit,
    onNavigateToSettings: () -> Unit,
    onLogout: () -> Unit
) {
    var notificationsEnabled by remember { mutableStateOf(true) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
    ) {
        // Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            IconButton(
                onClick = onNavigateBack,
                modifier = Modifier.align(Alignment.TopEnd)
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Close",
                    tint = TextPrimary
                )
            }
        }

        // Profile info
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Avatar
            Box(
                modifier = Modifier.size(100.dp)
            ) {
                AsyncImage(
                    model = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
                    contentDescription = "Profile photo",
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
                // Verified badge
                Box(
                    modifier = Modifier
                        .size(24.dp)
                        .clip(CircleShape)
                        .background(Success)
                        .align(Alignment.BottomEnd),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "✓",
                        color = White,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Mirzo Bedil",
                style = MaterialTheme.typography.headlineSmall,
                color = TextPrimary
            )

            Text(
                text = "Shaxsiy profil",
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary
            )

            Spacer(modifier = Modifier.height(8.dp))

            // UID
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(16.dp))
                    .background(Lime.copy(alpha = 0.2f))
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "UID: 1197990644",
                    style = MaterialTheme.typography.labelMedium,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Icon(
                    imageVector = Icons.Default.ContentCopy,
                    contentDescription = "Copy",
                    modifier = Modifier.size(16.dp),
                    tint = TextSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Personal section
        ProfileSection(title = "Shaxsiy") {
            ProfileMenuItem(
                icon = Icons.Outlined.Person,
                title = "Shaxsiy ma'lumotlar",
                onClick = onNavigateToPersonalInfo
            )
            ProfileMenuItem(
                icon = Icons.Outlined.CreditCard,
                title = "Kartalar",
                onClick = onNavigateToCards
            )
            ProfileMenuItem(
                icon = Icons.Outlined.Wallet,
                title = "Kripto manzillar",
                onClick = onNavigateToCryptoAddresses
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Settings section
        ProfileSection(title = "Sozlamalar") {
            ProfileMenuItem(
                icon = Icons.Outlined.Language,
                title = "Ilova tili",
                subtitle = "O'zbekcha",
                onClick = { }
            )
            ProfileMenuItemWithSwitch(
                icon = Icons.Outlined.Notifications,
                title = "Bildirishnomalar",
                isChecked = notificationsEnabled,
                onCheckedChange = { notificationsEnabled = it }
            )
            ProfileMenuItem(
                icon = Icons.Outlined.Lock,
                title = "Xavfsizlik",
                onClick = onNavigateToSettings
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Other section
        ProfileSection(title = "Boshqa") {
            ProfileMenuItem(
                icon = Icons.Outlined.Policy,
                title = "Maxfiylik siyosati",
                onClick = { }
            )
            ProfileMenuItem(
                icon = Icons.Outlined.ReceiptLong,
                title = "Foydalanish shartlari",
                onClick = { }
            )
            ProfileMenuItem(
                icon = Icons.Outlined.Info,
                title = "Ilova haqida",
                onClick = { }
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Logout button
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .clickable { onLogout() }
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.Logout,
                contentDescription = "Logout",
                tint = Error
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Profildan chiqish",
                style = MaterialTheme.typography.titleMedium,
                color = Error
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Version
        Text(
            text = "Talqin: 1.0.1",
            style = MaterialTheme.typography.bodySmall,
            color = TextSecondary,
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 24.dp),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
    }
}

@Composable
private fun ProfileSection(
    title: String,
    content: @Composable () -> Unit
) {
    Column(
        modifier = Modifier.padding(horizontal = 24.dp)
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.labelMedium,
            color = TextSecondary,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = White),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
            Column {
                content()
            }
        }
    }
}

@Composable
private fun ProfileMenuItem(
    icon: ImageVector,
    title: String,
    subtitle: String? = null,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.surfaceVariant),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = TextPrimary,
                modifier = Modifier.size(20.dp)
            )
        }
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.bodyLarge,
            color = TextPrimary,
            modifier = Modifier.weight(1f)
        )
        if (subtitle != null) {
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary
            )
            Spacer(modifier = Modifier.width(8.dp))
        }
        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = "Navigate",
            tint = TextSecondary
        )
    }
}

@Composable
private fun ProfileMenuItemWithSwitch(
    icon: ImageVector,
    title: String,
    isChecked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.surfaceVariant),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = TextPrimary,
                modifier = Modifier.size(20.dp)
            )
        }
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.bodyLarge,
            color = TextPrimary,
            modifier = Modifier.weight(1f)
        )
        Switch(
            checked = isChecked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = White,
                checkedTrackColor = Lime,
                uncheckedThumbColor = White,
                uncheckedTrackColor = CardBorder
            )
        )
    }
}
