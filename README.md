# react-native-sound

[![](https://img.shields.io/npm/v/react-native-sound.svg?style=flat-square)][npm]
[![](https://img.shields.io/npm/l/react-native-sound.svg?style=flat-square)][npm]
[![](https://img.shields.io/npm/dm/react-native-sound.svg?style=flat-square)][npm]

[npm]: https://www.npmjs.com/package/react-native-sound

React Native module for playing sound clips on iOS, Android, and Windows.

Be warned, this software is alpha quality and may have bugs. Test on your own
and use at your own risk!

## Feature matrix

React-native-sound does not support streaming. See [#353][] for more info.
Of course, we would welcome a PR if someone wants to take this on.

In iOS, the library uses [AVAudioPlayer][], not [AVPlayer][].

[#353]: https://github.com/zmxv/react-native-sound/issues/353
[AVAudioPlayer]: https://developer.apple.com/documentation/avfoundation/avaudioplayer
[AVPlayer]: https://developer.apple.com/documentation/avfoundation/avplayer

Feature | iOS | Android | Windows
---|---|---|---
Load sound from the app bundle | ✓ | ✓ | ✓
Load sound from other directories | ✓ | ✓ | ✓
Load sound from the network | ✓ | ✓ |
Play sound | ✓ | ✓ | ✓
Playback completion callback | ✓ | ✓ | ✓
Pause | ✓ | ✓ | ✓
Resume | ✓ | ✓ | ✓
Stop | ✓ | ✓ | ✓
Reset |  | ✓ |
Release resource | ✓ | ✓ | ✓
Get duration | ✓ | ✓ | ✓
Get number of channels | ✓ |   |
Get/set volume | ✓ | ✓ | ✓
Get system volume | ✓ | ✓ |
Set system volume |   | ✓ |
Get/set pan | ✓ |   |
Get/set loops | ✓ | ✓ | ✓
Get/set current time | ✓ | ✓ | ✓
Set speed | ✓ | ✓ |

## Installation

First install the npm package from your app directory:

```javascript
npm install react-native-sound --save
```

Then link it automatically using:

```javascript
react-native link react-native-sound
```

**If you encounter this error**

```
undefined is not an object (evaluating 'RNSound.IsAndroid')
```

you may additionally need to fully clear your build caches for Android. You
can do this using

```bash
cd android
./gradlew cleanBuildCache
```

After clearing your build cache, you should execute a new `react-native` build.

If you still experience issues, **know that this is the most common build issue.** See [#592][] and the several
issues linked from it for possible resolution. A pull request with improved
documentation on this would be welcome!

[#592]: https://github.com/zmxv/react-native-sound/issues/592

### Manual Installation Notes

Please see the Wiki for these details https://github.com/zmxv/react-native-sound/wiki/Installation


## Help with React-Native-Sound

* For react-native-sound developers  [![][gitter badge]](https://gitter.im/react-native-sound/developers)
* For help using react-native-sound  [![][gitter badge]](https://gitter.im/react-native-sound/Help)

[gitter badge]: https://img.shields.io/gitter/room/react-native-sound/developers.svg?format=flat-square

## Demo project

https://github.com/zmxv/react-native-sound-demo

## Player

<img src="https://github.com/benevbright/react-native-sound-playerview/blob/master/docs/demo.gif?raw=true">

https://github.com/benevbright/react-native-sound-playerview

## Basic usage

First you'll need to add audio files to your project.

- Android: Save your sound clip files under the directory `android/app/src/main/res/raw`. Note that files in this directory must be lowercase and underscored (e.g. my_file_name.mp3) and that subdirectories are not supported by Android.
- iOS: Open Xcode and add your sound files to the project (Right-click the project and select `Add Files to [PROJECTNAME]`)

```js
// Import the react-native-sound module
var Sound = require('react-native-sound');

// Enable playback in silence mode
Sound.setCategory('Playback');

// Load the sound file 'whoosh.mp3' from the app bundle
// See notes below about preloading sounds within initialization code below.
var whoosh = new Sound('whoosh.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  // loaded successfully
  console.log('duration in seconds: ' + whoosh.getDuration() + 'number of channels: ' + whoosh.getNumberOfChannels());

  // Play the sound with an onEnd callback
  whoosh.play((success) => {
    if (success) {
      console.log('successfully finished playing');
    } else {
      console.log('playback failed due to audio decoding errors');
    }
  });
});

// Reduce the volume by half
whoosh.setVolume(0.5);

// Position the sound to the full right in a stereo field
whoosh.setPan(1);

// Loop indefinitely until stop() is called
whoosh.setNumberOfLoops(-1);

// Get properties of the player instance
console.log('volume: ' + whoosh.getVolume());
console.log('pan: ' + whoosh.getPan());
console.log('loops: ' + whoosh.getNumberOfLoops());

// Seek to a specific point in seconds
whoosh.setCurrentTime(2.5);

// Get the current playback point in seconds
whoosh.getCurrentTime((seconds) => console.log('at ' + seconds));

// Pause the sound
whoosh.pause();

// Stop the sound and rewind to the beginning
whoosh.stop(() => {
  // Note: If you want to play a sound after stopping and rewinding it,
  // it is important to call play() in a callback.
  whoosh.play();
});

// Release the audio player resource
whoosh.release();
```

## Notes

- To minimize playback delay, you may want to preload a sound file without calling `play()` (e.g. `var s = new Sound(...);`) during app initialization. This also helps avoid a race condition where `play()` may be called before loading of the sound is complete, which results in no sound but no error because loading is still being processed.
- You can play multiple sound files at the same time. Under the hood, this module uses `AVAudioSessionCategoryAmbient` to mix sounds on iOS.
- You may reuse a `Sound` instance for multiple playbacks.
- On iOS, the module wraps `AVAudioPlayer` that supports aac, aiff, mp3, wav etc. The full list of supported formats can be found at https://developer.apple.com/library/content/documentation/MusicAudio/Conceptual/CoreAudioOverview/SupportedAudioFormatsMacOSX/SupportedAudioFormatsMacOSX.html
- On Android, the module wraps `android.media.MediaPlayer`. The full list of supported formats can be found at https://developer.android.com/guide/topics/media/media-formats.html
- On Android, the absolute path can start with '/sdcard/'. So, if you want to access a sound called "my_sound.mp3" on Downloads folder, the absolute path will be: '/sdcard/Downloads/my_sound.mp3'.
- You may chain non-getter calls, for example, `sound.setVolume(.5).setPan(.5).play()`.

## Audio on React Native

- [The State of Audio Libraries in React Native (Oct. 2018)][medium]
- [react-native-audio-toolkit][]
- [react-native-video][] (also plays audio)
- [Expo Audio SDK][]
- [#media on awesome-react-native][#media]

[medium]: https://medium.com/@emmettharper/the-state-of-audio-libraries-in-react-native-7e542f57b3b4
[react-native-audio-toolkit]: https://github.com/react-native-community/react-native-audio-toolkit
[react-native-video]: https://github.com/react-native-community/react-native-video
[expo audio sdk]: https://docs.expo.io/versions/latest/sdk/audio/
[#media]: http://www.awesome-react-native.com/#media

## Contributing

Pull requests welcome with bug fixes, documentation improvements, and
enhancements.

When making big changes, please open an issue first to discuss.

## License

This project is licensed under the MIT License.
