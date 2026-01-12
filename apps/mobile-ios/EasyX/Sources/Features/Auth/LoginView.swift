import SwiftUI

struct LoginView: View {
    let onLogin: () -> Void

    @State private var phoneNumber = ""
    @State private var showPinEntry = false

    var isValidPhone: Bool {
        phoneNumber.count == 9 && phoneNumber.allSatisfy { $0.isNumber }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Header
                HStack {
                    Button(action: {}) {
                        ZStack {
                            Circle()
                                .fill(Color.lime)
                                .frame(width: 40, height: 40)

                            Image(systemName: "xmark")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.textOnLime)
                        }
                    }

                    Spacer()

                    // Language selector
                    Button(action: {}) {
                        HStack(spacing: 4) {
                            Text("🇺🇿")
                            Text("UZ")
                                .font(.labelLarge)
                                .foregroundColor(.textPrimary)
                        }
                    }
                }
                .padding(.horizontal, 24)
                .padding(.top, 16)

                Spacer().frame(height: 32)

                // Title
                Text("Davom etish uchun telefon raqamingizni kiriting")
                    .font(.headlineSmall)
                    .foregroundColor(.textPrimary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 24)

                Spacer().frame(height: 24)

                // Phone input
                VStack(alignment: .leading, spacing: 8) {
                    Text("Telefon raqami")
                        .font(.bodyMedium)
                        .foregroundColor(.textSecondary)

                    HStack(spacing: 8) {
                        Text("+998")
                            .font(.bodyLarge)
                            .foregroundColor(.textPrimary)

                        Divider()
                            .frame(width: 1, height: 24)
                            .background(Color.cardBorder)

                        TextField("Telefon raqami", text: $phoneNumber)
                            .font(.bodyLarge)
                            .keyboardType(.phonePad)
                            .onChange(of: phoneNumber) { _, newValue in
                                // Limit to 9 digits
                                if newValue.count > 9 {
                                    phoneNumber = String(newValue.prefix(9))
                                }
                                // Remove non-digits
                                phoneNumber = newValue.filter { $0.isNumber }
                            }
                    }
                    .padding(16)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.cardBorder, lineWidth: 1)
                    )
                }
                .padding(.horizontal, 24)

                Spacer().frame(height: 24)

                // Continue button
                PrimaryButton(
                    title: "Davom etish",
                    action: {
                        showPinEntry = true
                    },
                    isEnabled: isValidPhone
                )
                .padding(.horizontal, 24)

                Spacer().frame(height: 16)

                // Terms text
                Text("Davom etish tugmasini bosish orqali ")
                    .font(.bodySmall)
                    .foregroundColor(.textSecondary)
                +
                Text("Xizmat ko'rsatish haqidagi oferta shartlari")
                    .font(.bodySmall)
                    .foregroundColor(.info)
                +
                Text("ga rozilik bildirasiz")
                    .font(.bodySmall)
                    .foregroundColor(.textSecondary)

                Spacer()

                // Support link
                TextLinkButton(title: "Yordam kerakmi?", action: {})
                    .padding(.bottom, 32)
            }
            .background(Color.white)
            .navigationDestination(isPresented: $showPinEntry) {
                PinView(isCreating: true, onComplete: onLogin)
            }
        }
    }
}

#Preview {
    LoginView(onLogin: {})
}
