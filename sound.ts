"use strict";

import { NativeEventEmitter, Platform } from "react-native";
import RNSoundIOS from "./src/NativeSoundIOS";
import RNSoundAndroid from "./src/NativeSoundAndroid";

let RNSound;
if (Platform.OS === "ios") {
  RNSound = RNSoundIOS;
} else {
  RNSound = RNSoundAndroid;
}

const eventEmitter = new NativeEventEmitter(RNSound);

// Define platform checks
const IsAndroid = Platform.OS === "android";
const IsWindows = Platform.OS === "windows";

// Utility function to resolve asset source
import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";

let nextKey = 0;

// Type definitions for props and options
interface SoundOptions {
  [key: string]: any;
}

interface SoundProps {
  duration?: number;
  numberOfChannels?: number;
}

const isRelativePath = (path: string) => {
  return !/^(\/|http(s?)|asset|file)/.test(path);
};

// Type for Sound instance
class Sound {
  private _filename: string;
  private _key: number;
  private _loaded: boolean;
  private _playing: boolean;
  private _duration: number;
  private _numberOfChannels: number;
  private _volume: number;
  private _pan: number;
  private _numberOfLoops: number;
  private _speed: number;
  private _pitch: number;
  private onPlaySubscription: any;

  constructor(
    filename: string,
    basePath: string | undefined,
    onError: (error: any, props: SoundProps) => void,
    options: SoundOptions
  ) {
    const asset = resolveAssetSource(filename);
    if (asset) {
      this._filename = asset.uri;
      onError = basePath as any;
    } else {
      this._filename = basePath ? `${basePath}/${filename}` : filename;

      if (IsAndroid && !basePath && isRelativePath(filename)) {
        this._filename = filename.toLowerCase().replace(/\.[^.]+$/, "");
      }
    }

    this._key = nextKey++;
    this._loaded = false;
    this._playing = false;
    this._duration = -1;
    this._numberOfChannels = -1;
    this._volume = 1;
    this._pan = 0;
    this._numberOfLoops = 0;
    this._speed = 1;
    this._pitch = 1;

    RNSound.prepare(
      this._filename,
      this._key,
      options,
      (error: any, props: SoundProps) => {
        if (props) {
          if (typeof props.duration === "number") {
            this._duration = props.duration;
          }
          if (typeof props.numberOfChannels === "number") {
            this._numberOfChannels = props.numberOfChannels;
          }
        }
        if (error === null) {
          this._loaded = true;
          this.registerOnPlay();
        }
        onError && onError(error, props);
      }
    );
  }

  private registerOnPlay() {
    if (this.onPlaySubscription != null) {
      console.warn("On Play change event listener is already registered");
      return;
    }

    if (!IsWindows) {
      this.onPlaySubscription = eventEmitter.addListener(
        "onPlayChange",
        (param: { isPlaying: boolean; playerKey: number }) => {
          const { isPlaying, playerKey } = param;
          if (playerKey === this._key) {
            this._playing = isPlaying;
          }
        }
      );
    }
  }

  private calculateRelativeVolume(volume: number, pan: number): number {
    const relativeVolume = volume * (1 - Math.abs(pan));
    return Number(relativeVolume.toFixed(1));
  }

  private setAndroidVolumes() {
    if (this._pan) {
      const relativeVolume = this.calculateRelativeVolume(
        this._volume,
        this._pan
      );
      if (this._pan < 0) {
        RNSound.setVolume(this._key, this._volume, relativeVolume);
      } else {
        RNSound.setVolume(this._key, relativeVolume, this._volume);
      }
    } else {
      RNSound.setVolume(this._key, this._volume, this._volume);
    }
  }

  public isLoaded(): boolean {
    return this._loaded;
  }

  public play(onEnd?: (successfully: boolean) => void): Sound {
    if (this._loaded) {
      RNSound.play(
        this._key,
        (successfully: boolean) => onEnd && onEnd(successfully)
      );
    } else {
      onEnd && onEnd(false);
    }
    return this;
  }

  public pause(callback?: () => void): Sound {
    if (this._loaded) {
      RNSound.pause(this._key, () => {
        this._playing = false;
        callback && callback();
      });
    }
    return this;
  }

  public stop(callback?: () => void): Sound {
    if (this._loaded) {
      RNSound.stop(this._key, () => {
        this._playing = false;
        callback && callback();
      });
    }
    return this;
  }

