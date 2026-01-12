package uz.easyx.mobile.ui.screens.splash

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import uz.easyx.mobile.R
import uz.easyx.mobile.ui.components.PrimaryButton
import uz.easyx.mobile.ui.theme.DarkNavy
import uz.easyx.mobile.ui.theme.Lime
import uz.easyx.mobile.ui.theme.OnestFontFamily

@Composable
fun SplashScreen(
    onNavigateToOnboarding: () -> Unit,
    onNavigateToHome: () -> Unit,
    onNavigateToPin: () -> Unit
) {
    var showContent by remember { mutableStateOf(false) }
    val alpha by animateFloatAsState(
        targetValue = if (showContent) 1f else 0f,
        animationSpec = tween(durationMillis = 1000),
        label = "alpha"
    )

    LaunchedEffect(Unit) {
        delay(300)
        showContent = true
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkNavy)
    ) {
        // Logo and brand in center
        Column(
            modifier = Modifier
                .fillMaxSize()
                .alpha(alpha),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Logo with glow effect
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .shadow(
                        elevation = 32.dp,
                        spotColor = Lime,
                        ambientColor = Lime,
                        shape = RoundedCornerShape(24.dp)
                    )
                    .clip(RoundedCornerShape(24.dp))
                    .background(
                        Brush.linearGradient(
                            colors = listOf(
                                Lime.copy(alpha = 0.25f),
                                Lime.copy(alpha = 0.15f)
                            )
                        )
                    ),
                contentAlignment = Alignment.Center
            ) {
                // X symbol made of shapes
                Text(
                    text = "X",
                    fontSize = 48.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = OnestFontFamily,
                    color = Lime
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Brand name
            Text(
                text = "EasyX",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = OnestFontFamily,
                color = Lime
            )
        }

        // Continue button at bottom
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .padding(24.dp)
                .alpha(alpha)
        ) {
            PrimaryButton(
                text = "Davom etish",
                onClick = onNavigateToOnboarding
            )
        }
    }
}
