import ActivityKit
import Foundation

@objc(WildDominoLiveActivity)
class WildDominoLiveActivity: NSObject {

    private var activityID: String?

    @objc func startActivity(
        _ gameId: String,
        round: NSNumber,
        totalRounds: NSNumber,
        doubleOpener: NSNumber,
        leaderName: String,
        leaderScore: NSNumber,
        playersJSON: String
    ) {
        if #available(iOS 16.2, *) {
            _start(gameId: gameId,
                   round: round.intValue,
                   totalRounds: totalRounds.intValue,
                   doubleOpener: doubleOpener.intValue,
                   leaderName: leaderName,
                   leaderScore: leaderScore.intValue,
                   playersJSON: playersJSON)
        }
    }

    @objc func updateActivity(
        _ round: NSNumber,
        totalRounds: NSNumber,
        doubleOpener: NSNumber,
        leaderName: String,
        leaderScore: NSNumber,
        playersJSON: String,
        isFinished: Bool
    ) {
        if #available(iOS 16.2, *) {
            _update(round: round.intValue,
                    totalRounds: totalRounds.intValue,
                    doubleOpener: doubleOpener.intValue,
                    leaderName: leaderName,
                    leaderScore: leaderScore.intValue,
                    playersJSON: playersJSON,
                    isFinished: isFinished)
        }
    }

    @objc func endActivity() {
        if #available(iOS 16.2, *) {
            _end()
        }
    }

    @objc static func requiresMainQueueSetup() -> Bool { false }

    // MARK: - Private iOS 16.2+ implementations

    @available(iOS 16.2, *)
    private func _start(
        gameId: String, round: Int, totalRounds: Int, doubleOpener: Int,
        leaderName: String, leaderScore: Int, playersJSON: String
    ) {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }

        let initialState = WildDominoLiveAttributes.ContentState(
            currentRound: round,
            totalRounds: totalRounds,
            doubleOpener: doubleOpener,
            leaderName: leaderName,
            leaderScore: leaderScore,
            players: parsePlayers(playersJSON),
            isFinished: false
        )

        do {
            let activity = try Activity<WildDominoLiveAttributes>.request(
                attributes: WildDominoLiveAttributes(gameId: gameId),
                contentState: initialState,
                pushType: nil
            )
            activityID = activity.id
        } catch {}
    }

    @available(iOS 16.2, *)
    private func _update(
        round: Int, totalRounds: Int, doubleOpener: Int,
        leaderName: String, leaderScore: Int, playersJSON: String, isFinished: Bool
    ) {
        guard let id = activityID else { return }
        let state = WildDominoLiveAttributes.ContentState(
            currentRound: round,
            totalRounds: totalRounds,
            doubleOpener: doubleOpener,
            leaderName: leaderName,
            leaderScore: leaderScore,
            players: parsePlayers(playersJSON),
            isFinished: isFinished
        )
        Task {
            for activity in Activity<WildDominoLiveAttributes>.activities where activity.id == id {
                if isFinished {
                    // Show final result for 6 seconds then dismiss automatically
                    await activity.end(
                        ActivityContent(state: state, staleDate: nil),
                        dismissalPolicy: .after(Date.now + 6)
                    )
                } else {
                    await activity.update(ActivityContent(state: state, staleDate: nil))
                }
            }
        }
        if isFinished { activityID = nil }
    }

    @available(iOS 16.2, *)
    private func _end() {
        guard let id = activityID else { return }
        Task {
            for activity in Activity<WildDominoLiveAttributes>.activities where activity.id == id {
                await activity.end(dismissalPolicy: .immediate)
            }
        }
        activityID = nil
    }

    @available(iOS 16.2, *)
    private func parsePlayers(_ json: String) -> [WildDominoLiveAttributes.ContentState.PlayerEntry] {
        struct P: Codable { var name: String; var score: Int }
        guard let data = json.data(using: .utf8),
              let parsed = try? JSONDecoder().decode([P].self, from: data) else { return [] }
        return parsed.map { WildDominoLiveAttributes.ContentState.PlayerEntry(name: $0.name, score: $0.score) }
    }
}
