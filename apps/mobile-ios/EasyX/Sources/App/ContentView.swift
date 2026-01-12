import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @State private var showSplash = true

    var body: some View {
        ZStack {
            if showSplash {
                SplashView(onContinue: {
                    withAnimation {
                        showSplash = false
                    }
                })
            } else if !appState.hasCompletedOnboarding {
                OnboardingView(onComplete: {
                    appState.hasCompletedOnboarding = true
                    UserDefaults.standard.set(true, forKey: "hasCompletedOnboarding")
                })
            } else if !appState.isLoggedIn {
                LoginView(onLogin: {
                    appState.isLoggedIn = true
                })
            } else {
                MainTabView()
            }
        }
    }
}

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Asosiy", systemImage: "chart.line.uptrend.xyaxis")
                }
                .tag(0)

            TradeView()
                .tabItem {
                    Label("Savdo", systemImage: "arrow.up.arrow.down")
                }
                .tag(1)

            MarketView()
                .tabItem {
                    Label("Bozor", systemImage: "chart.bar")
                }
                .tag(2)

            TransferView()
                .tabItem {
                    Label("O'tkazma", systemImage: "arrow.left.arrow.right")
                }
                .tag(3)

            HistoryView()
                .tabItem {
                    Label("Tarix", systemImage: "clock")
                }
                .tag(4)
        }
        .tint(Color.lime)
    }
}

#Preview {
    ContentView()
        .environmentObject(AppState())
}
