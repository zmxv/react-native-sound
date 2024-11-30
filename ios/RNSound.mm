#import "RNSound.h"

#if __has_include("RCTUtils.h")
#import "RCTUtils.h"
#else
#import <React/RCTUtils.h>
#endif

@implementation RNSound {
    NSMutableDictionary *_playerPool;
    NSMutableDictionary *_callbackPool;
    double _key;  // Add this line to declare _key
}

RCT_EXPORT_MODULE()
@synthesize _key = _key;

- (NSArray<NSString *> *)supportedEvents {
  return @[
    @"onPlayChange"
  ];
}

#pragma mark - Audio Session Management

- (void)audioSessionChangeObserver:(NSNotification *)notification {
    NSDictionary *userInfo = notification.userInfo;
  
    
    AVAudioSessionRouteChangeReason routeChangeReason =
        (AVAudioSessionRouteChangeReason)[userInfo[@"AVAudioSessionRouteChangeReasonKey"] longValue];
    AVAudioSessionInterruptionType interruptionType =
        (AVAudioSessionInterruptionType)[userInfo[@"AVAudioSessionInterruptionTypeKey"] longValue];
    
    AVAudioPlayer *player = [self playerForKey:self._key];
    
    if (interruptionType == AVAudioSessionInterruptionTypeEnded && player) {
        [player play];
        [self setOnPlay:YES forPlayerKey:self._key];
    } else if (routeChangeReason == AVAudioSessionRouteChangeReasonOldDeviceUnavailable && player) {
        [player pause];
        [self setOnPlay:NO forPlayerKey:self._key];
    } else if (interruptionType == AVAudioSessionInterruptionTypeBegan && player) {
        [player pause];
        [self setOnPlay:NO forPlayerKey:self._key];
    }
}

#pragma mark - Player and Callback Management

- (NSMutableDictionary *)playerPool {
    if (!_playerPool) {
        _playerPool = [NSMutableDictionary new];
    }
    return _playerPool;
}

- (NSMutableDictionary *)callbackPool {
    if (!_callbackPool) {
        _callbackPool = [NSMutableDictionary new];
    }
    return _callbackPool;
}

- (AVAudioPlayer *)playerForKey:(double)key {
    NSNumber *keyNumber = @(key);
    return [[self playerPool] objectForKey:keyNumber];
}

- (NSNumber *)keyForPlayer:(AVAudioPlayer *)player {
    return [[[self playerPool] allKeysForObject:player] firstObject];
}

- (RCTResponseSenderBlock)callbackForKey:(NSNumber *)key {
    return [[self callbackPool] objectForKey:key];
}

- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer *)player
                       successfully:(BOOL)flag {
    @synchronized(self) {
        NSNumber *key = [self keyForPlayer:player];
        if (key == nil)
            return;
        [self setOnPlay:NO forPlayerKey:self._key];
        RCTResponseSenderBlock callback = [self callbackForKey:key];
        if (callback) {
            callback(
                [NSArray arrayWithObjects:[NSNumber numberWithBool:flag], nil]);
            [[self callbackPool] removeObjectForKey:key];
        }
    }
}

#pragma mark - File and Directory Access

- (NSString *)getDirectory:(NSSearchPathDirectory)directory {
    return [NSSearchPathForDirectoriesInDomains(directory, NSUserDomainMask, YES) firstObject];
}

- (NSDictionary *)constantsToExport {
    return @{
        @"IsAndroid": @NO,
        @"MainBundlePath": [[NSBundle mainBundle] bundlePath],
        @"NSDocumentDirectory": [self getDirectory:NSDocumentDirectory],
        @"NSLibraryDirectory": [self getDirectory:NSLibraryDirectory],
        @"NSCachesDirectory": [self getDirectory:NSCachesDirectory]
    };
}

#pragma mark - Audio Session Configuration

RCT_EXPORT_METHOD(enable : (BOOL)enabled) {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setCategory:AVAudioSessionCategoryAmbient error:nil];
    [session setActive:enabled error:nil];
}

