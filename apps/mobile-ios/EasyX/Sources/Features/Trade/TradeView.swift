import SwiftUI

struct TradeView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Spacer()

                Text("Savdo")
                    .font(.headlineMedium)
                    .foregroundColor(.textPrimary)

                Text("Tez kunda...")
                    .font(.bodyLarge)
                    .foregroundColor(.textSecondary)

                Spacer()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.white)
        }
    }
}

#Preview {
    TradeView()
}
