import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - Lock Screen / Notification Banner

@available(iOS 16.2, *)
struct LiveActivityBannerView: View {
    let state: WildDominoLiveAttributes.ContentState

    var sorted: [WildDominoLiveAttributes.ContentState.PlayerEntry] {
        state.players.sorted { $0.score < $1.score }
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text("🎲")
                if state.isFinished {
                    Text("Partida finalizada")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.dominoYellow)
                } else {
                    Text("Ronda \(state.currentRound) — Doble \(state.doubleOpener)")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.dominoYellow)
                }
                Spacer()
                if !state.isFinished {
                    Text("\(state.currentRound)/\(state.totalRounds)")
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.6))
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 14)
            .padding(.bottom, 8)

            Divider().background(Color.white.opacity(0.2))

            VStack(spacing: 5) {
                ForEach(Array(sorted.prefix(4).enumerated()), id: \.offset) { idx, player in
                    HStack(spacing: 8) {
                        Text(idx == 0 ? "🏆" : "\(idx + 1).")
                            .font(.system(size: 11))
                            .frame(width: 22, alignment: .leading)
                        Text(player.name)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.white)
                            .lineLimit(1)
                        Spacer()
                        Text("\(player.score) pts")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(idx == 0 ? .dominoYellow : .white.opacity(0.8))
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
        }
        .background(
            LinearGradient(
                colors: [Color(red: 0.10, green: 0.40, blue: 0.24),
                         Color(red: 0.18, green: 0.60, blue: 0.35)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
}

// MARK: - Live Activity Widget

@available(iOS 16.2, *)
struct WildDominoLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: WildDominoLiveAttributes.self) { context in
            LiveActivityBannerView(state: context.state)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 4) {
                        Text("🎲").font(.system(size: 14))
                        Text("Ronda \(context.state.currentRound)")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.dominoYellow)
                    }
                    .padding(.leading, 8)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(context.state.currentRound)/\(context.state.totalRounds)")
                        .font(.system(size: 13))
                        .foregroundColor(.white.opacity(0.6))
                        .padding(.trailing, 8)
                }
                DynamicIslandExpandedRegion(.center) {
                    Text("Doble \(context.state.doubleOpener)")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.dominoYellow)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(spacing: 6) {
                        ForEach(
                            Array(context.state.players
                                .sorted { $0.score < $1.score }
                                .prefix(3)
                                .enumerated()),
                            id: \.offset
                        ) { idx, player in
                            HStack(spacing: 8) {
                                Text(idx == 0 ? "🏆" : "\(idx + 1).")
                                    .font(.system(size: 11))
                                    .frame(width: 20)
                                Text(player.name)
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(.white)
                                    .lineLimit(1)
                                Spacer()
                                Text("\(player.score)")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(idx == 0 ? .dominoYellow : .white.opacity(0.8))
                            }
                        }
                    }
                    .padding(.horizontal, 14)
                    .padding(.bottom, 10)
                }
            } compactLeading: {
                HStack(spacing: 3) {
                    Text("🎲").font(.system(size: 11))
                    Text("R\(context.state.currentRound)")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.dominoYellow)
                }
                .padding(.leading, 4)
            } compactTrailing: {
                HStack(spacing: 3) {
                    Text(context.state.leaderName)
                        .font(.system(size: 12, weight: .semibold))
                        .lineLimit(1)
                        .foregroundColor(.white)
                    Text("\(context.state.leaderScore)")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.dominoYellow)
                }
                .padding(.trailing, 4)
            } minimal: {
                Text("R\(context.state.currentRound)")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.dominoYellow)
            }
        }
    }
}
