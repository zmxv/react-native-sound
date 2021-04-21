import * as React from 'react-native';
import {EmitterSubscription} from 'react-native';

declare type AVAudioSessionCategory =
  | 'Ambient'
  | 'SoloAmbient'
  | 'Playback'
  | 'Record'
  | 'PlayAndRecord'
  | 'AudioProcessing'
  | 'MultiRoute'
  | 'Alarm';
declare type AVAudioSessionMode =
  | 'Default'
  | 'VoiceChat'
  | 'VideoChat'
  | 'GameChat'
  | 'VideoRecording'
  | 'Measurement'
  | 'MoviePlayback'
  | 'SpokenAudio';
declare type SoundBasePath =
  | 'MAIN_BUNDLE'
  | 'DOCUMENT'
  | 'LIBRARY'
  | 'CACHES'
  | string;

export interface SoundOptions {
  readonly enableSMTCIntegration?: boolean;
}

const RNSound: any = React.NativeModules.RNSound;
const ee: React.NativeEventEmitter = new React.NativeEventEmitter(RNSound);
const isAndroid = RNSound.IsAndroid;
const isWindows = RNSound.IsWindows;
let rejectOnUnsupportedFeature: boolean = false;

export class Sound {
  private readonly MAIN_BUNDLE: string = RNSound.MainBundlePath;
  private readonly DOCUMENT: string = RNSound.NSDocumentDirectory;
  private readonly LIBRARY: string = RNSound.NSLibraryDirectory;
  private readonly CACHES: string = RNSound.NSCachesDirectory;
  protected isPlaying: boolean = false;
  protected _isLoaded: boolean = false;
  private readonly basePath: string = '';
  private readonly _filename: string;
  private key: number = 0;
  private volume: number = 1;
  private onPlaySubscription: EmitterSubscription | null = null;
  private pan: number = 0;
  private duration: number = -1;
  private numberOfChannels: -1 | 1 | 2 = -1;
  private numberOfLoops: number = 0;
  private speed: number = 1;

  constructor(
    filename: string,
    basePath?: SoundBasePath,
    options?: SoundOptions,
  ) {
    switch (basePath) {
      case 'CACHES':
        this.basePath = this.CACHES;
        break;
      case 'DOCUMENT':
        this.basePath = this.DOCUMENT;
        break;
      case 'LIBRARY':
        this.basePath = this.LIBRARY;
        break;
      case 'MAIN_BUNDLE':
        this.basePath = this.MAIN_BUNDLE;
        break;
    }

    // @ts-ignore
    const asset = React.Image.resolveAssetSource(filename);
    if (asset) {
      this._filename = asset.uri;
    } else {
      this._filename = this.basePath + '/' + filename;

      if (isAndroid && !this.basePath && this.isRelativePath(filename)) {
        this._filename = filename.toLowerCase().replace(/\.[^.]+$/, '');
      }
    }

    RNSound.prepare(
      this._filename,
      this.key,
      options || {},
      (error: any, props: {duration: any; numberOfChannels: any}) => {
        if (props) {
          if (typeof props.duration === 'number') {
            this.duration = props.duration;
          }
          if ([-1, 1, 2].includes(props.numberOfChannels)) {
            this.numberOfChannels = props.numberOfChannels;
          }
        }

        if (error === null) {
          this.registerOnPlay()
            .then(() => {
              this._isLoaded = true;
              ee.emit('loaded');
            })
            .catch(console.error);
          return;
        }

        if (error) {
          throw error;
        }
      },
    );
  }

  private isRelativePath(path: string): boolean {
    return !/^(\/|http(s?)|asset)/.test(path);
  }

