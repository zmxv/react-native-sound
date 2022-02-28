#import "RNSound.h"

#if __has_include("RCTUtils.h")
#import "RCTUtils.h"
#else
#import <React/RCTUtils.h>
#endif

@implementation RNSound {
    NSMutableDictionary *_playerPool;
    NSMutableDictionary *_callbackPool;
}

@synthesize _key = _key;

- (void)audioSessionChangeObserver:(NSNotification *)notification {
    // For the AmiGO use cases it makes more sense to only stop playing a sound
    // when there is an audio session change and not pause / play a sound as the
    // sounds are short beep like sounds.
    // The play action is removed and the pause action is changed to a stop action
    NSDictionary *userInfo = notification.userInfo;
    AVAudioSessionRouteChangeReason audioSessionRouteChangeReason =
        [userInfo[@"AVAudioSessionRouteChangeReasonKey"] longValue];
    AVAudioSessionInterruptionType audioSessionInterruptionType =
        [userInfo[@"AVAudioSessionInterruptionTypeKey"] longValue];
    AVAudioPlayer *player = [self playerForKey:self._key];
    if (audioSessionRouteChangeReason ==
        AVAudioSessionRouteChangeReasonOldDeviceUnavailable) {
        if (player) {
            [player stop];
            [self setOnPlay:NO forPlayerKey:self._key]; // Is it correct to leave the call to setOnPlay: NO here?
                                                // there are existing calls to player stop that are not followed by it
        }
    }
    if (audioSessionInterruptionType == AVAudioSessionInterruptionTypeBegan) {
        if (player) {
            [player stop];
            [self setOnPlay:NO forPlayerKey:self._key];
        }
    }
}

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

- (AVAudioPlayer *)playerForKey:(nonnull NSNumber *)key {
    return [[self playerPool] objectForKey:key];
}

- (NSNumber *)keyForPlayer:(nonnull AVAudioPlayer *)player {
    return [[[self playerPool] allKeysForObject:player] firstObject];
}

- (RCTResponseSenderBlock)callbackForKey:(nonnull NSNumber *)key {
    return [[self callbackPool] objectForKey:key];
}

- (NSString *)getDirectory:(int)directory {
    return [NSSearchPathForDirectoriesInDomains(directory, NSUserDomainMask,
                                                YES) firstObject];
}

- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer *)player
                       successfully:(BOOL)flag {
    @synchronized(self) {
        NSNumber *key = [self keyForPlayer:player];
        if (key == nil)
            return;

        [self setOnPlay:NO forPlayerKey:key];
        RCTResponseSenderBlock callback = [self callbackForKey:key];
        if (callback) {
            callback(
                [NSArray arrayWithObjects:[NSNumber numberWithBool:flag], nil]);
            [[self callbackPool] removeObjectForKey:key];
        }
    }
}

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
    return [NSArray arrayWithObjects:@"onPlayChange", nil];
}

- (NSDictionary *)constantsToExport {
    return [NSDictionary
        dictionaryWithObjectsAndKeys:[NSNumber numberWithBool:NO], @"IsAndroid",
                                     [[NSBundle mainBundle] bundlePath],
                                     @"MainBundlePath",
                                     [self getDirectory:NSDocumentDirectory],
                                     @"NSDocumentDirectory",
                                     [self getDirectory:NSLibraryDirectory],
                                     @"NSLibraryDirectory",
                                     [self getDirectory:NSCachesDirectory],
                                     @"NSCachesDirectory", nil];
}

RCT_EXPORT_METHOD(enable : (BOOL)enabled) {
    // setting of AVAudioSession setCategory and setActive removed as this is done just before playback
}

RCT_EXPORT_METHOD(setAudioManagement : (BOOL)useAudioSession) {
    self.useAudioSession = useAudioSession;
}

