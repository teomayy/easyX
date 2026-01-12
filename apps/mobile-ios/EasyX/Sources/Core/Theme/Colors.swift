import SwiftUI

extension Color {
    // Primary Colors
    static let lime = Color(hex: "B7FE01")
    static let limeLight = Color(hex: "D4FF66")
    static let limeDark = Color(hex: "1F3400")

    // Background Colors
    static let darkNavy = Color(hex: "111827")
    static let darkNavyLight = Color(hex: "1F2937")
    static let offWhite = Color(hex: "F9FAFB")
    static let lightGray = Color(hex: "F3F4F6")

    // Purple Gradient (Home Header)
    static let purpleStart = Color(hex: "8B5CF6")
    static let purpleEnd = Color(hex: "6366F1")

    // Text Colors
    static let textPrimary = Color(hex: "111827")
    static let textSecondary = Color(hex: "6B7280")
    static let textTertiary = Color(hex: "9CA3AF")
    static let textOnDark = Color.white
    static let textOnLime = Color(hex: "1F3400")

    // Status Colors
    static let success = Color(hex: "10B981")
    static let error = Color(hex: "EF4444")
    static let warning = Color(hex: "F59E0B")
    static let info = Color(hex: "3B82F6")

    // Crypto Colors
    static let bitcoinOrange = Color(hex: "F7931A")
    static let ethereumPurple = Color(hex: "627EEA")
    static let tetherGreen = Color(hex: "26A17B")
    static let rippleBlue = Color(hex: "0085C0")
    static let binanceYellow = Color(hex: "F3BA2F")

    // Card Colors
    static let cardBorder = Color(hex: "E5E7EB")

    // Gradients
    static var purpleGradient: LinearGradient {
        LinearGradient(
            colors: [purpleStart, purpleEnd],
            startPoint: .top,
            endPoint: .bottom
        )
    }

    static var limeGlowGradient: LinearGradient {
        LinearGradient(
            colors: [lime.opacity(0.25), lime.opacity(0.15)],
            startPoint: .top,
            endPoint: .bottom
        )
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
