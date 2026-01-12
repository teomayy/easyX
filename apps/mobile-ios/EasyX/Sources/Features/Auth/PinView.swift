import SwiftUI

struct PinView: View {
    let isCreating: Bool
    let onComplete: () -> Void

    @State private var pin = ""
    @State private var confirmPin = ""
    @State private var isConfirming = false
    @State private var errorMessage: String?
    @Environment(\.dismiss) private var dismiss

    private var currentPin: String {
        isConfirming ? confirmPin : pin
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: { dismiss() }) {
                    ZStack {
                        Circle()
                            .fill(Color.lime)
                            .frame(width: 40, height: 40)

                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.textOnLime)
                    }
                }

                Spacer()

                Button(action: {}) {
                    Text("Chiqish")
                        .font(.bodyMedium)
                        .foregroundColor(.info)
                }
            }
            .padding(.horizontal, 24)
            .padding(.top, 16)

            Spacer().frame(height: 64)

            // Title
            Text(titleText)
                .font(.headlineSmall)
                .foregroundColor(.textPrimary)

            Spacer().frame(height: 32)

            // PIN dots
            HStack(spacing: 16) {
                ForEach(0..<4, id: \.self) { index in
                    Circle()
                        .fill(index < currentPin.count ? Color.textPrimary : Color.cardBorder)
                        .frame(width: 16, height: 16)
                }
            }

            // Error message
            if let error = errorMessage {
                Text(error)
                    .font(.bodySmall)
                    .foregroundColor(.error)
                    .padding(.top, 16)
            }

            Spacer()

            // Number pad
            NumberPad(
                onNumberTap: { number in
                    handleNumberTap(number)
                },
                onBackspaceTap: {
                    handleBackspace()
                }
            )

            Spacer().frame(height: 32)
        }
        .background(Color.white)
        .navigationBarHidden(true)
    }

    private var titleText: String {
        if isCreating {
            return isConfirming ? "PIN-kodni tasdiqlang" : "PIN-kod yarating"
        } else {
            return "PIN-kodni kiriting"
        }
    }

    private func handleNumberTap(_ number: String) {
        guard currentPin.count < 4 else { return }

        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.impactOccurred()

        if isConfirming {
            confirmPin += number
        } else {
            pin += number
        }

        errorMessage = nil

        // Check if PIN is complete
        if currentPin.count == 4 {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                handlePinComplete()
            }
        }
    }

    private func handleBackspace() {
        if isConfirming {
            if !confirmPin.isEmpty {
                confirmPin.removeLast()
            }
        } else {
            if !pin.isEmpty {
                pin.removeLast()
            }
        }
    }

    private func handlePinComplete() {
        if isCreating {
            if !isConfirming {
                isConfirming = true
            } else {
                if pin == confirmPin {
                    // Save PIN and complete
                    onComplete()
                } else {
                    errorMessage = "PIN-kodlar mos kelmadi"
                    confirmPin = ""
                    let generator = UINotificationFeedbackGenerator()
                    generator.notificationOccurred(.error)
                }
            }
        } else {
            // Verify PIN
            onComplete()
        }
    }
}

struct NumberPad: View {
    let onNumberTap: (String) -> Void
    let onBackspaceTap: () -> Void

    private let numbers = [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
        ["", "0", "back"]
    ]

    var body: some View {
        VStack(spacing: 16) {
            ForEach(numbers, id: \.self) { row in
                HStack(spacing: 24) {
                    ForEach(row, id: \.self) { item in
                        if item.isEmpty {
                            Circle()
                                .fill(Color.clear)
                                .frame(width: 72, height: 72)
                        } else if item == "back" {
                            Button(action: onBackspaceTap) {
                                Circle()
                                    .fill(Color.clear)
                                    .frame(width: 72, height: 72)
                                    .overlay(
                                        Image(systemName: "delete.backward")
                                            .font(.system(size: 24))
                                            .foregroundColor(.textPrimary)
                                    )
                            }
                        } else {
                            Button(action: { onNumberTap(item) }) {
                                Circle()
                                    .fill(Color.lightGray)
                                    .frame(width: 72, height: 72)
                                    .overlay(
                                        Text(item)
                                            .font(.headlineMedium)
                                            .foregroundColor(.textPrimary)
                                    )
                            }
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 40)
    }
}

#Preview {
    PinView(isCreating: true, onComplete: {})
}
