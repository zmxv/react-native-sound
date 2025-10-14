# Copilot Instructions for react-native-sound

## Project Overview

This is a React Native native module that provides cross-platform audio playback capabilities for iOS, Android, and Windows. The library wraps platform-specific audio APIs (AVAudioPlayer on iOS, MediaPlayer on Android) and exposes them through a unified JavaScript interface.

## Architecture Patterns

### Native Bridge Structure

- **Turbo Modules**: Uses both old and new architecture patterns with TurboModule support
- **Platform Detection**: Code splits based on `Platform.OS` with different native implementations
- **Key-based Player Management**: Uses numeric keys to manage multiple concurrent audio players across the bridge

### Platform-Specific Implementations

- **iOS**: `ios/RNSound.mm` - Objective-C++ implementation using AVAudioPlayer
- **Android**: `android/src/main/java/com/zmxv/RNSound/` - Kotlin implementation using MediaPlayer
- **Windows**: `windows/RNSoundModule/` - C# implementation for UWP
- **TypeScript Specs**: `src/NativeSoundAndroid.ts` and `src/NativeSoundIOS.ts` define TurboModule interfaces

### Core Class Structure

The main `Sound` class in `src/index.ts` follows these patterns:

- Constructor overloading with optional parameters for different use cases
- Filename normalization (Android requires lowercase, no extensions for bundled assets)
- Event-driven architecture using NativeEventEmitter for playback state changes
- Resource management with explicit release() calls

## Key File Locations

### Core Implementation

- `src/index.ts` - Main JavaScript Sound class and API
- `src/index.d.ts` - TypeScript definitions with comprehensive type coverage
- `sound.js` - Legacy JavaScript-only entry point

### Native Modules

- `ios/RNSound.mm` - iOS implementation with audio session management
- `android/src/main/java/com/zmxv/RNSound/Sound.kt` - Android core audio logic
- `android/src/main/java/com/zmxv/RNSound/SoundModule.kt` - Android bridge module

### Build Configuration

- `RNSound.podspec` - iOS CocoaPods configuration with new architecture support
- `android/build.gradle` - Android build with Kotlin and new architecture detection
- `package.json` - Contains codegenConfig for TurboModule generation

## Critical Development Patterns

### File Path Handling

```javascript
// Android bundled assets must be lowercase, no extension
if (IsAndroid && !basePath && isRelativePath(filename)) {
  this._filename = filename.toLowerCase().replace(/\.[^.]+$/, "");
}
```

### Audio Category Management

Always set audio category before creating sounds:

```javascript
Sound.setCategory("Playback"); // Required for background audio
```

### Resource Management Pattern

```javascript
// Always release resources to prevent memory leaks
sound.release();
```

### Async Initialization

```javascript
// Sounds load asynchronously - check in callback before playing
var sound = new Sound("file.mp3", Sound.MAIN_BUNDLE, (error) => {
  if (error) return;
  sound.play();
});
```

## Testing and Example App

### Example App Structure

- `example/` - Full React Native test app
- `example/SoundPlayer.tsx` - Comprehensive UI demonstrating all features
- Uses remote URL loading for testing network audio capabilities

### Platform-Specific Asset Placement

- **Android**: `android/app/src/main/res/raw/` (lowercase, no subdirectories)
- **iOS**: Add to Xcode project bundle via "Add Files to [PROJECT]"

## Build and Development Workflow

### New Architecture Support

- Detects new architecture via `global.__turboModuleProxy`
- Falls back to legacy NativeModules for old architecture
- Code generation configured in package.json `codegenConfig`

### Common Build Issues

- **"undefined is not an object (evaluating 'RNSound.IsAndroid')"**: Clear Android build cache with `cd android && ./gradlew cleanBuildCache`
- Requires full rebuild after linking changes
- Expo Go not supported - requires custom development build

## Integration Points

### Event System

- Uses NativeEventEmitter for real-time playback state updates
- Event: `onPlayChange` with `{isPlaying: boolean, playerKey: number}`

### Audio Session Integration

- iOS: Handles interruptions and route changes automatically
- Android: Manages audio focus for proper system integration
- Category settings affect how audio mixes with other apps

### Memory Management

- Players stored in native pools (iOS: NSMutableDictionary, Android: MutableMap)
- Explicit cleanup required via `release()` method
- Background processes can cause memory leaks if not properly managed

## Platform Differences to Consider

### Feature Support Matrix

Reference the comprehensive feature matrix in README.md - not all features work on all platforms (e.g., pan control iOS-only, system volume control Android-only).

### File Format Support

- iOS: Uses AVAudioPlayer supported formats (aac, aiff, mp3, wav, etc.)
- Android: Uses MediaPlayer supported formats
- Network loading not supported on Windows platform
