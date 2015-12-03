#import "RNSound.h"
#import <AVFoundation/AVFoundation.h>


@implementation RNSound {
  NSMutableDictionary* _playerPool;
}

-(NSMutableDictionary*) playerPool {
  if (!_playerPool) {
    _playerPool = [[NSMutableDictionary alloc] init];
  }
  return _playerPool;
}

-(AVAudioPlayer*) playerForKey:(nonnull NSNumber*)key {
  return [[self playerPool] objectForKey:key];
}

-(NSString *) getDirectory:(int)directory {
  return [NSSearchPathForDirectoriesInDomains(directory, NSUserDomainMask, YES) firstObject];
}

RCT_EXPORT_MODULE();

-(NSDictionary *)constantsToExport {
  return @{@"MainBundlePath": [[NSBundle mainBundle] bundlePath],
           @"NSDocumentDirectory": [self getDirectory:NSDocumentDirectory],
           @"NSLibraryDirectory": [self getDirectory:NSLibraryDirectory],
           @"NSCachesDirectory": [self getDirectory:NSCachesDirectory],
           };
}

RCT_EXPORT_METHOD(enable:(BOOL)enabled) {
  AVAudioSession *session = [AVAudioSession sharedInstance];
  [session setCategory: AVAudioSessionCategoryAmbient error: nil];
  [session setActive: enabled error: nil];
}

RCT_EXPORT_METHOD(prepare:(NSString*)fileName withKey:(nonnull NSNumber*)key
                  withCallback:(RCTResponseSenderBlock)callback) {
  NSError* error;
  AVAudioPlayer* player = [[AVAudioPlayer alloc]
                           initWithContentsOfURL:[NSURL fileURLWithPath:fileName] error:&error];
  if (player) {
    [player prepareToPlay];
    [[self playerPool] setObject:player forKey:key];
    callback(@[[NSNull null]]);
  } else {
    callback(@[@{@"code": @(error.code),
                 @"description": error.localizedDescription}]);
  }
}

RCT_EXPORT_METHOD(play:(nonnull NSNumber*)key) {
  AVAudioPlayer* player = [self playerForKey:key];
  if (player) {
    [player play];
  }
}

RCT_EXPORT_METHOD(pause:(nonnull NSNumber*)key) {
  AVAudioPlayer* player = [self playerForKey:key];
  if (player) {
    [player pause];
  }
}

RCT_EXPORT_METHOD(stop:(nonnull NSNumber*)key) {
  AVAudioPlayer* player = [self playerForKey:key];
  if (player) {
    [player stop];
  }
}

RCT_EXPORT_METHOD(release:(nonnull NSNumber*)key) {
  AVAudioPlayer* player = [self playerForKey:key];
  if (player) {
    [player stop];
    [[self playerPool] removeObjectForKey:key];
  }
}

@end
