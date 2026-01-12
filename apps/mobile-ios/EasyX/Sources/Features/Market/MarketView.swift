import SwiftUI

struct MarketView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Spacer()

                Text("Bozor")
                    .font(.headlineMedium)
                    .foregroundColor(.textPrimary)

                Text("Kriptovalyuta kurslari")
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
    MarketView()
}
