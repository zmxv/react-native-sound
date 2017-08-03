# react-native-sound

React Native module for playing sound clips on iOS, Android, and Windows.

## Feature matrix

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
Release resource | ✓ | ✓ | ✓
Get duration | ✓ | ✓ | ✓
Get number of channels | ✓ |   |
Get/set volume | ✓ | ✓ | ✓
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

### Manual Installation on iOS

This is not necessary if you have used `react-native link`

In XCode, right click **Libraries**.
Click **Add Files to "[Your project]"**.
Navigate to **node_modules/react-native-sound**.
Add the file **RNSound.xcodeproj**.

In the *Project Navigator*, select your project.
Click the build target.
Click **Build Phases**.
Expand **Link Binary With Libraries**.
Click the plus button and add **libRNSound.a** under **Workspace**.

Drag and drop sound files into *Project Navigator* to add them to the project.  Verify that the files are packaged in the app bundle in either way:

* Select a sound file in the *Project Navigator*, tick the checkbox in the *Target Membership* list on the right.
* Alternatively, click the build target, click **Build Phases**, expand **Copy Bundle Resources**, add the file if it's not already listed.

Run your project (⌘+R).

### Manual Installation on Android

This is not necessary if you have used `react-native link`

Edit `android/settings.gradle` to declare the project directory:
```
include ':react-native-sound'
project(':react-native-sound').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-sound/android')
```

Edit `android/app/build.gradle` to declare the project dependency:
```
dependencies {
  ...
  compile project(':react-native-sound')
}
```

Edit `android/app/src/main/java/.../MainApplication.java` to register the native module:

```java
...
import com.zmxv.RNSound.RNSoundPackage; // <-- New
...

public class MainApplication extends Application implements ReactApplication {
  ...
  @Override
  protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new RNSoundPackage() // <-- New
    );
  }
```

For older versions of React Native you need to edit `MainActivity.java` instead:

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

## Demo project

https://github.com/zmxv/react-native-sound-demo

## Basic usage

First you'll need to add audio files to your project.

- Android: Save your sound clip files under the directory `android/app/src/main/res/raw`. Note that files in this directory must be lowercase and underscored (e.g. my_file_name.mp3) and that subdirectories are not supported by Android.
- iOS: Open Xcode and add your sound files to the project (Right-click the project and select `Add Files to [PROJECTNAME]`)

```js
// Import the react-native-sound module
var Sound = require('react-native-sound');

// Enable playback in silence mode (iOS only)
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
whoosh.stop(() => {
  // Note: If you want to play a sound after stopping and rewinding it,
  // it is important to call play() in a callback.
  whoosh.play();
});

// Release the audio player resource
whoosh.release();
```

## API
### `constructor(filename, basePath, onError, options)`
`filename` {string} Either absolute or relative path to the sound file

`basePath` {?string} Optional base path of the file. Omit this or pass `''` if `filename` is an absolute path. Otherwise, you may use one of the predefined directories: `Sound.MAIN_BUNDLE`, `Sound.DOCUMENT`, `Sound.LIBRARY`, `Sound.CACHES`.

`onError` {?function(error, props)} Optional callback function. If the file is successfully loaded, the first parameter `error` is `null`, and `props` contains an object with two properties: `duration` (in seconds) and `numberOfChannels` (`1` for mono and `2` for stereo sound), both of which can also be accessed from the `Sound` instance object. If an initialization error is encountered (e.g. file not found), `error` will be an object containing `code`, `description`, and the stack trace.

`options` {?object} Platform-specific options:

**Windows Only:** `enableSMTCIntegration` {?boolean}. Optional setting for windows to enable or disable SMTC integration (controlling your apps sounds or music via the keyboard, and the built-in media controls on Windows.) This is enabled by default. Set this to false when you don't want users to be able to control your sounds (e.g. sound effects.) See the [Windows.Media.SystemMediaTransportControls documentation](https://docs.microsoft.com/en-us/uwp/api/Windows.Media.SystemMediaTransportControls) for more information.

### `isLoaded()`
Return `true` if the sound has been loaded.

### `play(onEnd)`
`onEnd` {?function(successfully)} Optional callback function that gets called when the playback finishes successfully or an audio decoding error interrupts it.

### `pause(callback)`
`callback` {?function()} Optional callback function that gets called when the sound has been paused.

Pause the sound.

### `stop(callback)`
`callback` {?function()} Optional callback function that gets called when the sound has been stopped.

Stop playback and set the seek position to 0.

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

### `setSpeed(value)`
`value` {number} Speed of the audio playback (iOS Only).

### `setSpeakerphoneOn(value)`
`speaker` {boolean} Sets the speakerphone on or off (Android only).

It requires this permission in your AndroidManifest: `<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>`

### `enableInSilenceMode(enabled)` (deprecated)
`enabled` {boolean} Whether to enable playback in silence mode (iOS only).

Use the static method `Sound.setCategory('Playback')` instead which has the same effect.

### `setCategory(value)` (deprecated)

Deprecated. Use the static method `Sound.setCategory` instead.

## Static Methods

### `Sound.setCategory(value, mixWithOthers) (iOS only)`

`value` {string} Sets AVAudioSession category, which allows playing sound in background, stop sound playback when phone is locked, etc. Parameter options: "Ambient", "SoloAmbient", "Playback", "Record", "PlayAndRecord", "AudioProcessing", "MultiRoute".

More info about each category can be found in https://developer.apple.com/library/content/documentation/Audio/Conceptual/AudioSessionProgrammingGuide/AudioSessionCategoriesandModes/AudioSessionCategoriesandModes.html

`mixWithOthers` {boolean} can be set to true to force mixing with other audio sessions.

To play sound in the background, make sure to add the following to the `Info.plist` file.
```
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
```

### `Sound.setMode(value) (iOS only)`

`value` {string} Sets AVAudioSession mode, which works in conjunction with the category to determine audio mixing behavior. Parameter options: "Default", "VoiceChat", "VideoChat", "GameChat", "VideoRecording", "Measurement", "MoviePlayback", "SpokenAudio".

This should be called in conjunction with `Sound.setCategory`.

More info about each mode can be found in https://developer.apple.com/documentation/avfoundation/avaudiosession/audio_session_modes

### `Sound.setActive(value) (iOS only)`

Sets AVAudioSession as active, which is recommended on iOS to achieve seamless background playback.
Use this method to deactivate the AVAudioSession when playback is finished in order for other apps
to regain access to the audio stack.

## Notes
- To minimize playback delay, you may want to preload a sound file without calling `play()` (e.g. `var s = new Sound(...);`) during app initialization. This also helps avoid a race condition where `play()` may be called before loading of the sound is complete, which results in no sound but no error because loading is still being processed.
- You can play multiple sound files at the same time. Under the hood, this module uses `AVAudioSessionCategoryAmbient` to mix sounds on iOS.
- You may reuse a `Sound` instance for multiple playbacks.
- On iOS, the module wraps `AVAudioPlayer` that supports aac, aiff, mp3, wav etc. The full list of supported formats can be found at https://developer.apple.com/library/content/documentation/MusicAudio/Conceptual/CoreAudioOverview/SupportedAudioFormatsMacOSX/SupportedAudioFormatsMacOSX.html
- On Android, the module wraps `android.media.MediaPlayer`. The full list of supported formats can be found at https://developer.android.com/guide/topics/media/media-formats.html
- You may chain non-getter calls, for example, `sound.setVolume(.5).setPan(.5).play()`.
