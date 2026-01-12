package uz.easyx.mobile.ui.components

import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.ShowChart
import androidx.compose.material.icons.outlined.SwapHoriz
import androidx.compose.material.icons.outlined.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import uz.easyx.mobile.R
import uz.easyx.mobile.navigation.Screen
import uz.easyx.mobile.ui.theme.Lime
import uz.easyx.mobile.ui.theme.TextSecondary

data class BottomNavItem(
    val label: String,
    val icon: ImageVector,
    val route: String
)

@Composable
fun BottomNavigationBar(
    currentRoute: String?,
    onNavigate: (String) -> Unit
) {
    val items = listOf(
        BottomNavItem("Asosiy", Icons.Outlined.ShowChart, Screen.Home.route),
        BottomNavItem("Savdo", Icons.Outlined.TrendingUp, Screen.Trade.route),
        BottomNavItem("Bozor", Icons.Outlined.ShowChart, Screen.Market.route),
        BottomNavItem("O'tkazma", Icons.Outlined.SwapHoriz, Screen.Transfer.route),
        BottomNavItem("Tarix", Icons.Outlined.History, Screen.History.route),
    )

    NavigationBar(
        containerColor = Color.White,
        contentColor = TextSecondary
    ) {
        items.forEach { item ->
            val isSelected = currentRoute == item.route
            NavigationBarItem(
                icon = {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = item.label,
                        modifier = Modifier.size(24.dp)
                    )
                },
                label = {
                    Text(
                        text = item.label,
                        style = MaterialTheme.typography.labelSmall
                    )
                },
                selected = isSelected,
                onClick = { onNavigate(item.route) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = Lime,
                    selectedTextColor = Lime,
                    unselectedIconColor = TextSecondary,
                    unselectedTextColor = TextSecondary,
                    indicatorColor = Color.Transparent
                )
            )
        }
    }
}