  private async registerOnPlay(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.onPlaySubscription) {
        if (!isWindows) {
          this.onPlaySubscription = ee.addListener(
            'onPlayChange',
            (param: any) => {
              const {isPlaying, playerKey} = param;
              if (playerKey === this.key) {
                this.isPlaying = isPlaying;
              }
            },
          );
          resolve();
        } else {
          if (rejectOnUnsupportedFeature) {
            reject(
              'Cannot get system volume for ' +
                this._filename +
                ', this is an Android and iOS feature!',
            );
          } else {
            resolve();
          }
        }
      } else {
        resolve();
      }
    });
  }

  /**
   * Plays the loaded file
   * @returns {Promise<any>} When playback finishes successfully or an audio decoding error interrupts it
   */
  public async play(): Promise<any> {
    return new Promise((resolve, reject) => {
      !this._isLoaded
        ? reject(this._filename + 'is not yet ready!')
        : RNSound.play(this.key, (success: any) => {
            this.isPlaying = true;
            resolve(success);
          });
    });
  }

  /**
   * Pause the sound
   * @returns {Promise<void>} When sound has been paused
   */
  public async pause(): Promise<void> {
    return new Promise((resolve, reject) => {
      !this.isPlaying
        ? reject(
            'Cannot pause ' +
              this._filename +
              ', which is currently not played!',
          )
        : RNSound.pause(this.key, () => {
            this.isPlaying = false;
            resolve();
          });
    });
  }

  /**
   * Stop playback and set the seek position to 0.
   * @returns {Promise<void>} When the sound has been stopped
   */
  public async stop(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      !this.isPlaying
        ? reject(
            'Cannot stop ' +
              this._filename +
              ',  which is currently not played!',
          )
        : RNSound.stop(this.key, () => {
            this.isPlaying = false;
            resolve();
          });
    });
  }

  /**
   * Reset the audio player to its uninitialized state (android only)
   */
  public async reset(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (isAndroid) {
        if (!this._isLoaded) {
          reject(
            'Cannot reset ' + this._filename + ' which is not yet loaded!',
          );
        } else {
          RNSound.reset(this.key);
          this.isPlaying = false;
          resolve();
        }
      }
    });
  }

  /**
   * Release the audio player resource associated with the instance.
   */
  public async release(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this._isLoaded) {
        RNSound.release(this.key);
        this._isLoaded = false;
        if (!isWindows) {
          if (this.onPlaySubscription != null) {
            this.onPlaySubscription.remove();
            this.onPlaySubscription = null;
          }
        }
        resolve();
      } else {
        reject('Cannot release ' + this._filename + ', file is not loaded!');
      }
    });
  }

  /**
   * @returns {number} the time of audio (second)
   */
  public getDuration(): number {
    return this.duration;
  }

  /**
   * @returns {number} the number of channels (1 for mono and 2 for stereo sound), or -1 before the sound gets loaded.
   */
  public getNumberOfChannels(): number {
    return this.numberOfChannels;
  }

  /**
   * @returns {number} the volume of the audio player (not the system-wide volume),
   * Ranges from 0.0 (silence) through 1.0 (full volume, the default)
   */
  public getVolume(): number {
    return this.volume;
  }

  /**
   * Set the volume
   * @param {number} - ranging from 0.0 (silence) through 1.0 (full volume)
   * @returns {Promise<void>}
   */
  public async setVolume(volume: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this._isLoaded) {
        if (volume < 0 || volume > 1) {
          reject('Volume must be a value between 0.0 and 1.0!');
          return;
        }

        this.volume = volume;
        if (isAndroid || isWindows) {
          RNSound.setVolume(this.key, volume, volume);
          resolve();
        } else {
          RNSound.setVolume(this.key, volume);
          resolve();
        }
      } else {
        reject('Cannot update ' + this._filename + 'volume, file not loaded!');
      }
    });
  }

  /**
   * iOS and Android only get Current system sound level
   * @returns {Promise<void>} When the sound has been stopped
   */
  public getSystemVolume(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!isWindows) {
        RNSound.getSystemVolume(resolve);
      } else {
        if (rejectOnUnsupportedFeature) {
          reject(
            'Cannot get system volume for ' +
              this._filename +
              ', this is an Android and iOS feature!',
          );
        } else {
          resolve();
        }
      }
    });
  }

  /**
   * Set system volume
   * @param {number} - ranging from 0.0 (silence) through 1.0 (full volume)
   * @returns {Promise<void>}
   */
  public setSystemVolume(volume: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (volume < 0 || volume > 1) {
        reject('System volume must be a value between 0.0 and 1.0!');
        return;
      }

      if (isAndroid) {
        RNSound.setSystemVolume(volume);
        resolve();
      } else {
        if (rejectOnUnsupportedFeature) {
          reject(
            'Cannot set system volume for ' +
              this._filename +
              ', this is an Android feature!',
          );
        } else {
          resolve();
        }
      }
    });
  }

  /**
   * @returns {number} the stereo pan position of the audio player (not the system-wide pan)
   * Ranges from -1.0 (full left) through 1.0 (full right). The default value is 0.0 (center)
   */
  public getPan(): number {
    return this.pan;
  }

  /**
   * Set the pan value
   * @param {number} - ranging from -1.0 (full left) through 1.0 (full right).
   * @returns {Promise<void>}
   */
  public async setPan(pan: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (pan < -1 || pan > 1) {
        reject('Pan must be a value between -1.0 and 1.0!');
        return;
      }

      if (this._isLoaded) {
        this.pan = pan;
        RNSound.setPan(this.key, pan);
        resolve();
      } else {
        reject(
          'Cannot set pan count for ' +
            this._filename +
            ', the file is not loaded!',
        );
      }
    });
  }

  /**
   * @returns {number} Return the loop count of the audio player.
   * The default is 0 which means to play the sound once.
   * A positive number specifies the number of times to return to the start and play again.
   * A negative number indicates an indefinite loop.
   */
  public getNumberOfLoops(): number {
    return this.numberOfLoops;
  }
  /**
   * Set the loop count
   * @param {number} - 0 means to play the sound once. A positive number specifies the number of times to return to the start and play again (iOS only). A negative number indicates an indefinite loop (iOS and Android).
   * @returns {Promise<void>}
   */
  public async setNumberOfLoops(loops: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.numberOfLoops = loops;
      if (this._isLoaded) {
        if (isAndroid || isWindows) {
          RNSound.setLooping(this.key, !!loops);
        } else {
          RNSound.setNumberOfLoops(this.key, loops);
        }
        resolve();
      } else {
        reject(
          'Cannot set loop count for ' +
            this._filename +
            ', the file is not loaded!',
        );
      }
    });
  }

  /**
   * Speed of the audio playback (iOS Only).
   * @param {number}
   * @returns {Promise<void>}
   */
  public async setSpeed(speed: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this._isLoaded) {
        if (!isWindows && !isAndroid) {
          this.speed = speed;
          RNSound.setSpeed(this.key, speed);
          resolve();
        } else {
          if (rejectOnUnsupportedFeature) {
            reject(
              'Cannot set speed for ' +
                this._filename +
                ', this is an iOS feature!',
            );
          } else {
            resolve();
          }
        }
      } else {
        reject(
          'Cannot set speed for ' +
            this._filename +
            ', the file is not loaded!',
        );
      }
    });
  }

  /**
   * Turn speaker phone on (android only)
   * @returns {Promise<void>}
   */
  public async setSpeakerphoneOn(): Promise<void> {
    if (isAndroid) {
      return RNSound.setSpeakerphoneOn(this.key, true);
    }
  }

  /**
   * Turn speaker phone off (android only)
   * @returns {Promise<void>}
   */
  public async setSpeakerphoneOff(): Promise<void> {
    if (isAndroid) {
      RNSound.setSpeakerphoneOn(this.key, false);
    }
  }

  /**
   * @returns {number} current speed
   */
  public getCurrentSpeed(): number {
    return this.speed;
  }

  /**
   * @returns {Promise<number>} the current playback position in seconds and whether the sound is being played.
   */
  public async getCurrentTime(): Promise<number> {
    return new Promise<number>((resolve) => {
      if (this._isLoaded) {
        RNSound.getCurrentTime(this.key, resolve);
      }
    });
  }

  /**
   * @param {number} - particular playback point in seconds
   * @returns {Promise<void>}
   */
  public async setCurrentTime(time: number): Promise<void> {
    if (this._isLoaded) {
      RNSound.setCurrentTime(this.key, time);
    }
  }

  /**
   * @returns {Promise<void>} if the sound has been loaded.
   */
  public async isLoaded(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this._isLoaded) {
        resolve();
      } else {
        ee.addListener('loaded', resolve);
      }
    });
  }
}

