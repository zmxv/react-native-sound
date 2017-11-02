#if __has_include(<React/RCTBridgeModule.h>)
    #import <React/RCTBridgeModule.h>
#else
    #import "RCTBridgeModule.h"
#endif

#import <AVFoundation/AVFoundation.h>
#import <React/RCTEventEmitter.h>

@interface RNSound : RCTEventEmitter <RCTBridgeModule, AVAudioPlayerDelegate>

@end
