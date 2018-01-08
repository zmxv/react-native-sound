'use strict';

var { NativeModules, NativeEventEmitter } = require('react-native');
var RNSound = NativeModules.RNSound;
var IsAndroid = RNSound.IsAndroid;
var IsWindows = RNSound.IsWindows;
var resolveAssetSource = require("react-native/Libraries/Image/resolveAssetSource");
var nextKey = 0;

var eventEmitter = new NativeEventEmitter(RNSound);

function isRelativePath(path) {
  return !/^(\/|http(s?)|asset)/.test(path);
}

function Sound(filename, basePath, onError, options) {
  var asset = resolveAssetSource(filename);
  if (asset) {
    this._filename = asset.uri;
    onError = basePath;
  } else {
    this._filename = basePath ? basePath + '/' + filename : filename;

    if (IsAndroid && !basePath && isRelativePath(filename)) {
      this._filename = filename.toLowerCase().replace(/\.[^.]+$/, '');
    }
  }

  this.registerOnPlay = function() {
    if (this.onPlaySubscription != null) {
      console.warn('On Play change event listener is already registered');
      return;
    }

    if (!IsWindows) {
      this.onPlaySubscription = eventEmitter.addListener(
        'onPlayChange',
        (param) => {
          const { isPlaying, playerKey } = param;
          if (playerKey === this._key) {
            if (isPlaying) {
              this._playing = true;
            }
            else {
              this._playing = false;
            }
          }
        },
      );
    }
  }

  this._loaded = false;
  this._playing = false;
  this._key = nextKey++;
  this._duration = -1;
  this._numberOfChannels = -1;
  this._volume = 1;
  this._pan = 0;
  this._numberOfLoops = 0;
  this._speed = 1;
  RNSound.prepare(this._filename, this._key, options || {}, (error, props) => {
    if (props) {
      if (typeof props.duration === 'number') {
        this._duration = props.duration;
      }
      if (typeof props.numberOfChannels === 'number') {
        this._numberOfChannels = props.numberOfChannels;
      }
    }
    if (error === null) {
      this._loaded = true;
      this.registerOnPlay();
    }
    onError && onError(error, props);
  });
}

Sound.prototype.isLoaded = function() {
  return this._loaded;
};

Sound.prototype.play = function(onEnd) {
  if (this._loaded) {
    RNSound.play(this._key, (successfully) => onEnd && onEnd(successfully));
    if (IsAndroid) {
      // For Android
      // Manually call native setSpeed() after native play() to apply current speed.
      // Native setSpeed method should be called only if the media player is already playing.
      // To prevent android from playing automatically when setSpeed is called.
      RNSound.setSpeed(this._key, this._speed);
    }
  }
  else {
    onEnd && onEnd(false);
  }
  return this;
};

Sound.prototype.pause = function(callback) {
  if (this._loaded) {
    RNSound.pause(this._key, () => {
      this._playing = false;
      callback && callback();
    });
  }
  return this;
};

Sound.prototype.stop = function(callback) {
  if (this._loaded) {
    RNSound.stop(this._key, () => {
      this._playing = false;
      callback && callback();
    });
  }
  return this;
};

Sound.prototype.reset = function() {
  if (this._loaded && IsAndroid) {
    RNSound.reset(this._key);
    this._playing = false;
  }
  return this;
};

Sound.prototype.release = function() {
  if (this._loaded) {
    RNSound.release(this._key);
    this._loaded = false;
    if (!IsWindows) {
      if (this.onPlaySubscription != null) {
        this.onPlaySubscription.remove();
        this.onPlaySubscription = null;
      }
    }
  }
  return this;
};

Sound.prototype.getDuration = function() {
  return this._duration;
};

Sound.prototype.getNumberOfChannels = function() {
  return this._numberOfChannels;
};

Sound.prototype.getVolume = function() {
  return this._volume;
};

Sound.prototype.setVolume = function(value) {
  this._volume = value;
  if (this._loaded) {
    if (IsAndroid || IsWindows) {
      RNSound.setVolume(this._key, value, value);
    } else {
      RNSound.setVolume(this._key, value);
    }
  }
  return this;
};

Sound.prototype.getSystemVolume = function(callback) {
  if (IsAndroid) {
    RNSound.getSystemVolume(callback);
  }
  return this;
};

