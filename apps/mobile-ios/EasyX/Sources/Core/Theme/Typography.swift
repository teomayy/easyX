import SwiftUI

extension Font {
    // Using system font with custom weights as Onest fallback
    // In production, you would register the Onest font family

    // Display
    static let displayLarge = Font.system(size: 57, weight: .bold)
    static let displayMedium = Font.system(size: 45, weight: .bold)
    static let displaySmall = Font.system(size: 36, weight: .bold)

    // Headline
    static let headlineLarge = Font.system(size: 32, weight: .semibold)
    static let headlineMedium = Font.system(size: 28, weight: .semibold)
    static let headlineSmall = Font.system(size: 24, weight: .semibold)

    // Title
    static let titleLarge = Font.system(size: 22, weight: .semibold)
    static let titleMedium = Font.system(size: 16, weight: .semibold)
    static let titleSmall = Font.system(size: 14, weight: .medium)

    // Body
    static let bodyLarge = Font.system(size: 16, weight: .regular)
    static let bodyMedium = Font.system(size: 14, weight: .regular)
    static let bodySmall = Font.system(size: 12, weight: .regular)

    // Label
    static let labelLarge = Font.system(size: 14, weight: .medium)
    static let labelMedium = Font.system(size: 12, weight: .medium)
    static let labelSmall = Font.system(size: 11, weight: .medium)
}

// Custom font registration for Onest (if font files are available)
extension Font {
    static func onest(_ style: OnestStyle, size: CGFloat) -> Font {
        // Fallback to system font if Onest is not available
        return Font.system(size: size, weight: style.weight)
    }

    enum OnestStyle {
        case regular
        case medium
        case semiBold
        case bold

        var weight: Font.Weight {
            switch self {
            case .regular: return .regular
            case .medium: return .medium
            case .semiBold: return .semibold
            case .bold: return .bold
            }
        }

        var fontName: String {
            switch self {
            case .regular: return "Onest-Regular"
            case .medium: return "Onest-Medium"
            case .semiBold: return "Onest-SemiBold"
            case .bold: return "Onest-Bold"
            }
        }
    }
}
