import SwiftUI

@main
struct EasyXApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
        }
    }
}

class AppState: ObservableObject {
    @Published var isLoggedIn: Bool = false
    @Published var hasCompletedOnboarding: Bool = false
    @Published var currentUser: User?

    init() {
        // Check stored authentication state
        checkAuthState()
    }

    private func checkAuthState() {
        // Check UserDefaults or Keychain for auth token
        if let _ = UserDefaults.standard.string(forKey: "authToken") {
            isLoggedIn = true
        }
        hasCompletedOnboarding = UserDefaults.standard.bool(forKey: "hasCompletedOnboarding")
    }

    func logout() {
        isLoggedIn = false
        currentUser = nil
        UserDefaults.standard.removeObject(forKey: "authToken")
    }
}

struct User: Codable, Identifiable {
    let id: String
    let name: String
    let phone: String
    let uid: String
    let avatarUrl: String?
}
