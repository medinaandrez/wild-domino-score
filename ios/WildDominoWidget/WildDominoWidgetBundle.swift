import WidgetKit
import SwiftUI

@main
struct WildDominoWidgetBundle: WidgetBundle {
  @WidgetBundleBuilder
  var body: some Widget {
    WildDominoWidget()
    if #available(iOS 16.2, *) {
      WildDominoLiveActivityWidget()
    }
  }
}