RCT_EXPORT_METHOD(setActive:(BOOL)active) {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setActive:active error:nil];
}

RCT_EXPORT_METHOD(setMode:(NSString *)modeName) {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    NSString *mode = [self modeForName:modeName];
    if (mode) {
        [session setMode:mode error:nil];
    }
}

- (NSString *)modeForName:(NSString *)modeName {
    NSDictionary *modes = @{
        @"Default": AVAudioSessionModeDefault,
        @"VoiceChat": AVAudioSessionModeVoiceChat,
        @"VideoChat": AVAudioSessionModeVideoChat,
        @"GameChat": AVAudioSessionModeGameChat,
        @"VideoRecording": AVAudioSessionModeVideoRecording,
        @"Measurement": AVAudioSessionModeMeasurement,
        @"MoviePlayback": AVAudioSessionModeMoviePlayback,
        @"SpokenAudio": AVAudioSessionModeSpokenAudio
    };
    return modes[modeName];
}

RCT_EXPORT_METHOD(setCategory:(NSString *)categoryName mixWithOthers:(NSNumber *)mixWithOthers) {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    NSString *category = [self categoryForName:categoryName];
    
    if (category) {
        if (mixWithOthers.boolValue) {
            [session setCategory:category
                     withOptions:AVAudioSessionCategoryOptionMixWithOthers | AVAudioSessionCategoryOptionAllowBluetooth
                           error:nil];
        } else {
            [session setCategory:category error:nil];
        }
    }
}

- (NSString *)categoryForName:(NSString *)categoryName {
    NSDictionary *categories = @{
        @"Ambient": AVAudioSessionCategoryAmbient,
        @"SoloAmbient": AVAudioSessionCategorySoloAmbient,
        @"Playback": AVAudioSessionCategoryPlayback,
        @"Record": AVAudioSessionCategoryRecord,
        @"PlayAndRecord": AVAudioSessionCategoryPlayAndRecord,
        @"MultiRoute": AVAudioSessionCategoryMultiRoute
    };
    return categories[categoryName];
}

RCT_EXPORT_METHOD(enableInSilenceMode:(BOOL)enabled) {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setCategory:AVAudioSessionCategoryPlayback error:nil];
    [session setActive:enabled error:nil];
}

#pragma mark - Audio Control Methods

RCT_EXPORT_METHOD(prepare:(NSString *)fileName key:(double)key options:(JS::NativeSoundIOS::SoundOptionTypes &)options callback:(RCTResponseSenderBlock)callback ) {
    NSError *error;
    NSURL *fileNameUrl;
    AVAudioPlayer *player;
    
    if ([fileName hasPrefix:@"http"]) {
        fileNameUrl = [NSURL URLWithString:fileName];
        NSData *data = [NSData dataWithContentsOfURL:fileNameUrl];
        player = [[AVAudioPlayer alloc] initWithData:data error:&error];
    } else if ([fileName hasPrefix:@"ipod-library://"]) {
        fileNameUrl = [NSURL URLWithString:fileName];
        player = [[AVAudioPlayer alloc] initWithContentsOfURL:fileNameUrl
                                                        error:&error];
    } else {
        fileNameUrl = [NSURL URLWithString:fileName];
        player = [[AVAudioPlayer alloc] initWithContentsOfURL:fileNameUrl error:&error];
    }
    
    if (player) {
        @synchronized(self) {
            player.delegate = self;
            player.enableRate = YES;
            [player prepareToPlay];
            NSNumber *myNumber = @(key);
            [[self playerPool] setObject:player forKey:myNumber];
            callback(@[
                [NSNull null],
                @{
                    @"duration": @(player.duration),
                    @"numberOfChannels": @(player.numberOfChannels)
                }
            ]);
        }
    } else {
        callback(@[RCTJSErrorFromNSError(error)]);
    }
}

