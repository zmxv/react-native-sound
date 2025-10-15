# 🎵 React Native Sound

[![npm version](https://img.shields.io/npm/v/react-native-sound.svg?style=flat-square)][npm]
[![license](https://img.shields.io/npm/l/react-native-sound.svg?style=flat-square)][npm]
[![downloads](https://img.shields.io/npm/dm/react-native-sound.svg?style=flat-square)][npm]
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](src/index.d.ts)
[![New Architecture](https://img.shields.io/badge/New_Architecture-TurboModule-green?style=flat-square)](#new-architecture-support)

[npm]: https://www.npmjs.com/package/react-native-sound

> 🚀 **Cross-platform audio playback for React Native** — Play sound clips on iOS and Android with full TypeScript support and modern React Native architecture compatibility.

## ✨ Features

- 🎯 **Cross-platform**: Works on iOS and Android
- 📱 **Modern Architecture**: Full support for React Native's New Architecture (TurboModules)
- 🔤 **TypeScript**: Complete TypeScript definitions included
- 🎛️ **Rich Controls**: Play, pause, stop, seek, volume, pan, and looping
- 📁 **Flexible Loading**: Load from app bundle, local files, or network URLs
- 🔄 **Multiple Players**: Play multiple sounds simultaneously
- ⚡ **Optimized**: Minimal latency with preloading support
- 🛡️ **Reliable**: Battle-tested in production apps

## 📊 Platform Compatibility

> 📝 **Note**: This library focuses on audio clips playback, not streaming. For streaming audio, consider [react-native-video](https://github.com/react-native-video/react-native-video) or other dedicated streaming solutions.

**iOS Implementation**: Uses [AVAudioPlayer](https://developer.apple.com/documentation/avfoundation/avaudioplayer) for optimal performance and compatibility.

**Android Implementation**: Uses [MediaPlayer](https://developer.android.com/reference/android/media/MediaPlayer) with proper audio focus handling.

| Feature                      | iOS | Android |
| ---------------------------- | --- | ------- |
| **Loading**                  |
| Load from app bundle         | ✅  | ✅      |
| Load from local files        | ✅  | ✅      |
| Load from network URLs       | ✅  | ✅      |
| **Playback**                 |
| Play/Pause/Stop              | ✅  | ✅      |
| Playback completion callback | ✅  | ✅      |
| Resume playback              | ✅  | ✅      |
| Reset to beginning           | ❌  | ✅      |
| **Audio Control**            |
| Volume control               | ✅  | ✅      |
| Pan (L/R stereo)             | ✅  | ❌      |
| Playback speed               | ✅  | ✅      |
| **System Integration**       |
| Get system volume            | ✅  | ✅      |
| Set system volume            | ❌  | ✅      |
| **Advanced Features**        |
| Loop control                 | ✅  | ✅      |
| Exact loop count             | ✅  | ❌      |
| Seek to time position        | ✅  | ✅      |
| Get current position         | ✅  | ✅      |
| Get duration                 | ✅  | ✅      |
| Get channel count            | ✅  | ❌      |
| **Resource Management**      |
| Explicit resource cleanup    | ✅  | ✅      |

## 📦 Installation

### npm

```bash
npm install react-native-sound
```

### yarn

```bash
yarn add react-native-sound
```

## 🏗️ New Architecture Support

This library supports both the old and new React Native architecture:

- ✅ **Old Architecture**: Uses traditional NativeModules
- ✅ **New Architecture**: Uses TurboModules for better performance
- ✅ **Expo**: Compatible with custom development builds (not Expo Go)

## 🛠️ Troubleshooting

### Common Issues

#### `undefined is not an object (evaluating 'RNSound.IsAndroid')`

This usually indicates a linking issue. Try:

1. **Clear build cache**:

   ```bash
   cd android && ./gradlew cleanBuildCache
   ```

2. **Reset Metro cache**:

   ```bash
   npx react-native start --reset-cache
   ```

3. **Clean and rebuild**:

   ```bash
   # iOS
   cd ios && rm -rf build && cd .. && npx react-native run-ios

   # Android
   cd android && ./gradlew clean && cd .. && npx react-native run-android
   ```

#### iOS Build Issues

- Ensure audio files are added to Xcode project bundle
- Check that AVFoundation framework is linked (automatically handled by CocoaPods)

#### Android Build Issues

- Place audio files in `android/app/src/main/res/raw/`
- Use lowercase filenames without spaces or special characters
- Clear build cache if encountering linking issues

### Getting Help

- 📚 [Wiki Documentation](https://github.com/zmxv/react-native-sound/wiki)
- 🐛 [Issue Tracker](https://github.com/zmxv/react-native-sound/issues)
- 💬 [Discussions](https://github.com/zmxv/react-native-sound/discussions)

## 🎮 Demo & Examples

### Complete Example App

Check out our enhanced example app with both remote and local audio playback:

- 📁 [`/example`](./example) - Full-featured demo application
- 🎯 Remote URL audio playback
- 📱 Local bundled audio files
- 🎨 Modern UI with TypeScript

### Community Examples

- 🎵 [react-native-sound-playerview](https://github.com/benevbright/react-native-sound-playerview) - Advanced audio player UI component

## 🚀 Quick Start

### Setup Audio Files

#### Android

Save audio files in `android/app/src/main/res/raw/`:

```
android/app/src/main/res/raw/
├── whoosh.mp3        ✅ Correct
├── button_click.wav  ✅ Correct
└── my-sound.mp3      ❌ Use underscores: my_sound.mp3
```

> **Note**: Use lowercase, underscored filenames. No subdirectories allowed.

#### iOS

1. Open your project in Xcode
2. Right-click your project → "Add Files to [PROJECT]"
3. Select your audio files and ensure they're added to the app target

### Basic Usage

```typescript
import Sound from "react-native-sound";

// Enable playback in silence mode (important for iOS)
Sound.setCategory("Playback");

// Load a sound file from the app bundle
const whoosh = new Sound("whoosh.mp3", Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log("Failed to load the sound", error);
    return;
  }

  // Sound loaded successfully
  console.log("Duration:", whoosh.getDuration(), "seconds");
  console.log("Channels:", whoosh.getNumberOfChannels());

  // Play the sound
  whoosh.play((success) => {
    if (success) {
      console.log("Successfully finished playing");
    } else {
      console.log("Playback failed due to audio decoding errors");
    }
  });
});

// Audio controls
whoosh.setVolume(0.5); // 50% volume
whoosh.setPan(1); // Full right stereo
whoosh.setNumberOfLoops(-1); // Loop indefinitely

// Get current properties
console.log("Volume:", whoosh.getVolume());
console.log("Pan:", whoosh.getPan());
console.log("Loops:", whoosh.getNumberOfLoops());

// Seek to specific time
whoosh.setCurrentTime(2.5);

// Get current playback position
whoosh.getCurrentTime((seconds) => {
  console.log("Current time:", seconds);
});

// Control playback
whoosh.pause(); // Pause playback
whoosh.stop(() => {
  // Stop and rewind
  whoosh.play(); // Play from beginning
});

// Always release resources when done
whoosh.release();
```

### Advanced Examples

#### Loading from Different Sources

```typescript
// From app bundle (most common)
const bundleSound = new Sound("sound.mp3", Sound.MAIN_BUNDLE, callback);

// From documents directory
const docSound = new Sound("sound.mp3", Sound.DOCUMENT, callback);

// From library directory
const libSound = new Sound("sound.mp3", Sound.LIBRARY, callback);

// From absolute path
const pathSound = new Sound("/path/to/sound.mp3", "", callback);

// From remote URL (iOS/Android only)
const urlSound = new Sound("https://example.com/sound.mp3", "", callback);
```

#### React Hook Example

```typescript
import { useEffect, useRef, useState } from "react";
import Sound from "react-native-sound";

const useSound = (filename: string) => {
  const sound = useRef<Sound | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    sound.current = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log("Error loading sound:", error);
        return;
      }
      setIsLoaded(true);
    });

    return () => {
      sound.current?.release();
    };
  }, [filename]);

  const play = () => {
    if (sound.current && isLoaded) {
      sound.current.play((success) => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const stop = () => {
    if (sound.current) {
      sound.current.stop();
      setIsPlaying(false);
    }
  };

  return { play, stop, isLoaded, isPlaying };
};
```

## 📝 Important Notes

### Performance Tips

- **Preload sounds** during app initialization to minimize playback delay
- **Reuse Sound instances** for multiple playbacks of the same file
- **Avoid race conditions** by ensuring sounds are loaded before calling `play()`

### Audio Session Behavior

- **iOS**: Uses `AVAudioSessionCategoryAmbient` to mix multiple sounds
- **Multiple playback**: You can play several sound files simultaneously
- **Background audio**: Configure audio categories for background playback

### File Format Support

#### iOS (AVAudioPlayer)

Supports: AAC, AIFF, CAF, MP3, WAV, and more

- 📚 [Complete format list](https://developer.apple.com/library/archive/documentation/MusicAudio/Conceptual/CoreAudioOverview/SupportedAudioFormatsMacOSX/SupportedAudioFormatsMacOSX.html)

#### Android (MediaPlayer)

Supports: 3GPP, MP4, MP3, AAC, OGG, FLAC, WAV, and more

- 📚 [Complete format list](https://developer.android.com/guide/topics/media/media-formats)

### Path Handling

- **Android absolute paths**: Use `/sdcard/` prefix (e.g., `/sdcard/Downloads/sound.mp3`)
- **Method chaining**: Supported for setters (e.g., `sound.setVolume(0.5).setPan(0.5).play()`)

## 🎵 Audio Ecosystem

### Related Libraries

| Library                                                                                                  | Purpose                 | Best For                     |
| -------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------- |
| [react-native-video](https://github.com/react-native-video/react-native-video)                           | Video & audio streaming | Streaming audio/video        |
| [react-native-audio-toolkit](https://github.com/react-native-community/react-native-audio-toolkit)       | Advanced audio features | Recording & complex audio    |
| [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/)                                           | Expo audio solution     | Expo managed workflow        |
| [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage) | Storage                 | Persisting audio preferences |

### When to Use react-native-sound

- ✅ Playing sound effects and short audio clips
- ✅ Background music with simple controls
- ✅ Audio feedback for user interactions
- ✅ Cross-platform compatibility requirements
- ✅ TypeScript projects requiring type safety

### When to Consider Alternatives

- ❌ Audio streaming or long-form content
- ❌ Advanced audio processing or effects
- ❌ Audio recording capabilities
- ❌ Complex playlist management

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Areas Where We Need Help

- 🐛 Bug fixes and stability improvements
- 📚 Documentation improvements and examples
- 🧪 Test coverage expansion
- 🚀 Performance optimizations
- 🆕 New platform support

### Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Run the example app: `cd example && npm install && npm run android`
4. Make your changes and test thoroughly
5. Add tests for new features
6. Update documentation as needed

### Pull Request Guidelines

- 🔍 **Open an issue first** for major changes to discuss the approach
- ✅ **Include tests** for new functionality
- 📝 **Update documentation** including TypeScript definitions
- 🧪 **Test on multiple platforms** (iOS and Android)
- 📱 **Test with both architectures** (old and new React Native architecture)

### Code Style

- Follow existing TypeScript/JavaScript patterns
- Use meaningful commit messages
- Keep changes focused and atomic

- To minimize playback delay, you may want to preload a sound file without calling `play()` (e.g. `var s = new Sound(...);`) during app initialization. This also helps avoid a race condition where `play()` may be called before loading of the sound is complete, which results in no sound but no error because loading is still being processed.
- You can play multiple sound files at the same time. Under the hood, this module uses `AVAudioSessionCategoryAmbient` to mix sounds on iOS.
- You may reuse a `Sound` instance for multiple playbacks.
- On iOS, the module wraps `AVAudioPlayer` that supports aac, aiff, mp3, wav etc. The full list of supported formats can be found at https://developer.apple.com/library/content/documentation/MusicAudio/Conceptual/CoreAudioOverview/SupportedAudioFormatsMacOSX/SupportedAudioFormatsMacOSX.html
- On Android, the module wraps `android.media.MediaPlayer`. The full list of supported formats can be found at https://developer.android.com/guide/topics/media/media-formats.html
- On Android, the absolute path can start with '/sdcard/'. So, if you want to access a sound called "my_sound.mp3" on Downloads folder, the absolute path will be: '/sdcard/Downloads/my_sound.mp3'.
- You may chain non-getter calls, for example, `sound.setVolume(.5).setPan(.5).play()`.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🌟 Support the Project

If this library helps your project, consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs and issues
- 📝 Contributing improvements
- 💬 Helping others in discussions
- 📢 Sharing with the community

---

**Made with ❤️ by the React Native community**

[![Star on GitHub](https://img.shields.io/github/stars/zmxv/react-native-sound.svg?style=social)](https://github.com/zmxv/react-native-sound/stargazers)
