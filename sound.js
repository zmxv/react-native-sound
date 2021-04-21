"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sound = void 0;
const React = __importStar(require("react-native"));
const RNSound = React.NativeModules.RNSound;
const ee = new React.NativeEventEmitter(RNSound);
class Sound {
    constructor(filename, basePath, options) {
        this.MAIN_BUNDLE = RNSound.MainBundlePath;
        this.DOCUMENT = RNSound.NSDocumentDirectory;
        this.LIBRARY = RNSound.NSLibraryDirectory;
        this.CACHES = RNSound.NSCachesDirectory;
        this.isAndroid = RNSound.IsAndroid;
        this.isWindows = RNSound.IsWindows;
        this.isPlaying = false;
        this._isLoaded = false;
        this.basePath = '';
        this.rejectOnUnsupportedFeature = false;
        this.key = 0;
        this.volume = 1;
        this.onPlaySubscription = null;
        this.pan = 0;
        this.duration = -1;
        this.numberOfChannels = -1;
        this.numberOfLoops = 0;
        this.speed = 1;
        if (options === null || options === void 0 ? void 0 : options.rejectOnUnsupportedFeature) {
            this.rejectOnUnsupportedFeature = true;
        }
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
        }
        else {
            this._filename = this.basePath + '/' + filename;
            if (this.isAndroid && !this.basePath && this.isRelativePath(filename)) {
                this._filename = filename.toLowerCase().replace(/\.[^.]+$/, '');
            }
        }
        RNSound.prepare(this._filename, this.key, options || {}, (error, props) => {
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
        });
    }
    isRelativePath(path) {
        return !/^(\/|http(s?)|asset)/.test(path);
    }
    registerOnPlay() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.onPlaySubscription) {
                    if (!this.isWindows) {
                        this.onPlaySubscription = ee.addListener('onPlayChange', (param) => {
                            const { isPlaying, playerKey } = param;
                            if (playerKey === this.key) {
                                this.isPlaying = isPlaying;
                            }
                        });
                        resolve();
                    }
                    else {
                        if (this.rejectOnUnsupportedFeature) {
                            reject('Cannot get system volume for ' +
                                this._filename +
                                ', this is an Android and iOS feature!');
                        }
                        else {
                            resolve();
                        }
                    }
                }
                else {
                    resolve();
                }
            });
        });
    }
    /**
     * Plays the loaded file
     * @returns {Promise<any>} When playback finishes successfully or an audio decoding error interrupts it
     */
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                !this._isLoaded
                    ? reject(this._filename + 'is not yet ready!')
                    : RNSound.play(this.key, (success) => {
                        this.isPlaying = true;
                        resolve(success);
                    });
            });
        });
    }
    /**
     * Pause the sound
     * @returns {Promise<void>} When sound has been paused
     */
    pause() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                !this.isPlaying
                    ? reject('Cannot pause ' +
                        this._filename +
                        ', which is currently not played!')
                    : RNSound.pause(this.key, () => {
                        this.isPlaying = false;
                        resolve();
                    });
            });
        });
    }
    /**
     * Stop playback and set the seek position to 0.
     * @returns {Promise<void>} When the sound has been stopped
     */
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                !this.isPlaying
                    ? reject('Cannot stop ' +
                        this._filename +
                        ',  which is currently not played!')
                    : RNSound.stop(this.key, () => {
                        this.isPlaying = false;
                        resolve();
                    });
            });
        });
    }
    /**
     * Reset the audio player to its uninitialized state (android only)
     */
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this.isAndroid) {
                    if (!this._isLoaded) {
                        reject('Cannot reset ' + this._filename + ' which is not yet loaded!');
                    }
                    else {
                        RNSound.reset(this.key);
                        this.isPlaying = false;
                        resolve();
                    }
                }
            });
        });
    }
    /**
     * Release the audio player resource associated with the instance.
     */
    release() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this._isLoaded) {
                    RNSound.release(this.key);
                    this._isLoaded = false;
                    if (!this.isWindows) {
                        if (this.onPlaySubscription != null) {
                            this.onPlaySubscription.remove();
                            this.onPlaySubscription = null;
                        }
                    }
                    resolve();
                }
                else {
                    reject('Cannot release ' + this._filename + ', file is not loaded!');
                }
            });
        });
    }
    /**
     * @returns {number} the time of audio (second)
     */
    getDuration() {
        return this.duration;
    }
    /**
     * @returns {number} the number of channels (1 for mono and 2 for stereo sound), or -1 before the sound gets loaded.
     */
    getNumberOfChannels() {
        return this.numberOfChannels;
    }
    /**
     * @returns {number} the volume of the audio player (not the system-wide volume),
     * Ranges from 0.0 (silence) through 1.0 (full volume, the default)
     */
    getVolume() {
        return this.volume;
    }
    /**
     * Set the volume
     * @param {number} - ranging from 0.0 (silence) through 1.0 (full volume)
     * @returns {Promise<void>}
     */
    setVolume(volume) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this._isLoaded) {
                    if (volume < 0 || volume > 1) {
                        reject('Volume must be a value between 0.0 and 1.0!');
                        return;
                    }
                    this.volume = volume;
                    if (this.isAndroid || this.isWindows) {
                        RNSound.setVolume(this.key, volume, volume);
                        resolve();
                    }
                    else {
                        RNSound.setVolume(this.key, volume);
                        resolve();
                    }
                }
                else {
                    reject('Cannot update ' + this._filename + 'volume, file not loaded!');
                }
            });
        });
    }
    /**
     * iOS and Android only get Current system sound level
     * @returns {Promise<void>} When the sound has been stopped
     */
    getSystemVolume() {
        return new Promise((resolve, reject) => {
            if (!this.isWindows) {
                RNSound.getSystemVolume(resolve);
            }
            else {
                if (this.rejectOnUnsupportedFeature) {
                    reject('Cannot get system volume for ' +
                        this._filename +
                        ', this is an Android and iOS feature!');
                }
                else {
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
    setSystemVolume(volume) {
        return new Promise((resolve, reject) => {
            if (volume < 0 || volume > 1) {
                reject('System volume must be a value between 0.0 and 1.0!');
                return;
            }
            if (this.isAndroid) {
                RNSound.setSystemVolume(volume);
                resolve();
            }
            else {
                if (this.rejectOnUnsupportedFeature) {
                    reject('Cannot set system volume for ' +
                        this._filename +
                        ', this is an Android feature!');
                }
                else {
                    resolve();
                }
            }
        });
    }
    /**
     * @returns {number} the stereo pan position of the audio player (not the system-wide pan)
     * Ranges from -1.0 (full left) through 1.0 (full right). The default value is 0.0 (center)
     */
    getPan() {
        return this.pan;
    }
    /**
     * Set the pan value
     * @param {number} - ranging from -1.0 (full left) through 1.0 (full right).
     * @returns {Promise<void>}
     */
    setPan(pan) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (pan < -1 || pan > 1) {
                    reject('Pan must be a value between -1.0 and 1.0!');
                    return;
                }
                if (this._isLoaded) {
                    this.pan = pan;
                    RNSound.setPan(this.key, pan);
                    resolve();
                }
                else {
                    reject('Cannot set pan count for ' +
                        this._filename +
                        ', the file is not loaded!');
                }
            });
        });
    }
    /**
     * @returns {number} Return the loop count of the audio player.
     * The default is 0 which means to play the sound once.
     * A positive number specifies the number of times to return to the start and play again.
     * A negative number indicates an indefinite loop.
     */
    getNumberOfLoops() {
        return this.numberOfLoops;
    }
    /**
     * Set the loop count
     * @param {number} - 0 means to play the sound once. A positive number specifies the number of times to return to the start and play again (iOS only). A negative number indicates an indefinite loop (iOS and Android).
     * @returns {Promise<void>}
     */
    setNumberOfLoops(loops) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.numberOfLoops = loops;
                if (this._isLoaded) {
                    if (this.isAndroid || this.isWindows) {
                        RNSound.setLooping(this.key, !!loops);
                    }
                    else {
                        RNSound.setNumberOfLoops(this.key, loops);
                    }
                    resolve();
                }
                else {
                    reject('Cannot set loop count for ' +
                        this._filename +
                        ', the file is not loaded!');
                }
            });
        });
    }
    /**
     * Speed of the audio playback (iOS Only).
     * @param {number}
     * @returns {Promise<void>}
     */
    setSpeed(speed) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this._isLoaded) {
                    if (!this.isWindows && !this.isAndroid) {
                        this.speed = speed;
                        RNSound.setSpeed(this.key, speed);
                        resolve();
                    }
                    else {
                        if (this.rejectOnUnsupportedFeature) {
                            reject('Cannot set speed for ' +
                                this._filename +
                                ', this is an iOS feature!');
                        }
                        else {
                            resolve();
                        }
                    }
                }
                else {
                    reject('Cannot set speed for ' +
                        this._filename +
                        ', the file is not loaded!');
                }
            });
        });
    }
    /**
     * @returns {number} current speed
     */
    getCurrentSpeed() {
        return this.speed;
    }
    /**
     * @returns {Promise<number>} the current playback position in seconds and whether the sound is being played.
     */
    getCurrentTime() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                if (this._isLoaded) {
                    RNSound.getCurrentTime(this.key, resolve);
                }
            });
        });
    }
    /**
     * @param {number} - particular playback point in seconds
     * @returns {Promise<void>}
     */
    setCurrentTime(time) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isLoaded) {
                RNSound.setCurrentTime(this.key, time);
            }
        });
    }
    /**
     * Turn speaker phone on (android only)
     * @returns {Promise<void>}
     */
    setSpeakerphoneOn() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isAndroid) {
                return RNSound.setSpeakerphoneOn(this.key, true);
            }
        });
    }
    /**
     * Turn speaker phone off (android only)
     * @returns {Promise<void>}
     */
    setSpeakerphoneOff() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isAndroid) {
                RNSound.setSpeakerphoneOn(this.key, false);
            }
        });
    }
    enable() {
        return new Promise((resolve) => {
            RNSound.enable(true);
            resolve();
        });
    }
    disable() {
        return new Promise((resolve) => {
            RNSound.enable(false);
            resolve();
        });
    }
    /**
     * Enable playback in silence mode (iOS only)
     */
    enableInSilenceMode() {
        return new Promise((resolve, reject) => {
            if (!this.isAndroid && !this.isWindows) {
                RNSound.enableInSilenceMode(true);
                resolve();
            }
            else {
                if (this.rejectOnUnsupportedFeature) {
                    reject('Cannot enable in silence mode for ' +
                        this._filename +
                        ', this is an iOS feature!');
                }
                else {
                    resolve();
                }
            }
        });
    }
    /**
     * Disable playback in silence mode (iOS only)
     */
    disableInSilenceMode() {
        return new Promise((resolve, reject) => {
            if (!this.isAndroid && !this.isWindows) {
                RNSound.enableInSilenceMode(false);
                resolve();
            }
            else {
                if (this.rejectOnUnsupportedFeature) {
                    reject('Cannot disable in silence mode for ' +
                        this._filename +
                        ', this is an iOS feature!');
                }
                else {
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
    setActive() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.isAndroid && !this.isWindows) {
                    RNSound.setActive(true);
                    resolve();
                }
                else {
                    if (this.rejectOnUnsupportedFeature) {
                        reject('Cannot set active for ' +
                            this._filename +
                            ', this is an iOS feature!');
                    }
                    else {
                        resolve();
                    }
                }
            });
        });
    }
    setInactive() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.isAndroid && !this.isWindows) {
                    RNSound.setActive(false);
                    resolve();
                }
                else {
                    if (this.rejectOnUnsupportedFeature) {
                        reject('Cannot set inactive for ' +
                            this._filename +
                            ', this is an iOS feature!');
                    }
                    else {
                        resolve();
                    }
                }
            });
        });
    }
    /**
     * Sets AVAudioSession category
     * @deprecated
     * @param {AVAudioSessionCategory} - category
     * @param {boolean} - mixWithOthers
     * @returns {Promise<void>}
     */
    setCategory(category, mixWithOthers = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.isWindows) {
                    RNSound.setCategory(category, mixWithOthers);
                    resolve();
                }
                else {
                    if (this.rejectOnUnsupportedFeature) {
                        reject('Cannot set category for ' +
                            this._filename +
                            ', this is a Windows feature!');
                    }
                    else {
                        resolve();
                    }
                }
            });
        });
    }
    /**
     * Sets AVAudioSession mode, which works in conjunction with the category to determine audio mixing behavior.
     * Parameter options: "Default", "VoiceChat", "VideoChat", "GameChat", "VideoRecording", "Measurement", "MoviePlayback", "SpokenAudio".
     *
     * @param {AVAudioSessionMode} AVAudioSession mode
     * @returns {Promise<void>}
     */
    setMode(mode) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.isAndroid && !this.isWindows) {
                    RNSound.setMode(mode);
                    resolve();
                }
                else {
                    if (this.rejectOnUnsupportedFeature) {
                        reject('Cannot set mode for ' +
                            this._filename +
                            ', this is an iOS feature!');
                    }
                    else {
                        resolve();
                    }
                }
            });
        });
    }
    /**
     * @returns {Promise<void>} if the sound has been loaded.
     */
    isLoaded() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                if (this._isLoaded) {
                    resolve();
                }
                else {
                    ee.addListener('loaded', resolve);
                }
            });
        });
    }
}
exports.Sound = Sound;