RCT_EXPORT_METHOD(setActive : (BOOL)active) {
    if (self.useAudioSession) {
        AVAudioSession *session = [AVAudioSession sharedInstance];
        if (active) {
            [session setActive:YES error:nil];
        } else {
            // set option NotifyOthersOnDeactivation to ensure all audio that can be restarted will restart
            [session setActive:NO withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation error:nil];
        }
    }
}

RCT_EXPORT_METHOD(setMode : (NSString *)modeName) {
   // setting of AVAudioSession mode removed as this is done just before playback
}

RCT_EXPORT_METHOD(setCategory
                  : (NSString *)categoryName mixWithOthers
                  : (BOOL)mixWithOthers
                  : (BOOL)carAudioSystem) {
    // setting of AVAudioSession setCategory removed as this is done just before playback
    _carPlay = carAudioSystem;
}

RCT_EXPORT_METHOD(enableInSilenceMode : (BOOL)enabled) {
    // setting of AVAudioSession setCategory and setActive removed as this is done just before playback and silence mode is not used
}

RCT_EXPORT_METHOD(prepare
                  : (NSString *)fileName withKey
                  : (nonnull NSNumber *)key withOptions
                  : (NSDictionary *)options withCallback
                  : (RCTResponseSenderBlock)callback) {
    NSError *error;
    NSURL *fileNameUrl;
    AVAudioPlayer *player;
    NSString* fileNameEscaped = [fileName stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];

    if ([fileNameEscaped hasPrefix:@"http"]) {
        fileNameUrl = [NSURL URLWithString:fileNameEscaped];
        NSData *data = [NSData dataWithContentsOfURL:fileNameUrl];
        player = [[AVAudioPlayer alloc] initWithData:data error:&error];
    } else if ([fileNameEscaped hasPrefix:@"ipod-library://"]) {
        fileNameUrl = [NSURL URLWithString:fileNameEscaped];
        player = [[AVAudioPlayer alloc] initWithContentsOfURL:fileNameUrl
                                                        error:&error];
    } else {
        fileNameUrl = [NSURL URLWithString:fileNameEscaped];
        player = [[AVAudioPlayer alloc] initWithContentsOfURL:fileNameUrl
                                                        error:&error];
    }

    if (player) {
        @synchronized(self) {
            player.delegate = self;
            player.enableRate = YES;
            // call to prepareToPlay is removed as this will activate the AudioSession which has
            // unwanted behaviour for current active audio if audio session is not setup correctly
            // yet. The prepareToPlay is also only preparing the audio for the first playback, for
            // next playback of the sound the prepare will happen again when play is called
            [[self playerPool] setObject:player forKey:key];
            callback([NSArray
                arrayWithObjects:[NSNull null],
                                 [NSDictionary
                                     dictionaryWithObjectsAndKeys:
                                         [NSNumber
                                             numberWithDouble:player.duration],
                                         @"duration",
                                         [NSNumber numberWithUnsignedInteger:
                                                       player.numberOfChannels],
                                         @"numberOfChannels", nil],
                                 nil]);
        }
    } else {
        callback([NSArray arrayWithObjects:RCTJSErrorFromNSError(error), nil]);
    }
}

RCT_EXPORT_METHOD(play
                  : (nonnull NSNumber *)key withCallback
                  : (RCTResponseSenderBlock)callback) {
    if (self.useAudioSession) {
        [[NSNotificationCenter defaultCenter]
            addObserver:self
               selector:@selector(audioSessionChangeObserver:)
                   name:AVAudioSessionRouteChangeNotification
                 object:nil];
    }
    self._key = key;
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        if (self.useAudioSession) {
            AVAudioSession * audioSession = [AVAudioSession sharedInstance];
            if ([player.url.absoluteString containsString:@"mic_"]) {
                // set up audio session for a quick stop of other audio for ASR sounds so that
                // the audio session sequence for ASR can be done ASAP after playback is done
                [audioSession setCategory:AVAudioSessionCategoryPlayback
                              withOptions:AVAudioSessionCategoryOptionInterruptSpokenAudioAndMixWithOthers
                                    error:nil];
            } else {
              [audioSession setCategory:AVAudioSessionCategoryPlayback
                            withOptions:AVAudioSessionCategoryOptionDuckOthers | AVAudioSessionCategoryOptionInterruptSpokenAudioAndMixWithOthers
                                  error:nil];
            }
            if (@available(iOS 12.0, *)) {
                if (_carPlay) {
                    [audioSession setMode:AVAudioSessionModeVoicePrompt error:nil];
                } else {
                    if (audioSession.mode == AVAudioSessionModeVoicePrompt) {
                        [audioSession setMode:AVAudioSessionModeDefault error:nil];
                    }
                }
            }
            [[AVAudioSession sharedInstance] setActive:YES error:nil];
        }

        [[self callbackPool] setObject:[callback copy] forKey:key];
        [player play];
        [self setOnPlay:YES forPlayerKey:key];
    }
}

