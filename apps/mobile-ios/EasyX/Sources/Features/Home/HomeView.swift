import SwiftUI

struct CryptoAsset: Identifiable {
    let id: String
    let name: String
    let symbol: String
    let balance: String
    let balanceUzs: String
    let color: Color
    let isSaved: Bool
}

struct HomeView: View {
    @State private var selectedTab = 0
    @State private var showProfile = false

    private let cryptoAssets = [
        CryptoAsset(id: "eth", name: "Ethereum", symbol: "ETH", balance: "0.004", balanceUzs: "157 600.82 so'm", color: .ethereumPurple, isSaved: true),
        CryptoAsset(id: "usdt", name: "USDT", symbol: "USDT", balance: "0.00", balanceUzs: "0.00 so'm", color: .tetherGreen, isSaved: true),
        CryptoAsset(id: "btc", name: "Bitcoin", symbol: "BTC", balance: "0.00002226", balanceUzs: "24 427.21 so'm", color: .bitcoinOrange, isSaved: true),
        CryptoAsset(id: "xrp", name: "Ripple", symbol: "XRP", balance: "0.00", balanceUzs: "0.00 so'm", color: .rippleBlue, isSaved: false),
        CryptoAsset(id: "bnb", name: "Binance Coin", symbol: "BNB", balance: "0.00", balanceUzs: "0.00 so'm", color: .binanceYellow, isSaved: false),
    ]

    var filteredAssets: [CryptoAsset] {
        if selectedTab == 0 {
            return cryptoAssets.filter { $0.isSaved }
        }
        return cryptoAssets
    }

    var body: some View {
        NavigationStack {
            ZStack(alignment: .top) {
                // Background
                Color.white.ignoresSafeArea()

                VStack(spacing: 0) {
                    // Header with gradient
                    headerView
                        .background(Color.purpleGradient)

                    // Crypto list
                    cryptoListView
                }
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showProfile) {
                ProfileView()
            }
        }
    }

    private var headerView: some View {
        VStack(spacing: 0) {
            // Top bar
            HStack {
                // User avatar and name
                Button(action: { showProfile = true }) {
                    HStack(spacing: 8) {
                        Circle()
                            .fill(Color.success)
                            .frame(width: 32, height: 32)
                            .overlay(
                                Text("MB")
                                    .font(.labelSmall)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                            )

                        Text("Mirzo")
                            .font(.titleMedium)
                            .foregroundColor(.white)

                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                    }
                }

                Spacer()

                // Icons
                HStack(spacing: 8) {
                    Button(action: {}) {
                        Image(systemName: "bell")
                            .font(.system(size: 20))
                            .foregroundColor(.white)
                            .frame(width: 44, height: 44)
                    }

                    Button(action: {}) {
                        Image(systemName: "qrcode.viewfinder")
                            .font(.system(size: 20))
                            .foregroundColor(.white)
                            .frame(width: 44, height: 44)
                    }
                }
            }
            .padding(.horizontal, 24)
            .padding(.top, 8)

            Spacer().frame(height: 24)

            // Balance
            VStack(alignment: .leading, spacing: 4) {
                Text("Umumiy balans")
                    .font(.bodyMedium)
                    .foregroundColor(.white.opacity(0.8))

                HStack(alignment: .lastTextBaseline, spacing: 0) {
                    Text("35 110")
                        .font(.displaySmall)
                        .fontWeight(.bold)
                        .foregroundColor(.white)

                    Text(".37 so'm")
                        .font(.headlineSmall)
                        .foregroundColor(.white.opacity(0.8))
                }

                HStack(spacing: 8) {
                    Text("-369.30 so'm")
                        .font(.bodyMedium)
                        .foregroundColor(.white.opacity(0.7))

                    Text("-0.21%")
                        .font(.bodyMedium)
                        .foregroundColor(.white.opacity(0.7))
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 24)

            Spacer().frame(height: 24)

            // Action buttons
            HStack(spacing: 24) {
                ActionButton(icon: "arrow.up.arrow.down", label: "Bozor", action: {})
                ActionButton(icon: "arrow.up.right", label: "Yuborish", action: {})
                ActionButton(icon: "arrow.down.left", label: "Qabul qilish", action: {})
                ActionButton(icon: "clock", label: "Tarix", action: {})
            }
            .padding(.horizontal, 24)

            Spacer().frame(height: 24)
        }
        .padding(.top, 48)
    }

    private var cryptoListView: some View {
        VStack(spacing: 0) {
            // Tabs
            HStack(spacing: 0) {
                ForEach(["Saqlangan", "Barchasi"].indices, id: \.self) { index in
                    Button(action: { selectedTab = index }) {
                        VStack(spacing: 8) {
                            Text(["Saqlangan", "Barchasi"][index])
                                .font(.titleSmall)
                                .foregroundColor(selectedTab == index ? .textPrimary : .textSecondary)

                            Rectangle()
                                .fill(selectedTab == index ? Color.darkNavy : Color.clear)
                                .frame(height: 2)
                        }
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .padding(.horizontal, 16)

            // List
            ScrollView {
                LazyVStack(spacing: 8) {
                    ForEach(filteredAssets) { asset in
                        CryptoListItem(asset: asset)
                    }
                }
                .padding(16)
            }
        }
        .background(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(Color.white)
                .ignoresSafeArea(edges: .bottom)
        )
    }
}

struct CryptoListItem: View {
    let asset: CryptoAsset

    var body: some View {
        HStack(spacing: 12) {
            // Icon
            Circle()
                .fill(asset.color)
                .frame(width: 40, height: 40)
                .overlay(
                    Text(String(asset.symbol.first ?? "?"))
                        .font(.titleMedium)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                )

            // Name and balance in UZS
            VStack(alignment: .leading, spacing: 2) {
                Text(asset.name)
                    .font(.titleSmall)
                    .foregroundColor(.textPrimary)

                Text(asset.balanceUzs)
                    .font(.bodySmall)
                    .foregroundColor(.textSecondary)
            }

            Spacer()

            // Crypto balance
            VStack(alignment: .trailing, spacing: 2) {
                Text(asset.balanceUzs)
                    .font(.titleSmall)
                    .foregroundColor(.textPrimary)

                Text(asset.balance)
                    .font(.bodySmall)
                    .foregroundColor(.textSecondary)
            }
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 8)
    }
}

#Preview {
    HomeView()
}
