import { NativeModules, NativeEventEmitter } from 'react-native';
import { isRelativePath, djb2Code } from './utils';

const { RNSound } = NativeModules;
const { IsAndroid } = RNSound;
const eventEmitter = new NativeEventEmitter(RNSound);

export default class Sound {
  loaded = false;
  key = null;
  playing = false;
  duration = -1;
  numberOfChannels = -1;
  volume = 1;
  pan = 0;
  numberOfLoops = 0;
  speed = 1;
  filename = null;
  onPlaySubscription = null;

  registerEventEmitter = () => {
    if (this.onPlaySubscription != null) {
      console.warn('On Play change event listener is already registered');
      return;
    }

    this.onPlaySubscription = eventEmitter.addListener(
      'onPlayChange',
      (param) => {
        const { isPlaying, playerKey } = param;

        if (playerKey === this.key) {
          this.playing = isPlaying;
        }
      },
    );
  }

  init = (filename, basePath = null, options = {}) => {
    this.filename = filename;
    this.key = djb2Code(filename);

    return new Promise((resolve, reject) => {
      RNSound.prepare(this.filename, this.key, options, (error, props) => {
        if (props) {
          if (typeof props.duration === 'number') {
            this.duration = props.duration;
          }
          if (typeof props.numberOfChannels === 'number') {
            this.numberOfChannels = props.numberOfChannels;
          }
        }

        if (error === null) {
          this.loaded = true;
          this.registerEventEmitter();

          resolve(this);
        } else {
          reject(error, props);
        }
      });
    });
  }

  play = () => new Promise((resolve, reject) => {
    if (!this.loaded) return reject();

    RNSound.play(this.key, () => {});

    resolve();
  })

  pause = () => new Promise((resolve, reject) => {
    if (!this.loaded) return reject();

    RNSound.pause(this.key, () => {
      this.playing = false;
      resolve();
    });
  })

  stop = () => new Promise((resolve, reject) => {
    if (!this.loaded) return reject();

    RNSound.stop(this.key, () => {
      this.playing = false;
      resolve();
    });
  })

  release = () => new Promise((resolve, reject) => {
    if (!this.loaded) return reject();

    RNSound.release(this.key);

    this.loaded = false;
    this.onPlaySubscription.remove();
    this.onPlaySubscription = null;

    resolve();
  })

  reset = () => new Promise((resolve, reject) => {
    if (!this.loaded || !IsAndroid) return reject();

    RNSound.reset(this.key);
    this.loaded = false;

    resolve();
  })

  // Setters

  setVolume = (volume) => {
    if (!this.loaded) return reject();

    this.volume = volume;

    if (IsAndroid) {
      RNSound.setVolume(this.key, value, value);
    } else {
      RNSound.setVolume(this.key, value);
    }
  }

  setPan = (pan) => new Promise((resolve, reject) => {
    if (!this.loaded) reject();

    RNSound.setPan(this.key, this.pan = pan);

    resolve();
  })

  setNumberOfLoops = (loops) => new Promise((resolve, reject) => {
    if (!this.loaded) reject();

    this.numberOfLoops = true;

    if (IsAndroid) {
      RNSound.setLooping(this.key, !!loops);
    } else {
      RNSound.setNumberOfLoops(this.key, loops);
    }

    resolve();
  })

  setSpeed = (speed) => new Promise((resolve, reject) => {
    if (!this.loaded) reject();

    this.speed = speed;

    RNSound.setSpeed(this.key, speed);

    resolve();
  })

  setCurrentTime = (time) => new Promise((resolve, reject) => {
    if (!this.loaded) reject();

    RNSound.setCurrentTime(this.key, time);

    resolve();
  })

  // Getters

  isLoaded() {
    return this.loaded;
  }

  getDuration() {
    return this.duration;
  }

  getNumberOfChannels() {
    return this.numberOfChannels;
  }

  getVolume() {
    return this.volume;
  }

  getPan() {
    return this.pan;
  }

  getNumberOfLoops() {
    return this.numberOfLoops;
  }

  getCurrentTime = () => new Promise((resolve, reject) => {
    if (!this.loaded) reject();

    RNSound.getCurrentTime(this.key, resolve);
  })

  // Android Only

  setSystemVolume = (volume) => new Promise((resolve, reject) => {
    if (!IsAndroid) reject();

    RNSound.setSystemVolume(volume);

    resolve();
  })

  getSystemVolume = () => new Promise((resolve, reject) => {
    if (!IsAndroid) reject();

    RNSound.getSystemVolume(resolve);
  })

  setSpeakerphoneOn = (value = true) => new Promise((resolve, reject) => {
    if (!IsAndroid) reject();

    RNSound.setSpeakerphoneOn(this.key, value);

    resolve();
  })

  // iOS Only

  enable = (enabled) => new Promise((resolve, reject) => {
    if (IsAndroid) reject();

    RNSound.enable(enabled);

    resolve();
  })

  enableInSilenceMode = (enabled = true) => new Promise((resolve, reject) => {
    if (IsAndroid) reject();

    RNSound.enableInSilenceMode(enabled);

    resolve();
  })

  setActive = (active = true) => new Promise((resolve, reject) => {
    if (IsAndroid) reject();

    RNSound.setActive(active);

    resolve();
  })

  setActive = (category, mixWithOthers = false) => new Promise((resolve, reject) => {
    if (IsAndroid) reject();

    RNSound.setCategory(category, mixWithOthers);

    resolve();
  })

  setMode = (mode) => new Promise((resolve, reject) => {
    if (IsAndroid) reject();

    RNSound.setMode(mode);

    resolve();
  })
}
