// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "EasyX",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "EasyX",
            targets: ["EasyX"]
        ),
    ],
    dependencies: [
        // Dependencies can be added here
    ],
    targets: [
        .target(
            name: "EasyX",
            dependencies: [],
            path: "EasyX/Sources"
        ),
        .testTarget(
            name: "EasyXTests",
            dependencies: ["EasyX"]
        ),
    ]
)