RCT_EXPORT_METHOD(play:(double)key callback:(RCTResponseSenderBlock)callback) {
    [[AVAudioSession sharedInstance] setActive:YES error:nil];
    
    [[NSNotificationCenter defaultCenter]
     addObserver:self
        selector:@selector(audioSessionChangeObserver:)
            name:AVAudioSessionRouteChangeNotification
          object:[AVAudioSession sharedInstance]];
    
    [[NSNotificationCenter defaultCenter]
     addObserver:self
        selector:@selector(audioSessionChangeObserver:)
            name:AVAudioSessionInterruptionNotification
          object:[AVAudioSession sharedInstance]];
    
    self._key = key;
    AVAudioPlayer *player = [self playerForKey:key];
    
    if (player) {
        NSNumber *myNumber = @(key);
        [[self callbackPool] setObject:[callback copy] forKey:myNumber];
        [player play];
        [self setOnPlay:YES forPlayerKey:key];
    }
}

RCT_EXPORT_METHOD(pause:(double)key callback:(RCTResponseSenderBlock)callback) {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        [player pause];
        callback(@[]);
    }
}

RCT_EXPORT_METHOD(stop:(double)key callback:(RCTResponseSenderBlock)callback) {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        [player stop];
        player.currentTime = 0;
        callback(@[]);
    }
}

RCT_EXPORT_METHOD(release:(double)key) {
    @synchronized(self) {
        AVAudioPlayer *player = [self playerForKey:key];
        if (player) {
            NSNumber *myNumber = @(key);
            [player stop];
            [[self callbackPool] removeObjectForKey:myNumber];
            [[self playerPool] removeObjectForKey:myNumber];
            [[NSNotificationCenter defaultCenter] removeObserver:self];
        }
    }
}

RCT_EXPORT_METHOD(setNumberOfLoops:(double)key loops:(double)loops) {
                 
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        NSNumber *myValue = @(loops);
        player.numberOfLoops = [myValue intValue];
    }
}

RCT_EXPORT_METHOD(setVolume:(double)key left:(double)left right:(double)right) {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        player.volume = (float)left;
    }
}

RCT_EXPORT_METHOD(getSystemVolume:(RCTResponseSenderBlock)callback) {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    callback(@[@(session.outputVolume)]);
}

RCT_EXPORT_METHOD(getCurrentTime:(double)key callback:(RCTResponseSenderBlock)callback) {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        callback([NSArray
            arrayWithObjects:[NSNumber numberWithDouble:player.currentTime],
                             [NSNumber numberWithBool:player.isPlaying], nil]);
    } else {
        callback([NSArray arrayWithObjects:[NSNumber numberWithInteger:-1],
                                           [NSNumber numberWithBool:NO], nil]);
    }
}

#pragma mark - Playback Controls


- (void)setCurrentTime:(double)key currentTime:(double)currentTime {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        player.currentTime = currentTime;
    }
}

- (void)setPan:(double)key pan:(double)pan {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        player.pan = (float)pan;
    }
}

- (void)setSpeakerPhone:(double)key isSpeaker:(BOOL)isSpeaker {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    
    if (isSpeaker) {
        [session overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker error:nil];
    } else {
        [session overrideOutputAudioPort:AVAudioSessionPortOverrideNone error:nil];
    }
    
    [session setActive:YES error:nil];
}

- (void)setSpeed:(double)key speed:(double)speed {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        player.rate = (float)speed;
    }
}

#pragma mark - Event Handling

- (NSDictionary *)getDirectories {
    return [self constantsToExport];
}

- (void)setOnPlay:(BOOL)isPlaying forPlayerKey:(double)playerKey {
    [self sendEventWithName:@"onPlayChange"
                       body:@{
                           @"isPlaying": @(isPlaying),
                           @"playerKey": @(playerKey)
                       }];
}

#pragma mark - Turbo Module

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::NativeSoundIOSSpecJSI>(params);
}
#endif

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

@end
