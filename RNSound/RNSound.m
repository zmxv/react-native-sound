#import "RNSound.h"
#import <AVFoundation/AVFoundation.h>


@implementation RNSound {
  NSMutableArray* _playerPool;
  BOOL _enabled;
}

-(NSMutableArray*) playerPool {
  if (!_playerPool) {
    _playerPool = [[NSMutableArray alloc] init];
  }
  return _playerPool;
}

-(NSURL*) soundURL:(NSString*)fileName {
  return [[NSBundle mainBundle] URLForResource:[[fileName lastPathComponent]stringByDeletingPathExtension]
                                 withExtension:[fileName pathExtension]];
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(enable:(BOOL)enabled) {
  _enabled = enabled;
  AVAudioSession *session = [AVAudioSession sharedInstance];
  [session setCategory: AVAudioSessionCategoryAmbient error: nil];
  [session setActive: enabled error: nil];
}

RCT_EXPORT_METHOD(prepare:(NSString *)fileName) {
  AVAudioPlayer* player = [[AVAudioPlayer alloc] initWithContentsOfURL:[self soundURL:fileName] error:nil];
  [player prepareToPlay];
  [[self playerPool] addObject:player];
}

RCT_EXPORT_METHOD(play:(NSString *)fileName) {
  if (!_enabled) {
    return;
  }
  
  NSURL *soundURL = [self soundURL:fileName];
  
  for (AVAudioPlayer* player in [[self playerPool] mutableCopy]) {
    if (!player.playing && [player.url isEqual:soundURL]) {
      [player play];
      return;
    }
  }
  
  AVAudioPlayer* player = [[AVAudioPlayer alloc] initWithContentsOfURL:soundURL error:nil];
  [player play];
  [[self playerPool] addObject:player];
}


RCT_EXPORT_METHOD(stop:(NSString *)fileName) {
  for (AVAudioPlayer* player in [[self playerPool] mutableCopy]) {
    if (player.playing && [player.url isEqual:soundURL]) {
      [player stop];
      return;
    }
  }
}

@end
