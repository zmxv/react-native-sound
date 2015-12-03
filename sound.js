'use strict';

var RNSound = require('react-native').NativeModules.RNSound;

var nextKey = 0;

function Sound(filename) {
  this.filename = filename;
  this.key = nextKey++;
  RNSound.prepare(filename, this.key);
}

Sound.prototype.play = function() {
  RNSound.play(this.key);
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

module.exports = Sound;
