import SwiftUI

struct OnboardingPage: Identifiable {
    let id = UUID()
    let title: String
    let description: String
}

struct OnboardingView: View {
    let onComplete: () -> Void

    @State private var currentPage = 0

    private let pages = [
        OnboardingPage(
            title: "Istalgan paytda soting va sotib oling!",
            description: "Kriptovalyutalarni tez va oson almashiring"
        ),
        OnboardingPage(
            title: "Xavfsiz tranzaksiyalar",
            description: "Barcha operatsiyalar shifrlangan va himoyalangan"
        ),
        OnboardingPage(
            title: "Qulay interfeys",
            description: "Oddiy va tushunarli dizayn bilan ishlang"
        )
    ]

    var body: some View {
        VStack {
            TabView(selection: $currentPage) {
                ForEach(Array(pages.enumerated()), id: \.element.id) { index, page in
                    OnboardingPageView(page: page)
                        .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))

            // Page indicators
            HStack(spacing: 8) {
                ForEach(0..<pages.count, id: \.self) { index in
                    Capsule()
                        .fill(index == currentPage ? Color.darkNavy : Color.textSecondary.opacity(0.3))
                        .frame(width: index == currentPage ? 24 : 8, height: 8)
                        .animation(.easeInOut(duration: 0.2), value: currentPage)
                }
            }
            .padding(.vertical, 24)

            PrimaryButton(
                title: currentPage == pages.count - 1 ? "Boshlash" : "Davom etish",
                action: {
                    if currentPage == pages.count - 1 {
                        onComplete()
                    } else {
                        withAnimation {
                            currentPage += 1
                        }
                    }
                }
            )
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
        .background(Color.white)
    }
}

struct OnboardingPageView: View {
    let page: OnboardingPage

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            // Illustration placeholder
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.lightGray)
                .frame(height: 300)
                .padding(.horizontal, 32)
                .overlay(
                    Text("Illustration")
                        .foregroundColor(.textSecondary)
                )

            Spacer()
                .frame(height: 48)

            Text(page.title)
                .font(.headlineSmall)
                .multilineTextAlignment(.center)
                .foregroundColor(.textPrimary)
                .padding(.horizontal, 24)

            Spacer()
                .frame(height: 16)

            Text(page.description)
                .font(.bodyLarge)
                .multilineTextAlignment(.center)
                .foregroundColor(.textSecondary)
                .padding(.horizontal: 48)

            Spacer()
        }
    }
}

#Preview {
    OnboardingView(onComplete: {})
}
