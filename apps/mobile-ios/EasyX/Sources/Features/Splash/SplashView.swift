import SwiftUI

struct SplashView: View {
    let onContinue: () -> Void
    @State private var logoOpacity: Double = 0
    @State private var logoScale: CGFloat = 0.8

    var body: some View {
        ZStack {
            // Background
            Color.darkNavy
                .ignoresSafeArea()

            VStack {
                Spacer()

                // Logo with glow effect
                VStack(spacing: 24) {
                    ZStack {
                        // Glow background
                        RoundedRectangle(cornerRadius: 24)
                            .fill(Color.lime.opacity(0.25))
                            .frame(width: 100, height: 100)
                            .shadow(color: Color.lime.opacity(0.5), radius: 40, x: 0, y: 0)
                            .shadow(color: Color.lime.opacity(0.3), radius: 80, x: 0, y: 0)

                        // Logo icon
                        RoundedRectangle(cornerRadius: 24)
                            .strokeBorder(Color.lime, lineWidth: 1)
                            .background(
                                RoundedRectangle(cornerRadius: 24)
                                    .fill(Color.limeGlowGradient)
                            )
                            .frame(width: 100, height: 100)

                        // X symbol
                        Text("X")
                            .font(.system(size: 48, weight: .bold))
                            .foregroundColor(.lime)
                    }

                    // Brand name
                    Text("EasyX")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(.lime)
                }
                .opacity(logoOpacity)
                .scaleEffect(logoScale)

                Spacer()

                // Continue button
                PrimaryButton(title: "Davom etish", action: onContinue)
                    .padding(.horizontal, 24)
                    .padding(.bottom, 48)
                    .opacity(logoOpacity)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.8)) {
                logoOpacity = 1
                logoScale = 1
            }
        }
    }
}

#Preview {
    SplashView(onContinue: {})
}
