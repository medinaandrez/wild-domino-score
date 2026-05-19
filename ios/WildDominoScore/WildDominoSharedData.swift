import Foundation
import WidgetKit

@objc(WildDominoSharedData)
class WildDominoSharedData: NSObject {

  private static let appGroupID = "group.com.spinnerscorekeeper.app"
  private static let dataKey    = "wildDominoWidgetData"
  private static let langKey    = "widgetLanguage"

  /// Called from JS: serialized game state JSON → shared UserDefaults → widget reload.
  @objc func updateWidgetData(_ json: String) {
    let defaults = UserDefaults(suiteName: Self.appGroupID)
    defaults?.set(json, forKey: Self.dataKey)
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
  }

  /// Called from JS when the app language changes.
  @objc func setLanguage(_ lang: String) {
    let defaults = UserDefaults(suiteName: Self.appGroupID)
    defaults?.set(lang, forKey: Self.langKey)
  }

  @objc static func requiresMainQueueSetup() -> Bool { false }
}
