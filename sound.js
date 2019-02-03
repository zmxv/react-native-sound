'use strict';

var ReactNative = require('react-native');
var RNSound = ReactNative.NativeModules.RNSound;
var IsAndroid = RNSound.IsAndroid;
var IsWindows = RNSound.IsWindows;
var resolveAssetSource = require("react-native/Libraries/Image/resolveAssetSource");
var eventEmitter = new ReactNative.NativeEventEmitter(RNSound);

function isRelativePath(path) {
  return !/^(\/|http(s?)|asset)/.test(path);
}

// Hash function to compute key from the filename
function djb2Code(str) {
  var hash = 5381, i, char;
  for (i = 0; i < str.length; i++) {
      char = str.charCodeAt(i);
      hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
  }
  return hash;
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
  this._key = asset ? filename : djb2Code(filename); //if the file is an asset, use the asset number as the key
  this._playing = false;
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
  } else {
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
  if(!IsWindows) {
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
    if (!IsWindows) {
      RNSound.setSpeed(this._key, value);
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
  }
};

// ios only

// This is deprecated.  Call the static one instead.

Sound.prototype.setCategory = function(value) {
  Sound.setCategory(value, false);
}

Sound.prototype.isPlaying = function() {
  return this._playing;
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

Sound.setCategory = function(value, mixWithOthers = false) {
  if (!IsWindows) {
    RNSound.setCategory(value, mixWithOthers);
  }
};

Sound.setMode = function(value) {
  if (!IsAndroid && !IsWindows) {
    RNSound.setMode(value);
  }
};

Sound.setSpeakerPhone = function(value) {
  if (!IsAndroid && !IsWindows) {
    RNSound.setSpeakerPhone(value)
  }
}

Sound.MAIN_BUNDLE = RNSound.MainBundlePath;
Sound.DOCUMENT = RNSound.NSDocumentDirectory;
Sound.LIBRARY = RNSound.NSLibraryDirectory;
Sound.CACHES = RNSound.NSCachesDirectory;

module.exports = Sound;
