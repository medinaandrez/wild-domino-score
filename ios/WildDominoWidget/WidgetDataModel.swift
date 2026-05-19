import Foundation

// MARK: - Shared data model read by the widget

struct PlayerRank: Decodable {
  let name: String
  let total: Int
}

struct WidgetData: Decodable {
  let hasGame: Bool
  let language: String
  let isFinished: Bool?
  let currentRound: Int?
  let totalRounds: Int?
  let doubleOpener: Int?
  let rankings: [PlayerRank]?

  static let noGame = WidgetData(
    hasGame: false,
    language: "es",
    isFinished: nil,
    currentRound: nil,
    totalRounds: nil,
    doubleOpener: nil,
    rankings: nil
  )
}

// MARK: - App Group helpers

enum SharedStore {
  static let appGroupID = "group.com.spinnerscorekeeper.app"
  static let dataKey    = "wildDominoWidgetData"

  static func loadWidgetData() -> WidgetData {
    guard
      let defaults = UserDefaults(suiteName: appGroupID),
      let json = defaults.string(forKey: dataKey),
      let data = json.data(using: .utf8),
      let decoded = try? JSONDecoder().decode(WidgetData.self, from: data)
    else {
      return .noGame
    }
    return decoded
  }
}

// MARK: - Localisation

struct L10n {
  let noGame: String
  let round: String       // "Ronda" / "Round"
  let of: String          // "de" / "of"
  let double: String      // "Doble" / "Double"
  let finished: String    // "Partida terminada" / "Game finished"
  let winner: String      // "Ganador" / "Winner"

  static func forLanguage(_ lang: String) -> L10n {
    if lang == "en" {
      return L10n(
        noGame: "No active game",
        round: "Round",
        of: "of",
        double: "Double",
        finished: "Game finished",
        winner: "Winner"
      )
    }
    return L10n(
      noGame: "Sin partida activa",
      round: "Ronda",
      of: "de",
      double: "Doble",
      finished: "Partida terminada",
      winner: "Ganador"
    )
  }
}