Sound.prototype.setSystemVolume = function(value) {
  if (IsAndroid) {
    RNSound.setSystemVolume(value);
  }
  return this;
};

Sound.prototype.getPan = function() {
  return this._pan;
};

Sound.prototype.setPan = function(value) {
  if (this._loaded) {
    RNSound.setPan(this._key, this._pan = value);
  }
  return this;
};

Sound.prototype.getNumberOfLoops = function() {
  return this._numberOfLoops;
};

Sound.prototype.setNumberOfLoops = function(value) {
  this._numberOfLoops = value;
  if (this._loaded) {
    if (IsAndroid || IsWindows) {
      RNSound.setLooping(this._key, !!value);
    } else {
      RNSound.setNumberOfLoops(this._key, value);
    }
  }
  return this;
};

Sound.prototype.setSpeed = function(value) {
  this._speed = value;
  if (this._loaded) {
    if (!IsWindows && !IsAndroid) {
      RNSound.setSpeed(this._key, value);
    } else if (IsAndroid) {
      // For Android
      // Call native setSpeed method only if the media player is already playing.
      // To prevent android from playing automatically when setSpeed is called.
      if (this._playing) {
        RNSound.setSpeed(this._key, value);
      }
    }
  }
  return this;
};

Sound.prototype.getCurrentTime = function(callback) {
  if (this._loaded) {
    RNSound.getCurrentTime(this._key, callback);
  }
};

Sound.prototype.setCurrentTime = function(value) {
  if (this._loaded) {
    RNSound.setCurrentTime(this._key, value);
  }
  return this;
};

// android only
Sound.prototype.setSpeakerphoneOn = function(value) {
  if (IsAndroid) {
    RNSound.setSpeakerphoneOn(this._key, value);
  } else if (!IsAndroid && !IsWindows) {
    RNSound.setSpeakerphoneOn(value);
  }
};

Sound.prototype.isPlaying = function() {
  return this._playing;
};

Sound.adjustStreamVolume = function(streamType, direction, flags) {
  if (IsAndroid) {
    RNSound.adjustStreamVolume(streamType, direction, flags);
  }
}

Sound.setStreamMute = function(streamType, state) {
  if (IsAndroid) {
    RNSound.setStreamMute(streamType, state);
  }
}

Sound.isHeadsetPlugged = function() {
  return RNSound.isHeadsetPlugged();
};

Sound.registerHeadsetPlugChangeListener = function(headsetPluggedInListener) {
  // console.log('Register headset plug change event listener');
  if (this.headsetPluggedInSubscription != null) {
    console.warn('Headset plug change event listener is already registered');
    return;
  }

  if (!IsWindows) {
    // Remove route change listener first
    RNSound.addRouteChangeListener();
    this.headsetPluggedInSubscription = eventEmitter.addListener(
      'RouteChange',
      headsetPluggedInListener,
    );
  }
};

Sound.unregisterHeadsetPlugChangeListener = function() {
  // console.log('Unregister headset plug change event listener');
  if (!IsWindows) {
    if (this.headsetPluggedInSubscription != null) {
      RNSound.removeRouteChangeListener();
      this.headsetPluggedInSubscription.remove();
      this.headsetPluggedInSubscription = null;
    }
  }
}

// ios only

// This is deprecated.  Call the static one instead.

Sound.prototype.setCategory = function(value) {
  Sound.setCategory(value, false);
}

Sound.enable = function(enabled) {
  RNSound.enable(enabled);
};

Sound.enableInSilenceMode = function(enabled) {
  if (!IsAndroid && !IsWindows) {
    RNSound.enableInSilenceMode(enabled);
  }
};

Sound.setActive = function(value) {
  if (!IsAndroid && !IsWindows) {
    RNSound.setActive(value);
  }
};

Sound.setCategory = function(value, mixWithOthers = false, allowBluetooth = false) {
  if (!IsAndroid && !IsWindows) {
    RNSound.setCategory(value, mixWithOthers, allowBluetooth);
  }
};

Sound.setMode = function(value) {
  if (!IsAndroid && !IsWindows) {
    RNSound.setMode(value);
  }
};

Sound.MAIN_BUNDLE = RNSound.MainBundlePath;
Sound.DOCUMENT = RNSound.NSDocumentDirectory;
Sound.LIBRARY = RNSound.NSLibraryDirectory;
Sound.CACHES = RNSound.NSCachesDirectory;

module.exports = Sound;
