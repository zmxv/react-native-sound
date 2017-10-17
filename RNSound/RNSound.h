#if __has_include("RCTBridgeModule.h")
    #import "RCTBridgeModule.h"
#else
    #import <React/RCTBridgeModule.h>
#endif

#import <AVFoundation/AVFoundation.h>

@interface RNSound : NSObject <RCTBridgeModule, AVAudioPlayerDelegate>

@end
