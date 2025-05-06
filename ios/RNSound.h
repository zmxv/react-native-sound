#import <AVFoundation/AVFoundation.h>
#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
  #import <RNSoundSpec/RNSoundSpec.h>

@interface RNSound : RCTEventEmitter  <NativeSoundIOSSpec,AVAudioPlayerDelegate>
#else
#import <React/RCTBridgeModule.h>
@interface RNSound : RCTEventEmitter <RCTBridgeModule, AVAudioPlayerDelegate>
#endif

@property (nonatomic, assign) double _key;

@end