export function enable(): Promise<void> {
  return new Promise<void>((resolve) => {
    RNSound.enable(true);
    resolve();
  });
}

export function disable(): Promise<void> {
  return new Promise<void>((resolve) => {
    RNSound.enable(false);
    resolve();
  });
}

/**
 * Enable playback in silence mode (iOS only)
 */
export function enableInSilenceMode() {
  return new Promise<void>((resolve, reject) => {
    if (!isAndroid && !isWindows) {
      RNSound.enableInSilenceMode(true);
      resolve();
    } else {
      if (rejectOnUnsupportedFeature) {
        reject('Cannot enable in silence mode this is an iOS feature!');
      } else {
        resolve();
      }
    }
  });
}

/**
 * Disable playback in silence mode (iOS only)
 */
export function disableInSilenceMode() {
  return new Promise<void>((resolve, reject) => {
    if (!isAndroid && !isWindows) {
      RNSound.enableInSilenceMode(false);
      resolve();
    } else {
      if (rejectOnUnsupportedFeature) {
        reject('Cannot disable in silence mode this is an iOS feature!');
      } else {
        resolve();
      }
    }
  });
}

/**
 * Sets AVAudioSession as active, which is recommended on iOS to achieve seamless background playback.
 * Use this method to deactivate the AVAudioSession when playback is finished in order for other apps
 * to regain access to the audio stack.
 *
 * @returns {Promise<void>}
 */
