'use strict';

var RNSound = require('react-native').NativeModules.RNSound;

var nextKey = 0;

function Sound(filename, basePath, onError) {
  this.filename = basePath ? basePath + '/' + filename : filename;
  this.key = nextKey++;
  this.duration = -1;
  this.numberOfChannels = -1;
  RNSound.prepare(this.filename, this.key, (error, props) => {
    if (props) {
      if (typeof props.duration === 'number') {
        this.duration = props.duration;
      }
      if (typeof props.numberOfChannels === 'number') {
        this.numberOfChannels = props.numberOfChannels;
      }
    }
    onError && onError(error);
  });
}

Sound.prototype.play = function(onEnd) {
  RNSound.play(this.key, (successfully) => onEnd && onEnd(successfully));
};

Sound.prototype.pause = function() {
  RNSound.pause(this.key);
};

Sound.prototype.stop = function() {
  RNSound.stop(this.key);
};

Sound.prototype.release = function() {
  RNSound.release(this.key);
};

Sound.enable = function(enabled) {
  RNSound.enable(enabled);
};

Sound.enable(true);

Sound.MAIN_BUNDLE = RNSound.MainBundlePath;
Sound.DOCUMENT = RNSound.NSDocumentDirectory;
Sound.LIBRARY = RNSound.NSLibraryDirectory;
Sound.CACHES = RNSound.NSCachesDirectory;

module.exports = Sound;
