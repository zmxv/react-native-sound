# Changelog
## 1.0.0
**BREAKING CHANGE**

This is a full refactoring using TypeScript

What's new?:
- All async actions are now using promises instead of callback
- Implemented some explicit methods for states
- Added `rejectOnUnsupportedFeature {Boolean} (default: false)` to reject promises
 when an incompatible feature is used
- The whole library is now a class
- Enhanced native typing

## 0.11.0

New features:

- Add support for `Sound.setCategory('Alarm')` on Android
- Update Visual Studio path definition to support Windows UWP in CI.

Bug fixes:

- Use incrementing keys instead of a filename hash to allow multiple Sound
  instances for the same filename.
- Update Podfile reference to fix build under React Native 0.60.
- Fix getSystemVolume callback on Android for parity with iOS.
- Prevent a crash under iOS 8.

Other improvements:

- Documentation improvements.
