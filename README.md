# react-native-sound

React Native module for playing sound clips on iOS and Android.

## Feature matrix

Feature | iOS | Android
---|---|---|---
Load sound from the app bundle | ✓ | ✓
Load sound from other directories | ✓ |
Load sound from the network | |
Play sound | ✓ | ✓
Playback completion callback | ✓ | ✓
Pause | ✓ | ✓
Resume | ✓ | ✓
Stop | ✓ | ✓
Release resource | ✓ | ✓
Get duration | ✓ | ✓ 
Get number of channels | ✓ |
Get/set volume | ✓ | ✓ 
Get/set pan | ✓ |
Get/set loops | ✓ | ✓
Get/set current time | ✓ | ✓ 

## Installation

First install the npm package from your app directory:

```javascript
npm install react-native-sound --save
```

### Installation on iOS

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

### Installation on Android

Edit `android/settings.gradle` to declare the project directory:
```
include ':RNSound', ':app'
project(':RNSound').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-sound/android')
```

Edit `android/app/build.gradle` to declare the project dependency:
```
dependencies {
  ...
  compile project(':RNSound')
}
```

Edit `android/app/src/main/java/.../MainActivity.java` to register the native module:
```java
...
import com.zmxv.RNSound.RNSoundPackage; // <-- New
...

public class MainActivity extends Activity implements DefaultHardwareBackBtnHandler {
  ...
    @Override
  protected void onCreate(Bundle savedInstanceState){
    ...
    mReactInstanceManager = ReactInstanceManager.builder()
      .setApplication(getApplication())
      ...
      .addPackage(new MainReactPackage())
      .addPackage(new RNSoundPackage()) // <-- New
      ...
  }
```

Save your sound clip files under the directory `android/app/src/main/res/raw`.

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

// Play the sound with an onEnd callback
whoosh.play((success) => {
  if (success) {
    console.log('successfully finished playing');
  } else {
    console.log('playback failed due to audio decoding errors');
  }
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
whoosh.stop();

// Release the audio player resource
whoosh.release();
```

## API
### `constructor(filename, basePath, onError)`
`filename` {string} Either absolute or relative path to the sound file

`basePath` {?string} Optional base path of the file. Omit this or pass `''` if `filename` is an absolute path. Otherwise, you may use one of the predefined directories: `Sound.MAIN_BUNDLE`, `Sound.DOCUMENT`, `Sound.LIBRARY`, `Sound.CACHES`.

`onError` {?function(error, props)} Optional callback function. If the file is successfully loaded, the first parameter `error` is `null`, and `props` contains an object with two properties: `duration` (in seconds) and `numberOfChannels` (`1` for mono and `2` for stereo sound), both of which can also be accessed from the `Sound` instance object. If an initialization error is encountered (e.g. file not found), `error` will be an object containing `code`, `description`, and the stack trace.

### `isLoaded()`
Return `true` if the sound has been loaded.

### `play(onEnd)`
`onEnd` {?function(successfully)} Optinoal callback function that gets called when the playback finishes successfully or an audio decoding error interrupts it.

### `pause()`
Pause the sound.

### `stop()`
Stop the playback.

### `release()`
Release the audio player resource associated with the instance.

### `getDuration()`
Return the duration in seconds, or `-1` before the sound gets loaded.

### `getNumberOfChannels()`
Return the number of channels (`1` for mono and `2` for stereo sound), or `-1` before the sound gets loaded.

### `getVolume()`
Return the volume of the audio player (not the system-wide volume), ranging from `0.0` (silence) through `1.0` (full volume, the default).

### `setVolume(value)`
`value` {number} Set the volume, ranging from `0.0` (silence) through `1.0` (full volume).

### `getPan()`
Return the stereo pan position of the audio player (not the system-wide pan), ranging from `-1.0` (full left) through `1.0` (full right). The default value is `0.0` (center).

### `setPan(value)`
`value` {number} Set the pan, ranging from `-1.0` (full left) through `1.0` (full right).

### `getNumberOfLoops()`
Return the loop count of the audio player. The default is `0` which means to play the sound once. A positive number specifies the number of times to return to the start and play again. A negative number indicates an indefinite loop.

### `setNumberOfLoops(value)`
`value` {number} Set the loop count. `0` means to play the sound once. A positive number specifies the number of times to return to the start and play again (iOS only). A negative number indicates an indefinite loop (iOS and Android).

### `getCurrentTime(callback)`
`callback` {function(seconds, isPlaying)} Callback will receive the current playback position in seconds and whether the sound is being played.

### `setCurrentTime(value)`
`value` {number} Seek to a particular playback point in seconds.

## Notes
- To minimize playback delay, you may want to preload a sound file without calling `play()` (e.g. `var s = new Sound(...);`) during app initialization.
- You can play multiple sound files at the same time. Under the hood, this module uses `AVAudioSessionCategoryAmbient` to mix sounds on iOS.
- You may reuse a `Sound` instance for multiple playbacks.
- On iOS, the module wraps `AVAudioPlayer` which supports aac, aiff, mp3, wav etc. The full list of supported formats can be found at https://developer.apple.com/library/ios/documentation/AudioVideo/Conceptual/MultimediaPG/UsingAudio/UsingAudio.html
- On Android, the module wraps `android.media.MediaPlayer`. The full list of supported formats can be found at http://developer.android.com/guide/appendix/media-formats.html
- You may chain non-getter calls, for example, `sound.setVolume(.5).setPan(.5).play()`.
