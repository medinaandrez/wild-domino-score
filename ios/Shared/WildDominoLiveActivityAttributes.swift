import ActivityKit
import Foundation

@available(iOS 16.2, *)
struct WildDominoLiveAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var currentRound: Int
        var totalRounds: Int
        var doubleOpener: Int
        var leaderName: String
        var leaderScore: Int
        var players: [PlayerEntry]
        var isFinished: Bool

        struct PlayerEntry: Codable, Hashable {
            var name: String
            var score: Int
        }
    }
    var gameId: String
}
