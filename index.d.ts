// Type definitions for react-native-sound
// Project: https://github.com/zmxv/react-native-sound
// Definitions by: Kyle Roach <https://github.com/iRoachie>
// TypeScript Version: 2.3.2

type AVAudioSessionCategory = 'Ambient' | 'SoloAmbient' | 'Playback' | 'Record' | 'PlayAndRecord' | 'AudioProcessing' | 'MultiRoute'

type AVAudioSessionMode = 'Default' | 'VoiceChat' | 'VideoChat' | 'GameChat' | 'VideoRecording' | 'Measurement' | 'MoviePlayback' | 'SpokenAudio'

declare class Sound {
  static MAIN_BUNDLE: string
  static DOCUMENT: string
  static LIBRARY: string
  static CACHES: string

  /**
   * Sets AVAudioSession as active, which is recommended on iOS to achieve seamless background playback.
   * Use this method to deactivate the AVAudioSession when playback is finished in order for other apps
   * to regain access to the audio stack.
   *
   * @param category AVAudioSession category
   * @param mixWithOthers Can be set to true to force mixing with other audio sessions.
   */
  static setActive(active: boolean): void

  /**
   * Sets AVAudioSession category, which allows playing sound in background,
   * stop sound playback when phone is locked, etc.
   * Parameter options: "Ambient", "SoloAmbient", "Playback", "Record", "PlayAndRecord", "AudioProcessing", "MultiRoute".
   *
   * @param category AVAudioSession category
   * @param mixWithOthers Can be set to true to force mixing with other audio sessions.
   */
  static setCategory(category: AVAudioSessionCategory, mixWithOthers: boolean): void

  /**
   * Sets AVAudioSession mode, which works in conjunction with the category to determine audio mixing behavior.
   * Parameter options: "Default", "VoiceChat", "VideoChat", "GameChat", "VideoRecording", "Measurement", "MoviePlayback", "SpokenAudio".
   *
   * @param mode AVAudioSession mode
   * @param mixWithOthers Can be set to true to force mixing with other audio sessions.
   */
  static setMode(mode: AVAudioSessionMode): void

  /**
   * @param filename Either absolute or relative path to the sound file
   * @param basePath Optional base path of the file. Omit this or pass '' if filename is an absolute path. Otherwise, you may use one of the predefined directories: Sound.MAIN_BUNDLE, Sound.DOCUMENT, Sound.LIBRARY, Sound.CACHES.
   * @param callback Optional callback function called when load ends in either success or error. In the event of success, error is undefined.
   */
  constructor(filename: string, basePath: string, callback: (error: any) => void)

  /**
   * Return true if the sound has been loaded.
   */
  isLoaded(): boolean

  /**
   * Plays the loaded file
   * @param onEnd - Optional callback function that gets called when the playback finishes successfully or an audio decoding error interrupts it
   */
  play(onEnd?: (success: boolean) => void): void

  /**
   * Pause the sound
   * @param cb - Optional callback function that gets called when the sound has been paused.
   */
  pause(cb?: () => void): void

  /**
   * Stop playback and set the seek position to 0.
   * @param cb - Optional callback function that gets called when the sound has been stopped.
   */
  stop(cb?: () => void): void

  /**
   * Reset the audio player to its uninitialized state (android only)
   */
  reset(): void

  /**
   * Release the audio player resource associated with the instance.
   */
  release(): void

  /**
   * Return the number of channels
   * (1 for mono and 2 for stereo sound), or -1 before the sound gets loaded.
   */
  getNumberOfChannels(): number

  /**
   * Return the time of audio (second)
   */
  getDuration(): number

  /**
   * Return the volume of the audio player (not the system-wide volume),
   * Ranges from 0.0 (silence) through 1.0 (full volume, the default)
   */
  getVolume(): number

  /**
   * Set the volume
   * @param value - ranging from 0.0 (silence) through 1.0 (full volume)
   */
  setVolume(value: number): void

  /**
   * Return the stereo pan position of the audio player (not the system-wide pan)
   * Ranges from -1.0 (full left) through 1.0 (full right). The default value is 0.0 (center)
   */
  getPan(): number

  /**
   * Set the pan value
   * @param value - ranging from -1.0 (full left) through 1.0 (full right).
   */
  setPan(value: number): void

  /**
   * Return the loop count of the audio player.
   * The default is 0 which means to play the sound once.
   * A positive number specifies the number of times to return to the start and play again.
   * A negative number indicates an indefinite loop.
   */
  getNumberOfLoops(): number

  /**
   * Set the loop count
   * @param value - 0 means to play the sound once. A positive number specifies the number of times to return to the start and play again (iOS only). A negative number indicates an indefinite loop (iOS and Android).
   */
  setNumberOfLoops(value: number): void

  /**
   * Callback will receive the current playback position in seconds and whether the sound is being played.
   * @param cb
   */
  getCurrentTime(cb?: (seconds: number, isPlaying: boolean) => void): void

  /**
   * Seek to a particular playback point in seconds.
   * @param value
   */
  setCurrentTime(value: number): void

  /**
   * Speed of the audio playback (iOS Only).
   * @param value
   */
  setSpeed(value: number): void

  /**
   * Whether to enable playback in silence mode (iOS only)
   * @deprecated - Use the static method Sound.setCategory('Playback') instead which has the same effect.
   * @param enabled
   */
  enableInSilenceMode(enabled: boolean): void

  /**
   * Sets AVAudioSession category
   * @deprecated
   * @param value
   */
  setCategory(value: AVAudioSessionCategory): void

  /**
   * Turn speaker phone on (android only)
   * @param value
   */
  setSpeakerphoneOn(value: boolean): void

  /**
   * Whether the player is playing or not.
   */
  isPlaying(): boolean
}

export = Sound;
