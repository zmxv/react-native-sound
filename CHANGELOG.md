# Changelog

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
