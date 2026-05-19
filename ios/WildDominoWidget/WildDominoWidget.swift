import WidgetKit
import SwiftUI

// MARK: - Timeline Provider

struct WildDominoEntry: TimelineEntry {
  let date: Date
  let data: WidgetData
}

struct WildDominoProvider: TimelineProvider {
  func placeholder(in context: Context) -> WildDominoEntry {
    WildDominoEntry(date: .now, data: .noGame)
  }

  func getSnapshot(in context: Context, completion: @escaping (WildDominoEntry) -> Void) {
    completion(WildDominoEntry(date: .now, data: SharedStore.loadWidgetData()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<WildDominoEntry>) -> Void) {
    let entry = WildDominoEntry(date: .now, data: SharedStore.loadWidgetData())
    let nextRefresh = Calendar.current.date(byAdding: .minute, value: 30, to: .now)!
    completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
  }
}

// MARK: - Colour palette (matches app)

extension Color {
  static let dominoGreen   = Color(red: 0.18, green: 0.60, blue: 0.35)
  static let dominoGreenDk = Color(red: 0.10, green: 0.40, blue: 0.24)
  static let dominoYellow  = Color(red: 0.98, green: 0.82, blue: 0.20)
  static let rankGold      = Color(red: 1.00, green: 0.84, blue: 0.00)
  static let rankSilver    = Color(red: 0.75, green: 0.75, blue: 0.75)
  static let rankBronze    = Color(red: 0.80, green: 0.50, blue: 0.20)
}

// MARK: - Rank badge colour helper

func badgeColor(for index: Int) -> Color {
  switch index {
  case 0: return .rankGold
  case 1: return .rankSilver
  case 2: return .rankBronze
  default: return Color.white.opacity(0.25)
  }
}

// MARK: - Small widget

struct SmallWidgetView: View {
  let data: WidgetData
  let l: L10n

  var body: some View {
    if !data.hasGame {
      VStack(spacing: 4) {
        Image(systemName: "rectangle.grid.2x2")
          .font(.system(size: 22))
          .foregroundColor(.dominoYellow)
        Text(l.noGame)
          .font(.system(size: 11, weight: .medium))
          .foregroundColor(.white.opacity(0.8))
          .multilineTextAlignment(.center)
      }
      .padding(12)
    } else if let finished = data.isFinished, finished {
      VStack(spacing: 4) {
        Text("🏆")
          .font(.system(size: 24))
        Text(l.finished)
          .font(.system(size: 10, weight: .bold))
          .foregroundColor(.dominoYellow)
        if let winner = data.rankings?.first {
          Text(winner.name)
            .font(.system(size: 13, weight: .bold))
            .foregroundColor(.white)
            .lineLimit(1)
            .minimumScaleFactor(0.7)
          Text("\(winner.total) pts")
            .font(.system(size: 11))
            .foregroundColor(.white.opacity(0.8))
        }
      }
      .padding(10)
    } else {
      VStack(alignment: .leading, spacing: 4) {
        HStack(spacing: 4) {
          Image(systemName: "gamecontroller.fill")
            .font(.system(size: 10))
            .foregroundColor(.dominoYellow)
          Text("Wild Domino")
            .font(.system(size: 10, weight: .semibold))
            .foregroundColor(.dominoYellow)
        }

        Spacer()

        if let cr = data.currentRound, let tr = data.totalRounds {
          Text("\(l.round) \(cr)/\(tr)")
            .font(.system(size: 13, weight: .bold))
            .foregroundColor(.white)
        }

        if let d = data.doubleOpener {
          HStack(spacing: 3) {
            RoundedRectangle(cornerRadius: 3)
              .fill(Color.white.opacity(0.15))
              .frame(width: 28, height: 18)
              .overlay(
                Text("\(d)")
                  .font(.system(size: 12, weight: .bold))
                  .foregroundColor(.dominoYellow)
              )
            Text(l.double)
              .font(.system(size: 10))
              .foregroundColor(.white.opacity(0.7))
          }
        }

        Spacer()

        if let leader = data.rankings?.first {
          HStack(spacing: 3) {
            Text("🥇")
              .font(.system(size: 11))
            Text(leader.name)
              .font(.system(size: 11, weight: .semibold))
              .foregroundColor(.white)
              .lineLimit(1)
              .minimumScaleFactor(0.6)
          }
          Text("\(leader.total) pts")
            .font(.system(size: 10))
            .foregroundColor(.white.opacity(0.75))
        }
      }
      .padding(12)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
  }
}

// MARK: - Medium widget

struct MediumWidgetView: View {
  let data: WidgetData
  let l: L10n

