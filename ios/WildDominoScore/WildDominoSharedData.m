#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WildDominoSharedData, NSObject)

RCT_EXTERN_METHOD(updateWidgetData:(NSString *)json)
RCT_EXTERN_METHOD(setLanguage:(NSString *)lang)

@end
