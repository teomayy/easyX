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
fun PrivacyPolicyScreen(
    onNavigateBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Maxfiylik siyosati",
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
                text = "Maxfiylik siyosati",
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

            PolicySection(
                title = "1. Ma'lumotlarni yig'ish",
                content = "Biz quyidagi ma'lumotlarni yig'amiz:\n\n" +
                        "• Shaxsiy ma'lumotlar (ism, telefon raqami, email)\n" +
                        "• Qurilma ma'lumotlari\n" +
                        "• Tranzaksiya tarixi\n" +
                        "• Foydalanish statistikasi"
            )

            PolicySection(
                title = "2. Ma'lumotlardan foydalanish",
                content = "Yig'ilgan ma'lumotlar quyidagi maqsadlarda ishlatiladi:\n\n" +
                        "• Xizmatlarni taqdim etish\n" +
                        "• Xavfsizlikni ta'minlash\n" +
                        "• Mijozlarga xizmat ko'rsatish\n" +
                        "• Ilovani yaxshilash"
            )

            PolicySection(
                title = "3. Ma'lumotlarni himoya qilish",
                content = "Biz sizning ma'lumotlaringizni himoya qilish uchun zamonaviy shifrlash texnologiyalaridan foydalanamiz. " +
                        "Barcha tranzaksiyalar xavfsiz kanallar orqali amalga oshiriladi."
            )

            PolicySection(
                title = "4. Uchinchi tomonlar",
                content = "Biz sizning ma'lumotlaringizni sizning roziligisiz uchinchi tomonlarga bermaymiz, " +
                        "qonun talab qilgan hollar bundan mustasno."
            )

            PolicySection(
                title = "5. Bog'lanish",
                content = "Savollar bo'lsa, biz bilan bog'laning:\n\n" +
                        "Email: privacy@easyx.uz\n" +
                        "Telefon: +998 71 123 45 67"
            )
        }
    }
}

@Composable
private fun PolicySection(
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
