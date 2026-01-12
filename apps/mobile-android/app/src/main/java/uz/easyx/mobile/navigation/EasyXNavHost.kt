package uz.easyx.mobile.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import uz.easyx.mobile.ui.components.BottomNavigationBar
import uz.easyx.mobile.ui.screens.auth.LoginScreen
import uz.easyx.mobile.ui.screens.auth.PinScreen
import uz.easyx.mobile.ui.screens.auth.VerifyOtpScreen
import uz.easyx.mobile.ui.screens.history.HistoryScreen
import uz.easyx.mobile.ui.screens.home.HomeScreen
import uz.easyx.mobile.ui.screens.info.AboutScreen
import uz.easyx.mobile.ui.screens.info.PrivacyPolicyScreen
import uz.easyx.mobile.ui.screens.info.TermsOfServiceScreen
import uz.easyx.mobile.ui.screens.market.MarketScreen
import uz.easyx.mobile.ui.screens.notifications.NotificationsScreen
import uz.easyx.mobile.ui.screens.onboarding.OnboardingScreen
import uz.easyx.mobile.ui.screens.profile.CardsScreen
import uz.easyx.mobile.ui.screens.profile.CryptoAddressesScreen
import uz.easyx.mobile.ui.screens.profile.PersonalInfoScreen
import uz.easyx.mobile.ui.screens.profile.ProfileScreen
import uz.easyx.mobile.ui.screens.settings.LanguageSelectionScreen
import uz.easyx.mobile.ui.screens.settings.SecurityScreen
import uz.easyx.mobile.ui.screens.settings.SettingsScreen
import uz.easyx.mobile.ui.screens.splash.SplashScreen
import uz.easyx.mobile.ui.screens.trade.TradeScreen
import uz.easyx.mobile.ui.screens.transaction.ExchangeScreen
import uz.easyx.mobile.ui.screens.transaction.ReceiveScreen
import uz.easyx.mobile.ui.screens.transaction.SendScreen
import uz.easyx.mobile.ui.screens.transaction.TransactionDetailScreen
import uz.easyx.mobile.ui.screens.transfer.TransferScreen

