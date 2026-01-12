import SwiftUI

struct PrimaryButton: View {
    let title: String
    let action: () -> Void
    var isEnabled: Bool = true

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.titleMedium)
                .fontWeight(.semibold)
                .foregroundColor(.textOnLime)
                .frame(maxWidth: .infinity)
                .frame(height: 48)
                .background(isEnabled ? Color.lime : Color.lime.opacity(0.5))
                .cornerRadius(12)
        }
        .disabled(!isEnabled)
    }
}

struct SecondaryButton: View {
    let title: String
    let action: () -> Void
    var isEnabled: Bool = true

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.titleMedium)
                .fontWeight(.semibold)
                .foregroundColor(.lime)
                .frame(maxWidth: .infinity)
                .frame(height: 48)
                .background(Color.clear)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.lime, lineWidth: 1)
                )
        }
        .disabled(!isEnabled)
    }
}

struct TextLinkButton: View {
    let title: String
    let action: () -> Void
    var color: Color = .textSecondary

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.bodyMedium)
                .foregroundColor(color)
        }
    }
}

struct ActionButton: View {
    let icon: String
    let label: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(Color.white.opacity(0.2))
                        .frame(width: 56, height: 56)

                    Image(systemName: icon)
                        .font(.system(size: 20))
                        .foregroundColor(.white)
                }

                Text(label)
                    .font(.labelSmall)
                    .foregroundColor(.white)
            }
        }
    }
}

#Preview {
    VStack(spacing: 16) {
        PrimaryButton(title: "Davom etish", action: {})
        SecondaryButton(title: "Bekor qilish", action: {})
        TextLinkButton(title: "Yordam kerakmi?", action: {})
    }
    .padding()
}
