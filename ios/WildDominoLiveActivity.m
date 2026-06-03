#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WildDominoLiveActivity, NSObject)

RCT_EXTERN_METHOD(startActivity:(NSString *)gameId
                  round:(NSNumber *)round
                  totalRounds:(NSNumber *)totalRounds
                  doubleOpener:(NSNumber *)doubleOpener
                  leaderName:(NSString *)leaderName
                  leaderScore:(NSNumber *)leaderScore
                  playersJSON:(NSString *)playersJSON)

RCT_EXTERN_METHOD(updateActivity:(NSNumber *)round
                  totalRounds:(NSNumber *)totalRounds
                  doubleOpener:(NSNumber *)doubleOpener
                  leaderName:(NSString *)leaderName
                  leaderScore:(NSNumber *)leaderScore
                  playersJSON:(NSString *)playersJSON
                  isFinished:(BOOL)isFinished)

RCT_EXTERN_METHOD(endActivity)

RCT_EXTERN_METHOD(writeTempFile:(NSString *)content
                  filename:(NSString *)filename
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
