package uz.easyx.mobile.ui.screens.info

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import uz.easyx.mobile.ui.theme.TextPrimary
import uz.easyx.mobile.ui.theme.TextSecondary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TermsOfServiceScreen(
    onNavigateBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Foydalanish shartlari",
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
                .padding(24.dp)
        ) {
            Text(
                text = "Foydalanish shartlari",
                style = MaterialTheme.typography.headlineSmall,
                color = TextPrimary,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Oxirgi yangilanish: 2024-yil 1-yanvar",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
            )

            Spacer(modifier = Modifier.height(24.dp))

            TermsSection(
                title = "1. Umumiy qoidalar",
                content = "EasyX ilovasidan foydalanish orqali siz ushbu shartlarni qabul qilasiz. " +
                        "Agar siz ushbu shartlarga rozi bo'lmasangiz, ilovadan foydalanmang."
            )

            TermsSection(
                title = "2. Xizmatlar",
                content = "EasyX quyidagi xizmatlarni taqdim etadi:\n\n" +
                        "• Kriptovalyuta sotib olish va sotish\n" +
                        "• Kriptovalyuta almashtirish\n" +
                        "• Kriptovalyuta saqlash\n" +
                        "• P2P savdo"
            )

            TermsSection(
                title = "3. Foydalanuvchi majburiyatlari",
                content = "Foydalanuvchi quyidagilarga rozi bo'ladi:\n\n" +
                        "• To'g'ri ma'lumotlar berish\n" +
                        "• Hisobni xavfsiz saqlash\n" +
                        "• Qonunlarga rioya qilish\n" +
                        "• Boshqalarning huquqlarini hurmat qilish"
            )

            TermsSection(
                title = "4. Javobgarlik cheklovi",
                content = "EasyX bozor o'zgarishlari, texnik nosozliklar yoki foydalanuvchi xatolari " +
                        "natijasida yuzaga kelgan yo'qotishlar uchun javobgar emas."
            )

            TermsSection(
                title = "5. Shartlarni o'zgartirish",
                content = "Biz istalgan vaqtda ushbu shartlarni o'zgartirish huquqini saqlab qolamiz. " +
                        "O'zgarishlar haqida sizga xabar beriladi."
            )
        }
    }
}

@Composable
private fun TermsSection(
    title: String,
    content: String
) {
    Column(modifier = Modifier.padding(bottom = 24.dp)) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = content,
            style = MaterialTheme.typography.bodyMedium,
            color = TextSecondary,
            lineHeight = MaterialTheme.typography.bodyMedium.lineHeight * 1.5
        )
    }
}