export async function setActive(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!isAndroid && !isWindows) {
      RNSound.setActive(true);
      resolve();
    } else {
      if (rejectOnUnsupportedFeature) {
        reject('Cannot set active this is an iOS feature!');
      } else {
        resolve();
      }
    }
  });
}

export async function setInactive(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!isAndroid && !isWindows) {
      RNSound.setActive(false);
      resolve();
    } else {
      if (rejectOnUnsupportedFeature) {
        reject('Cannot set inactive this is an iOS feature!');
      } else {
        resolve();
      }
    }
  });
}

/**
 * Sets AVAudioSession category
 * @deprecated
 * @param {AVAudioSessionCategory} - category
 * @param {boolean} - mixWithOthers
 * @returns {Promise<void>}
 */
export async function setCategory(
  category: AVAudioSessionCategory,
  mixWithOthers: boolean = false,
) {
  return new Promise<void>((resolve, reject) => {
    if (!isWindows) {
      RNSound.setCategory(category, mixWithOthers);
      resolve();
    } else {
      if (rejectOnUnsupportedFeature) {
        reject('Cannot set category this is a Windows feature!');
      } else {
        resolve();
      }
    }
  });
}

/**
 * Sets AVAudioSession mode, which works in conjunction with the category to determine audio mixing behavior.
 * Parameter options: "Default", "VoiceChat", "VideoChat", "GameChat", "VideoRecording", "Measurement", "MoviePlayback", "SpokenAudio".
 *
 * @param {AVAudioSessionMode} AVAudioSession mode
 * @returns {Promise<void>}
 */
export async function setMode(mode: AVAudioSessionMode): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!isAndroid && !isWindows) {
      RNSound.setMode(mode);
      resolve();
    } else {
      if (rejectOnUnsupportedFeature) {
        reject('Cannot set mode this is an iOS feature!');
      } else {
        resolve();
      }
    }
  });
}