RCT_EXPORT_METHOD(pause
                  : (nonnull NSNumber *)key withCallback
                  : (RCTResponseSenderBlock)callback) {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        [player pause];
        callback([NSArray array]);
    }
}

RCT_EXPORT_METHOD(stop: (nonnull NSNumber *)key
               resolve: (RCTPromiseResolveBlock)resolve
                reject: (RCTPromiseRejectBlock)reject) {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        [player stop];
        player.currentTime = 0;
    }
    resolve(@YES);
}

RCT_EXPORT_METHOD(release : (nonnull NSNumber *)key) {
    @synchronized(self) {
        AVAudioPlayer *player = [self playerForKey:key];
        if (player) {
            [player stop];
            [[self callbackPool] removeObjectForKey:key];
            [[self playerPool] removeObjectForKey:key];
            NSNotificationCenter *notificationCenter =
                [NSNotificationCenter defaultCenter];
            [notificationCenter removeObserver:self];
        }
    }
}

RCT_EXPORT_METHOD(setVolume
                  : (nonnull NSNumber *)key withValue
                  : (nonnull NSNumber *)value) {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        player.volume = [value floatValue];
    }
}

RCT_EXPORT_METHOD(getSystemVolume : (RCTResponseSenderBlock)callback) {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    callback(@[ @(session.outputVolume) ]);
}

RCT_EXPORT_METHOD(setPan
                  : (nonnull NSNumber *)key withValue
                  : (nonnull NSNumber *)value) {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        player.pan = [value floatValue];
    }
}

RCT_EXPORT_METHOD(setNumberOfLoops
                  : (nonnull NSNumber *)key withValue
                  : (nonnull NSNumber *)value) {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        player.numberOfLoops = [value intValue];
    }
}

RCT_EXPORT_METHOD(setSpeed
                  : (nonnull NSNumber *)key withValue
                  : (nonnull NSNumber *)value) {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        player.rate = [value floatValue];
    }
}

RCT_EXPORT_METHOD(setCurrentTime
                  : (nonnull NSNumber *)key withValue
                  : (nonnull NSNumber *)value) {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        player.currentTime = [value doubleValue];
    }
}

RCT_EXPORT_METHOD(getCurrentTime
                  : (nonnull NSNumber *)key withCallback
                  : (RCTResponseSenderBlock)callback) {
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

RCT_EXPORT_METHOD(setSpeakerPhone : (BOOL)on) {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    if (on) {
        [session overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker
                                   error:nil];
    } else {
        [session overrideOutputAudioPort:AVAudioSessionPortOverrideNone
                                   error:nil];
    }
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}
- (void)setOnPlay:(BOOL)isPlaying forPlayerKey:(nonnull NSNumber *)playerKey {
    [self
        sendEventWithName:@"onPlayChange"
                     body:[NSDictionary
                              dictionaryWithObjectsAndKeys:
                                  [NSNumber
                                      numberWithBool:isPlaying ? YES : NO],
                                  @"isPlaying", playerKey, @"playerKey", nil]];
}
@end