  public reset(): Sound {
    if (this._loaded && IsAndroid) {
      RNSound.reset(this._key);
      this._playing = false;
    }
    return this;
  }

  public release(): Sound {
    if (this._loaded) {
      RNSound.release(this._key);
      this._loaded = false;
      if (!IsWindows && this.onPlaySubscription != null) {
        this.onPlaySubscription.remove();
        this.onPlaySubscription = null;
      }
    }
    return this;
  }

  public getFilename(): string {
    return this._filename;
  }

  public getDuration(): number {
    return this._duration;
  }

  public getNumberOfChannels(): number {
    return this._numberOfChannels;
  }

  public getVolume(): number {
    return this._volume;
  }

  public getSpeed(): number {
    return this._speed;
  }

  public getPitch(): number {
    return this._pitch;
  }

  public setVolume(value: number): Sound {
    this._volume = value;
    if (this._loaded) {
      if (IsAndroid) {
        this.setAndroidVolumes();
      } else {
        RNSound.setVolume(this._key, value);
      }
    }
    return this;
  }

  public setPan(value: number): Sound {
    this._pan = value;
    if (this._loaded) {
      if (IsWindows) {
        throw new Error("#setPan not supported on windows");
      } else if (IsAndroid) {
        this.setAndroidVolumes();
      } else {
        RNSound.setPan(this._key, value);
      }
    }
    return this;
  }

  public getSystemVolume(callback: (volume: number) => void): Sound {
    if (!IsWindows) {
      RNSound.getSystemVolume(callback);
    }
    return this;
  }

  public setSystemVolume(value: number): Sound {
    if (IsAndroid) {
      RNSound.setSystemVolume(value);
    }
    return this;
  }

  public getPan(): number {
    return this._pan;
  }

  public getNumberOfLoops(): number {
    return this._numberOfLoops;
  }

  public setNumberOfLoops(value: number): Sound {
    this._numberOfLoops = value;
    if (this._loaded) {
      if (IsAndroid || IsWindows) {
        RNSound.setLooping(this._key, !!value);
      } else {
        RNSound.setNumberOfLoops(this._key, value);
      }
    }
    return this;
  }

  public setSpeed(value: number): Sound {
    this._speed = value;
    if (this._loaded && !IsWindows) {
      RNSound.setSpeed(this._key, value);
    }
    return this;
  }

  public setPitch(value: number): Sound {
    this._pitch = value;
    if (this._loaded && IsAndroid) {
      RNSound.setPitch(this._key, value);
    }
    return this;
  }

  public getCurrentTime(callback: (time: number) => void): void {
    if (this._loaded) {
      RNSound.getCurrentTime(this._key, callback);
    }
  }

  public setCurrentTime(value: number): Sound {
    if (this._loaded) {
      RNSound.setCurrentTime(this._key, value);
    }
    return this;
  }

  // android only
  public setSpeakerphoneOn(value: boolean): void {
    if (IsAndroid) {
      RNSound.setSpeakerphoneOn(this._key, value);
    }
  }

  // ios only
  public static setCategory(
    value: string,
    mixWithOthers: boolean = false
  ): void {
    if (!IsWindows) {
      RNSound.setCategory(value, mixWithOthers);
    }
  }

  public isPlaying(): boolean {
    return this._playing;
  }

  public static enable(enabled: boolean): void {
    RNSound.enable(enabled);
  }

  public static enableInSilenceMode(enabled: boolean): void {
    if (!IsAndroid && !IsWindows) {
      RNSound.enableInSilenceMode(enabled);
    }
  }

  public static setActive(value: boolean): void {
    if (!IsAndroid && !IsWindows) {
      RNSound.setActive(value);
    }
  }

  public static setMode(value: string): void {
    if (!IsAndroid && !IsWindows) {
      RNSound.setMode(value);
    }
  }

  public static setSpeakerPhone(value: boolean): void {
    if (!IsAndroid && !IsWindows) {
      RNSound.setSpeakerPhone(value);
    }
  }

  public static MAIN_BUNDLE = RNSound.getConstants()["MAIN_BUNDLE"];
  public static DOCUMENT = RNSound.getConstants()["DOCUMENT"];
  public static LIBRARY = RNSound.getConstants()["LIBRARY"];
  public static CACHES = RNSound.getConstants()["CACHES"];
}

export default Sound;
