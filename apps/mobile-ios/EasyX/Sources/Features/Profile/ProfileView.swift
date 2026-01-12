import SwiftUI

struct ProfileView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var appState: AppState
    @State private var notificationsEnabled = true

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    HStack {
                        Spacer()
                        Button(action: { dismiss() }) {
                            Image(systemName: "xmark")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.textPrimary)
                        }
                    }
                    .padding(.horizontal, 16)

                    // Profile info
                    VStack(spacing: 16) {
                        // Avatar
                        ZStack(alignment: .bottomTrailing) {
                            AsyncImage(url: URL(string: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200")) { image in
                                image
                                    .resizable()
                                    .scaledToFill()
                            } placeholder: {
                                Circle()
                                    .fill(Color.lightGray)
                            }
                            .frame(width: 100, height: 100)
                            .clipShape(Circle())

                            // Verified badge
                            Circle()
                                .fill(Color.success)
                                .frame(width: 24, height: 24)
                                .overlay(
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 12, weight: .bold))
                                        .foregroundColor(.white)
                                )
                        }

                        Text("Mirzo Bedil")
                            .font(.headlineSmall)
                            .foregroundColor(.textPrimary)

                        Text("Shaxsiy profil")
                            .font(.bodyMedium)
                            .foregroundColor(.textSecondary)

                        // UID
                        HStack(spacing: 8) {
                            Text("UID: 1197990644")
                                .font(.labelMedium)
                                .foregroundColor(.textPrimary)

                            Button(action: {
                                UIPasteboard.general.string = "1197990644"
                            }) {
                                Image(systemName: "doc.on.doc")
                                    .font(.system(size: 14))
                                    .foregroundColor(.textSecondary)
                            }
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.lime.opacity(0.2))
                        .cornerRadius(16)
                    }

                    // Personal section
                    ProfileSection(title: "Shaxsiy") {
                        ProfileMenuItem(icon: "person", title: "Shaxsiy ma'lumotlar")
                        ProfileMenuItem(icon: "creditcard", title: "Kartalar")
                        ProfileMenuItem(icon: "wallet.pass", title: "Kripto manzillar")
                    }

                    // Settings section
                    ProfileSection(title: "Sozlamalar") {
                        ProfileMenuItem(icon: "globe", title: "Ilova tili", value: "O'zbekcha")
                        ProfileMenuItemToggle(
                            icon: "bell",
                            title: "Bildirishnomalar",
                            isOn: $notificationsEnabled
                        )
                        ProfileMenuItem(icon: "lock", title: "Xavfsizlik")
                    }

                    // Other section
                    ProfileSection(title: "Boshqa") {
                        ProfileMenuItem(icon: "doc.text", title: "Maxfiylik siyosati")
                        ProfileMenuItem(icon: "doc.plaintext", title: "Foydalanish shartlari")
                        ProfileMenuItem(icon: "info.circle", title: "Ilova haqida")
                    }

                    // Logout button
                    Button(action: {
                        appState.logout()
                        dismiss()
                    }) {
                        HStack {
                            Image(systemName: "rectangle.portrait.and.arrow.right")
                            Text("Profildan chiqish")
                        }
                        .font(.titleMedium)
                        .foregroundColor(.error)
                    }
                    .padding(.vertical, 12)

                    // Version
                    Text("Talqin: 1.0.1")
                        .font(.bodySmall)
                        .foregroundColor(.textSecondary)
                        .padding(.bottom, 24)
                }
            }
            .background(Color.white)
        }
    }
}

struct ProfileSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.labelMedium)
                .foregroundColor(.textSecondary)
                .padding(.horizontal, 24)

            VStack(spacing: 0) {
                content
            }
            .background(Color.white)
            .cornerRadius(16)
            .padding(.horizontal, 24)
        }
    }
}

struct ProfileMenuItem: View {
    let icon: String
    let title: String
    var value: String? = nil

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color.lightGray)
                    .frame(width: 40, height: 40)

                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(.textPrimary)
            }

            Text(title)
                .font(.bodyLarge)
                .foregroundColor(.textPrimary)

            Spacer()

            if let value = value {
                Text(value)
                    .font(.bodyMedium)
                    .foregroundColor(.textSecondary)
            }

            Image(systemName: "chevron.right")
                .font(.system(size: 14))
                .foregroundColor(.textSecondary)
        }
        .padding(16)
    }
}

struct ProfileMenuItemToggle: View {
    let icon: String
    let title: String
    @Binding var isOn: Bool

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color.lightGray)
                    .frame(width: 40, height: 40)

                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(.textPrimary)
            }

            Text(title)
                .font(.bodyLarge)
                .foregroundColor(.textPrimary)

            Spacer()

            Toggle("", isOn: $isOn)
                .tint(Color.lime)
        }
        .padding(16)
    }
}

#Preview {
    ProfileView()
        .environmentObject(AppState())
}
