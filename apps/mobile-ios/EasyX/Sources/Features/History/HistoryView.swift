import SwiftUI

struct HistoryView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Spacer()

                Text("Tarix")
                    .font(.headlineMedium)
                    .foregroundColor(.textPrimary)

                Text("Tranzaksiya tarixi")
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
    HistoryView()
}
