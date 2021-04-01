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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
            case "CACHES":
                this.basePath = this.CACHES;
                break;
            case "DOCUMENT":
                this.basePath = this.DOCUMENT;
                break;
            case "LIBRARY":
                this.basePath = this.LIBRARY;
                break;
            case "MAIN_BUNDLE":
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
                this.registerOnPlay().then(() => {
                    this._isLoaded = true;
                    ee.emit('loaded');
                }).catch(console.error);
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
                            reject('Cannot get system volume for ' + this._filename + ', this is an Android and iOS feature!');
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
    pause() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                !this.isPlaying
                    ? reject('Cannot pause ' + this._filename + ', which is currently not played!')
                    : RNSound.pause(this.key, () => {
                        this.isPlaying = false;
                        resolve();
                    });
            });
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                !this.isPlaying
                    ? reject('Cannot stop ' + this._filename + ',  which is currently not played!')
                    : RNSound.stop(this.key, () => {
                        this.isPlaying = false;
                        resolve();
                    });
            });
        });
    }
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
    getDuration() {
        return this.duration;
    }
    getNumberOfChannels() {
        return this.numberOfChannels;
    }
    getVolume() {
        return this.volume;
    }
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
    getSystemVolume() {
        return new Promise((resolve, reject) => {
            if (!this.isWindows) {
                RNSound.getSystemVolume(resolve);
            }
            else {
                if (this.rejectOnUnsupportedFeature) {
                    reject('Cannot get system volume for ' + this._filename + ', this is an Android and iOS feature!');
                }
                else {
                    resolve();
                }
            }
        });
    }
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
                    reject('Cannot set system volume for ' + this._filename + ', this is an Android feature!');
                }
                else {
                    resolve();
                }
            }
        });
    }
    getPan() {
        return this.pan;
    }
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
                    reject('Cannot set pan count for ' + this._filename + ', the file is not loaded!');
                }
            });
        });
    }
    getNumberOfLoops() {
        return this.numberOfLoops;
    }
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
                    reject('Cannot set loop count for ' + this._filename + ', the file is not loaded!');
                }
            });
        });
    }
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
                            reject('Cannot set speed for ' + this._filename + ', this is an Android feature!');
                        }
                        else {
                            resolve();
                        }
                    }
                }
                else {
                    reject('Cannot set speed for ' + this._filename + ', the file is not loaded!');
                }
            });
        });
    }
    getCurrentSpeed() {
        return this.speed;
    }
    getCurrentTime() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                if (this._isLoaded) {
                    RNSound.getCurrentTime(this.key, resolve);
                }
            });
        });
    }
    setCurrentTime(time) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isLoaded) {
                RNSound.setCurrentTime(this.key, time);
            }
        });
    }
    // android only
    setSpeakerphoneOn() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isAndroid) {
                return RNSound.setSpeakerphoneOn(this.key, true);
            }
        });
    }
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
    enableInSilenceMode() {
        return new Promise((resolve, reject) => {
            if (!this.isAndroid && !this.isWindows) {
                RNSound.enableInSilenceMode(true);
                resolve();
            }
            else {
                if (this.rejectOnUnsupportedFeature) {
                    reject('Cannot enable in silence mode for ' + this._filename + ', this is an iOS feature!');
                }
                else {
                    resolve();
                }
            }
        });
    }
    disableInSilenceMode() {
        return new Promise((resolve, reject) => {
            if (!this.isAndroid && !this.isWindows) {
                RNSound.enableInSilenceMode(false);
                resolve();
            }
            else {
                if (this.rejectOnUnsupportedFeature) {
                    reject('Cannot disable in silence mode for ' + this._filename + ', this is an iOS feature!');
                }
                else {
                    resolve();
                }
            }
        });
    }
    setActive() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.isAndroid && !this.isWindows) {
                    RNSound.setActive(true);
                    resolve();
                }
                else {
                    if (this.rejectOnUnsupportedFeature) {
                        reject('Cannot set active for ' + this._filename + ', this is an iOS feature!');
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
                        reject('Cannot set inactive for ' + this._filename + ', this is an iOS feature!');
                    }
                    else {
                        resolve();
                    }
                }
            });
        });
    }
    setCategory(category, mixWithOthers = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.isWindows) {
                    RNSound.setCategory(category, mixWithOthers);
                    resolve();
                }
                else {
                    if (this.rejectOnUnsupportedFeature) {
                        reject('Cannot set category for ' + this._filename + ', this is a Windows feature!');
                    }
                    else {
                        resolve();
                    }
                }
            });
        });
    }
    setMode(mode) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.isAndroid && !this.isWindows) {
                    RNSound.setMode(mode);
                    resolve();
                }
                else {
                    if (this.rejectOnUnsupportedFeature) {
                        reject('Cannot set mode for ' + this._filename + ', this is an iOS feature!');
                    }
                    else {
                        resolve();
                    }
                }
            });
        });
    }
    isLoaded() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
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
