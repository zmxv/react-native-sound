# react-native-sound

React Native module for playing sound clips

## Installation (iOS)

```javascript
npm install react-native-sound --save
```

In XCode, right click **Libraries**.
Click **Add Files to "[Your project]"**.
Navigate to **node_modules/react-native-sound**.
Add the file **RNSound.xcodeproj**.

In the project navigator, select your project.
Click the build target.
Click **Build Phases**.
Expand **Link Binary With Libraries**.
Click the plus button and add **libRNSound.a** under **Workspace**.

Run your project (⌘+R).

## Basic usage

```js
// Import the react-native-sound module
var Sound = require('react-native-sound');

// Load the sound file 'whoosh.mp3' from the app bundle
var whoosh = new Sound('whoosh.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
  } else { // loaded successfully
    console.log('duration in seconds: ' + whoosh.duration +
        'number of channels: ' + whoosh.numberOfChannels);
  }
});

// Play the sound
whoosh.play((success) => {
  if (success) {
    console.log('successfully finished playing');
  } else {
    console.log('playback failed due to audio decoding errors');
  }
});

// Pause the sound
whoosh.pause();

// Stop the sound
whoosh.stop();

// Release the audio player resource
whoosh.release();
```

## API
### `constructor(filename, basePath, onError)`
`filename` {string} Either absolute or relative path to the sound file

`basePath` {?string} Optional base path of the file. Omit this or pass `''` if `filename` is an absolute path. Otherwise, you may use one of the predefined directories: `Sound.MAIN_BUNDLE`, `Sound.DOCUMENT`, `Sound.LIBRARY`, `Sound.CACHES`.

`onError` {?function(error, props)} Optional callback function. If the file is successfully loaded, the first parameter `error` is `null`, and `props` contains an object with two properties: `duration` (in seconds) and `numberOfChannels` (1 for mono and 2 for stereo sound), both of which can also be accessed from the `Sound` instance object. If an initialization error is encountered (e.g. file not found), `error` will be an object containing `code`, `description`, and the stack trace.

### `play(onEnd)`
`onEnd` {?function(successfully)} Optinoal callback function that gets called when the playback finishes successfully or an audio decoding error interrupts it.

### `pause()`
Pause the sound.

### `stop()`
Stop the playback.

### `release()`
Release the audio player resource associated with the instance.

### `Sound.enable(enabled)`
`enabled` {boolean} Enable or disable sound for the entire app. Sound is enabled by default.

## Notes
- To minimize playback delay, you may want to preload a sound file (e.g. `var s = new Sound(...);`) during app initialization.
- You can play multiple sound files at the same time. Under the hood, this module uses AVAudioSessionCategoryAmbient to mix sounds.
- You may reuse a `Sound` instance for multiple playbacks.
- The module wraps AVAudioPlayer which supports aac, aiff, mp3, wav etc. The full list of supported formats can be found at https://developer.apple.com/library/ios/documentation/AudioVideo/Conceptual/MultimediaPG/UsingAudio/UsingAudio.html