@Composable
fun EasyXNavHost(
    navController: NavHostController = rememberNavController()
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = currentRoute in listOf(
        Screen.Home.route,
        Screen.Trade.route,
        Screen.Market.route,
        Screen.Transfer.route,
        Screen.History.route
    )

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                BottomNavigationBar(
                    currentRoute = currentRoute,
                    onNavigate = { route ->
                        navController.navigate(route) {
                            popUpTo(Screen.Home.route) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = Screen.Splash.route,
            modifier = Modifier.padding(paddingValues),
            enterTransition = {
                slideIntoContainer(
                    towards = AnimatedContentTransitionScope.SlideDirection.Left,
                    animationSpec = tween(300)
                )
            },
            exitTransition = {
                slideOutOfContainer(
                    towards = AnimatedContentTransitionScope.SlideDirection.Left,
                    animationSpec = tween(300)
                )
            },
            popEnterTransition = {
                slideIntoContainer(
                    towards = AnimatedContentTransitionScope.SlideDirection.Right,
                    animationSpec = tween(300)
                )
            },
            popExitTransition = {
                slideOutOfContainer(
                    towards = AnimatedContentTransitionScope.SlideDirection.Right,
                    animationSpec = tween(300)
                )
            }
        ) {
            // ==================== Auth flow ====================
            composable(Screen.Splash.route) {
                SplashScreen(
                    onNavigateToOnboarding = {
                        navController.navigate(Screen.Onboarding.route) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    },
                    onNavigateToHome = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    },
                    onNavigateToPin = {
                        navController.navigate(Screen.EnterPin.route) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Onboarding.route) {
                OnboardingScreen(
                    onNavigateToLogin = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(Screen.Onboarding.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Login.route) {
                LoginScreen(
                    onNavigateToVerifyOtp = { phone ->
                        navController.navigate(Screen.VerifyOtp.createRoute(phone))
                    },
                    onNavigateToSupport = { },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(
                route = Screen.VerifyOtp.route,
                arguments = listOf(navArgument("phone") { type = NavType.StringType })
            ) { backStackEntry ->
                val phone = backStackEntry.arguments?.getString("phone") ?: ""
                VerifyOtpScreen(
                    phone = phone,
                    onNavigateToCreatePin = {
                        navController.navigate(Screen.CreatePin.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.EnterPin.route) {
                PinScreen(
                    isCreating = false,
                    onPinEntered = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.EnterPin.route) { inclusive = true }
                        }
                    },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.CreatePin.route) {
                PinScreen(
                    isCreating = true,
                    onPinEntered = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.CreatePin.route) { inclusive = true }
                        }
                    },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.LanguageSelection.route) {
                LanguageSelectionScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onLanguageSelected = { /* Save language */ }
                )
            }

            // ==================== Main flow ====================
            composable(Screen.Home.route) {
                HomeScreen(
                    onNavigateToProfile = { navController.navigate(Screen.Profile.route) },
                    onNavigateToNotifications = { navController.navigate(Screen.Notifications.route) },
                    onNavigateToCryptoDetail = { cryptoId ->
                        // Navigate to crypto detail
                    }
                )
            }

            composable(Screen.Trade.route) {
                TradeScreen()
            }

            composable(Screen.Market.route) {
                MarketScreen()
            }

            composable(Screen.Transfer.route) {
                TransferScreen()
            }

            composable(Screen.History.route) {
                HistoryScreen()
            }

            // ==================== Profile flow ====================
            composable(Screen.Profile.route) {
                ProfileScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToPersonalInfo = { navController.navigate(Screen.PersonalInfo.route) },
                    onNavigateToCards = { navController.navigate(Screen.Cards.route) },
                    onNavigateToCryptoAddresses = { navController.navigate(Screen.CryptoAddresses.route) },
                    onNavigateToSettings = { navController.navigate(Screen.Settings.route) },
                    onLogout = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(Screen.Home.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Notifications.route) {
                NotificationsScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.PersonalInfo.route) {
                PersonalInfoScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Cards.route) {
                CardsScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onAddCard = { /* Add card flow */ }
                )
            }

            composable(Screen.CryptoAddresses.route) {
                CryptoAddressesScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Settings.route) {
                SettingsScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToLanguage = { navController.navigate(Screen.LanguageSelection.route) },
                    onNavigateToSecurity = { navController.navigate(Screen.Security.route) },
                    onNavigateToNotifications = { navController.navigate(Screen.Notifications.route) }
                )
            }

            composable(Screen.Security.route) {
                SecurityScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onChangePin = { navController.navigate(Screen.CreatePin.route) }
                )
            }

            composable(Screen.PrivacyPolicy.route) {
                PrivacyPolicyScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.TermsOfService.route) {
                TermsOfServiceScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.About.route) {
                AboutScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            // ==================== Transaction flow ====================
            composable(
                route = Screen.Send.route,
                arguments = listOf(navArgument("cryptoId") { type = NavType.StringType })
            ) { backStackEntry ->
                val cryptoId = backStackEntry.arguments?.getString("cryptoId") ?: ""
                SendScreen(
                    cryptoId = cryptoId,
                    onNavigateBack = { navController.popBackStack() },
                    onSendComplete = { navController.popBackStack() }
                )
            }

            composable(
                route = Screen.Receive.route,
                arguments = listOf(navArgument("cryptoId") { type = NavType.StringType })
            ) { backStackEntry ->
                val cryptoId = backStackEntry.arguments?.getString("cryptoId") ?: ""
                ReceiveScreen(
                    cryptoId = cryptoId,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Exchange.route) {
                ExchangeScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onExchangeComplete = { navController.popBackStack() }
                )
            }

            composable(
                route = Screen.TransactionDetail.route,
                arguments = listOf(navArgument("transactionId") { type = NavType.StringType })
            ) { backStackEntry ->
                val transactionId = backStackEntry.arguments?.getString("transactionId") ?: ""
                TransactionDetailScreen(
                    transactionId = transactionId,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
        }
    }
}
