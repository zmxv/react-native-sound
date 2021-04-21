declare type AVAudioSessionCategory = 'Ambient' | 'SoloAmbient' | 'Playback' | 'Record' | 'PlayAndRecord' | 'AudioProcessing' | 'MultiRoute' | 'Alarm';
declare type AVAudioSessionMode = 'Default' | 'VoiceChat' | 'VideoChat' | 'GameChat' | 'VideoRecording' | 'Measurement' | 'MoviePlayback' | 'SpokenAudio';
declare type SoundBasePath = 'MAIN_BUNDLE' | 'DOCUMENT' | 'LIBRARY' | 'CACHES' | string;
export interface SoundOptions {
    readonly rejectOnUnsupportedFeature?: boolean;
    readonly enableSMTCIntegration?: boolean;
}
export declare class Sound {
    private readonly MAIN_BUNDLE;
    private readonly DOCUMENT;
    private readonly LIBRARY;
    private readonly CACHES;
    protected readonly isAndroid: boolean;
    protected readonly isWindows: boolean;
    protected isPlaying: boolean;
    protected _isLoaded: boolean;
    private readonly basePath;
    private readonly _filename;
    private readonly rejectOnUnsupportedFeature;
    private key;
    private volume;
    private onPlaySubscription;
    private pan;
    private duration;
    private numberOfChannels;
    private numberOfLoops;
    private speed;
    constructor(filename: string, basePath?: SoundBasePath, options?: SoundOptions);
    private isRelativePath;
    private registerOnPlay;
    /**
     * Plays the loaded file
     * @returns {Promise<any>} When playback finishes successfully or an audio decoding error interrupts it
     */
    play(): Promise<any>;
    /**
     * Pause the sound
     * @returns {Promise<void>} When sound has been paused
     */
    pause(): Promise<void>;
    /**
     * Stop playback and set the seek position to 0.
     * @returns {Promise<void>} When the sound has been stopped
     */
    stop(): Promise<void>;
    /**
     * Reset the audio player to its uninitialized state (android only)
     */
    reset(): Promise<void>;
    /**
     * Release the audio player resource associated with the instance.
     */
    release(): Promise<void>;
    /**
     * @returns {number} the time of audio (second)
     */
    getDuration(): number;
    /**
     * @returns {number} the number of channels (1 for mono and 2 for stereo sound), or -1 before the sound gets loaded.
     */
    getNumberOfChannels(): number;
    /**
     * @returns {number} the volume of the audio player (not the system-wide volume),
     * Ranges from 0.0 (silence) through 1.0 (full volume, the default)
     */
    getVolume(): number;
    /**
     * Set the volume
     * @param {number} - ranging from 0.0 (silence) through 1.0 (full volume)
     * @returns {Promise<void>}
     */
    setVolume(volume: number): Promise<void>;
    /**
     * iOS and Android only get Current system sound level
     * @returns {Promise<void>} When the sound has been stopped
     */
    getSystemVolume(): Promise<void>;
    /**
     * Set system volume
     * @param {number} - ranging from 0.0 (silence) through 1.0 (full volume)
     * @returns {Promise<void>}
     */
    setSystemVolume(volume: number): Promise<void>;
    /**
     * @returns {number} the stereo pan position of the audio player (not the system-wide pan)
     * Ranges from -1.0 (full left) through 1.0 (full right). The default value is 0.0 (center)
     */
    getPan(): number;
    /**
     * Set the pan value
     * @param {number} - ranging from -1.0 (full left) through 1.0 (full right).
     * @returns {Promise<void>}
     */
    setPan(pan: number): Promise<void>;
    /**
     * @returns {number} Return the loop count of the audio player.
     * The default is 0 which means to play the sound once.
     * A positive number specifies the number of times to return to the start and play again.
     * A negative number indicates an indefinite loop.
     */
    getNumberOfLoops(): number;
    /**
     * Set the loop count
     * @param {number} - 0 means to play the sound once. A positive number specifies the number of times to return to the start and play again (iOS only). A negative number indicates an indefinite loop (iOS and Android).
     * @returns {Promise<void>}
     */
    setNumberOfLoops(loops: number): Promise<void>;
    /**
     * Speed of the audio playback (iOS Only).
     * @param {number}
     * @returns {Promise<void>}
     */
    setSpeed(speed: number): Promise<void>;
    /**
     * @returns {number} current speed
     */
    getCurrentSpeed(): number;
    /**
     * @returns {Promise<number>} the current playback position in seconds and whether the sound is being played.
     */
    getCurrentTime(): Promise<number>;
    /**
     * @param {number} - particular playback point in seconds
     * @returns {Promise<void>}
     */
    setCurrentTime(time: number): Promise<void>;
    /**
     * Turn speaker phone on (android only)
     * @returns {Promise<void>}
     */
    setSpeakerphoneOn(): Promise<void>;
    /**
     * Turn speaker phone off (android only)
     * @returns {Promise<void>}
     */
    setSpeakerphoneOff(): Promise<void>;
    enable(): Promise<void>;
    disable(): Promise<void>;
    /**
     * Enable playback in silence mode (iOS only)
     */
    enableInSilenceMode(): Promise<void>;
    /**
     * Disable playback in silence mode (iOS only)
     */
    disableInSilenceMode(): Promise<void>;
    /**
     * Sets AVAudioSession as active, which is recommended on iOS to achieve seamless background playback.
     * Use this method to deactivate the AVAudioSession when playback is finished in order for other apps
     * to regain access to the audio stack.
     *
     * @returns {Promise<void>}
     */
    setActive(): Promise<void>;
    setInactive(): Promise<void>;
    /**
     * Sets AVAudioSession category
     * @deprecated
     * @param {AVAudioSessionCategory} - category
     * @param {boolean} - mixWithOthers
     * @returns {Promise<void>}
     */
    setCategory(category: AVAudioSessionCategory, mixWithOthers?: boolean): Promise<void>;
    /**
     * Sets AVAudioSession mode, which works in conjunction with the category to determine audio mixing behavior.
     * Parameter options: "Default", "VoiceChat", "VideoChat", "GameChat", "VideoRecording", "Measurement", "MoviePlayback", "SpokenAudio".
     *
     * @param {AVAudioSessionMode} AVAudioSession mode
     * @returns {Promise<void>}
     */
    setMode(mode: AVAudioSessionMode): Promise<void>;
    /**
     * @returns {Promise<void>} if the sound has been loaded.
     */
    isLoaded(): Promise<void>;
}
export {};
