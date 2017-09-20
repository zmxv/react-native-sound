#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif

#import <AVFoundation/AVFoundation.h>
#import <React/RCTEventEmitter.h>

@interface RNSound : RCTEventEmitter <RCTBridgeModule, AVAudioPlayerDelegate>

@end
