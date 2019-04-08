#if __has_include("RCTBridgeModule.h")
    #import "RCTBridgeModule.h"
#else
    #import <React/RCTBridgeModule.h>
#endif

#import <AVFoundation/AVFoundation.h>

#if __has_include(<React/RCTEventEmitter.h>)
#import <React/RCTEventEmitter.h>
#else
#import "RCTEventEmitter.h"
#endif

@interface RNSound : RCTEventEmitter <RCTBridgeModule, AVAudioPlayerDelegate>
@property (nonatomic, weak) NSNumber* _key;
@end
