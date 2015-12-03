# react-native-sound

React Native module for playing sound clips

## Installation

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

## Example

```js
var Sound = require('react-native-sound');
Sound.enable(true); // Enable sound
Sound.prepare('tap.aac'); // Preload the sound file 'tap.aac' in the app bundle
Sound.play('tap.aac'); // Play the sound 'tap.aac'
Sound.stop('tap.aac'); // Stop the sound 'tap.aac'
```

## Notes
- Sound.enable(true) must be called before playing any sound.
- Sound.prepare(...) preloads a sound file and prepares it for playback. If you do not call Sound.prepare(...) beforehand, Sound.play(...) will still work, but there might be a noticeable delay on the first call.
- You can make multiple Sound.play(...) calls at the same time. Under the hood, this module uses AVAudioSessionCategoryAmbient to mix sounds.
- The module wraps AVAudioPlayer which supports aac, aiff, mp3, wav etc. The full list of supported formats can be found at https://developer.apple.com/library/ios/documentation/AudioVideo/Conceptual/MultimediaPG/UsingAudio/UsingAudio.html
- Sound.stop(...) stops the first active audio player playing the specified sound file.
- The API will change soon to give clients better control over sound replay.