  var body: some View {
    if !data.hasGame {
      VStack(spacing: 6) {
        Image(systemName: "rectangle.grid.2x2")
          .font(.system(size: 28))
          .foregroundColor(.dominoYellow)
        Text(l.noGame)
          .font(.system(size: 13, weight: .medium))
          .foregroundColor(.white.opacity(0.8))
      }
    } else {
      HStack(spacing: 0) {
        // Left column — round info
        VStack(alignment: .leading, spacing: 6) {
          HStack(spacing: 4) {
            Image(systemName: "gamecontroller.fill")
              .font(.system(size: 10))
              .foregroundColor(.dominoYellow)
            Text("Wild Domino")
              .font(.system(size: 10, weight: .semibold))
              .foregroundColor(.dominoYellow)
          }

          Spacer()

          if let finished = data.isFinished, finished {
            Text("🏆")
              .font(.system(size: 22))
            Text(l.finished)
              .font(.system(size: 11, weight: .bold))
              .foregroundColor(.dominoYellow)
          } else {
            if let cr = data.currentRound, let tr = data.totalRounds {
              Text("\(l.round)")
                .font(.system(size: 10))
                .foregroundColor(.white.opacity(0.7))
              Text("\(cr) \(l.of) \(tr)")
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(.white)
            }
            if let d = data.doubleOpener {
              HStack(spacing: 4) {
                RoundedRectangle(cornerRadius: 4)
                  .fill(Color.white.opacity(0.15))
                  .frame(width: 28, height: 20)
                  .overlay(
                    Text("\(d)")
                      .font(.system(size: 13, weight: .bold))
                      .foregroundColor(.dominoYellow)
                  )
                Text(l.double)
                  .font(.system(size: 10))
                  .foregroundColor(.white.opacity(0.7))
              }
            }
          }
          Spacer()
        }
        .padding(.leading, 14)
        .padding(.vertical, 12)
        .frame(maxHeight: .infinity)

        Divider()
          .background(Color.white.opacity(0.3))
          .padding(.vertical, 10)

        // Right column — rankings
        VStack(alignment: .leading, spacing: 4) {
          ForEach(Array((data.rankings ?? []).prefix(4).enumerated()), id: \.offset) { idx, player in
            HStack(spacing: 6) {
              Circle()
                .fill(badgeColor(for: idx))
                .frame(width: 18, height: 18)
                .overlay(
                  Text("\(idx + 1)")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(idx == 0 ? .black : .white)
                )
              Text(player.name)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.white)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
              Spacer()
              Text("\(player.total)")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.white.opacity(0.9))
            }
          }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 12)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
      }
    }
  }
}

// MARK: - Large widget

struct LargeWidgetView: View {
  let data: WidgetData
  let l: L10n

  var body: some View {
    if !data.hasGame {
      VStack(spacing: 10) {
        Image(systemName: "rectangle.grid.2x2")
          .font(.system(size: 36))
          .foregroundColor(.dominoYellow)
        Text(l.noGame)
          .font(.system(size: 15, weight: .medium))
          .foregroundColor(.white.opacity(0.8))
      }
    } else {
      VStack(alignment: .leading, spacing: 0) {
        HStack {
          Image(systemName: "gamecontroller.fill")
            .foregroundColor(.dominoYellow)
          Text("Wild Domino")
            .font(.system(size: 14, weight: .bold))
            .foregroundColor(.dominoYellow)
          Spacer()
          if let finished = data.isFinished, finished {
            Text("🏆 \(l.finished)")
              .font(.system(size: 12, weight: .semibold))
              .foregroundColor(.dominoYellow)
          } else if let cr = data.currentRound, let tr = data.totalRounds {
            Text("\(l.round) \(cr)/\(tr)")
              .font(.system(size: 13, weight: .semibold))
              .foregroundColor(.white)
          }
        }
        .padding(.horizontal, 16)
        .padding(.top, 16)
        .padding(.bottom, 8)

        if let d = data.doubleOpener, !(data.isFinished ?? false) {
          HStack(spacing: 8) {
            RoundedRectangle(cornerRadius: 6)
              .fill(Color.white.opacity(0.15))
              .frame(width: 36, height: 26)
              .overlay(
                Text("\(d)")
                  .font(.system(size: 16, weight: .bold))
                  .foregroundColor(.dominoYellow)
              )
            Text(l.double)
              .font(.system(size: 12))
              .foregroundColor(.white.opacity(0.7))
          }
          .padding(.horizontal, 16)
          .padding(.bottom, 10)
        }

        Divider()
          .background(Color.white.opacity(0.3))
          .padding(.horizontal, 16)

        VStack(alignment: .leading, spacing: 6) {
          ForEach(Array((data.rankings ?? []).enumerated()), id: \.offset) { idx, player in
            HStack(spacing: 10) {
              Circle()
                .fill(badgeColor(for: idx))
                .frame(width: 24, height: 24)
                .overlay(
                  Text("\(idx + 1)")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(idx == 0 ? .black : .white)
                )
              Text(player.name)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
              Spacer()
              Text("\(player.total) pts")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.white.opacity(0.9))
            }
            .padding(.horizontal, 16)

            if idx < (data.rankings?.count ?? 0) - 1 {
              Divider()
                .background(Color.white.opacity(0.15))
                .padding(.leading, 50)
            }
          }
        }
        .padding(.top, 10)
        .padding(.bottom, 16)

        Spacer(minLength: 0)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
  }
}

// MARK: - Widget entry view (dispatches by family)

struct WildDominoWidgetEntryView: View {
  let entry: WildDominoEntry
  @Environment(\.widgetFamily) var family

  var body: some View {
    let l = L10n.forLanguage(entry.data.language)
    switch family {
    case .systemSmall:
      SmallWidgetView(data: entry.data, l: l)
    case .systemMedium:
      MediumWidgetView(data: entry.data, l: l)
    case .systemLarge:
      LargeWidgetView(data: entry.data, l: l)
    default:
      SmallWidgetView(data: entry.data, l: l)
    }
  }
}

// MARK: - Widget declaration

struct WildDominoWidget: Widget {
  let kind = "WildDominoWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: WildDominoProvider()) { entry in
      WildDominoWidgetEntryView(entry: entry)
        .containerBackground(for: .widget) {
          LinearGradient(
            colors: [.dominoGreenDk, .dominoGreen],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
          )
        }
    }
    .configurationDisplayName("Wild Domino Score")
    .description("Puntajes en tiempo real · Live scores")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}
