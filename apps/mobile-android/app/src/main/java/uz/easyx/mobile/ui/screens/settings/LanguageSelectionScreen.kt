package uz.easyx.mobile.ui.screens.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import uz.easyx.mobile.ui.theme.*

data class Language(
    val code: String,
    val name: String,
    val nativeName: String,
    val flag: String
)

private val languages = listOf(
    Language("uz", "Uzbek", "O'zbekcha", "🇺🇿"),
    Language("ru", "Russian", "Русский", "🇷🇺"),
    Language("en", "English", "English", "🇺🇸")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LanguageSelectionScreen(
    onNavigateBack: () -> Unit,
    onLanguageSelected: (String) -> Unit
) {
    var selectedLanguage by remember { mutableStateOf("uz") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Ilova tili",
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
                .padding(16.dp)
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = White),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column {
                    languages.forEachIndexed { index, language ->
                        LanguageItem(
                            language = language,
                            isSelected = selectedLanguage == language.code,
                            onClick = {
                                selectedLanguage = language.code
                                onLanguageSelected(language.code)
                            }
                        )
                        if (index < languages.size - 1) {
                            HorizontalDivider(
                                modifier = Modifier.padding(horizontal = 16.dp),
                                color = CardBorder
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun LanguageItem(
    language: Language,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = language.flag,
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = language.nativeName,
                style = MaterialTheme.typography.bodyLarge,
                color = TextPrimary
            )
            Text(
                text = language.name,
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
            )
        }
        if (isSelected) {
            Box(
                modifier = Modifier
                    .size(24.dp)
                    .clip(CircleShape)
                    .background(Lime),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = "Selected",
                    tint = TextOnLime,
                    modifier = Modifier.size(16.dp)
                )
            }
        }
    }
}
