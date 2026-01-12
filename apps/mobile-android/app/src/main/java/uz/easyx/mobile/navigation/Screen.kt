package uz.easyx.mobile.navigation

sealed class Screen(val route: String) {
    // Auth flow
    data object Splash : Screen("splash")
    data object Onboarding : Screen("onboarding")
    data object Login : Screen("login")
    data object Register : Screen("register")
    data object VerifyOtp : Screen("verify_otp/{phone}") {
        fun createRoute(phone: String) = "verify_otp/$phone"
    }
    data object CreatePin : Screen("create_pin")
    data object EnterPin : Screen("enter_pin")
    data object LanguageSelection : Screen("language_selection")

    // Main flow
    data object Main : Screen("main")
    data object Home : Screen("home")
    data object Trade : Screen("trade")
    data object Market : Screen("market")
    data object Transfer : Screen("transfer")
    data object History : Screen("history")

    // Profile flow
    data object Profile : Screen("profile")
    data object PersonalInfo : Screen("personal_info")
    data object Cards : Screen("cards")
    data object CryptoAddresses : Screen("crypto_addresses")
    data object Settings : Screen("settings")
    data object Security : Screen("security")
    data object Notifications : Screen("notifications")
    data object PrivacyPolicy : Screen("privacy_policy")
    data object TermsOfService : Screen("terms_of_service")
    data object About : Screen("about")

    // Transaction screens
    data object Send : Screen("send/{cryptoId}") {
        fun createRoute(cryptoId: String) = "send/$cryptoId"
    }
    data object Receive : Screen("receive/{cryptoId}") {
        fun createRoute(cryptoId: String) = "receive/$cryptoId"
    }
    data object Exchange : Screen("exchange")
    data object TransactionDetail : Screen("transaction/{transactionId}") {
        fun createRoute(transactionId: String) = "transaction/$transactionId"
    }
}
