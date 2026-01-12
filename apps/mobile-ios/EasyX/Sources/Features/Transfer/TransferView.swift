import SwiftUI

struct TransferView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Spacer()

                Text("O'tkazma")
                    .font(.headlineMedium)
                    .foregroundColor(.textPrimary)

                Text("P2P o'tkazmalar")
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
    TransferView()
}
