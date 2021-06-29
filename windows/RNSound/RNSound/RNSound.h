#pragma once

#include "pch.h"
#include "NativeModules.h"

using namespace winrt::Microsoft::ReactNative;

#ifdef RNW61
#define JSVALUEOBJECTPARAMETER
#else
#define JSVALUEOBJECTPARAMETER const &
#endif

namespace winrt::RNSound {
  REACT_MODULE(RNSound);
  struct RNSound {
    const std::string Name = "RNSound";

    REACT_CONSTANT(IsAndroid);
    const bool IsAndroid = false;

    REACT_CONSTANT(IsWindows);
    const bool IsWindows = true;

    REACT_METHOD(Prepare, L"prepare")
    void Prepare(const std::string& fileName, int key, JSValueObject options,
        std::function<void(JSValue, JSValue)> callback) noexcept;

    REACT_METHOD(Play, L"play")
    void Play(int key, std::function<void(bool)> callback) noexcept;

    REACT_METHOD(Pause, L"pause")
    void Pause(int key, std::function<void()> callback) noexcept;

    REACT_METHOD(Stop, L"stop")
    void Stop(int key, std::function<void()> callback) noexcept;

    REACT_METHOD(Release, L"release")
    void Release(int key) noexcept;

    REACT_METHOD(SetVolume, L"setVolume")
    void SetVolume(int key, float volume) noexcept;

    REACT_METHOD(SetLooping, L"setLooping")
    void SetLooping(int key, bool looping) noexcept;

    REACT_METHOD(SetCurrentTime, L"setCurrentTime")
    void SetCurrentTime(int key, float seconds) noexcept;

    REACT_METHOD(GetCurrentTime, L"getCurrentTime")
    void GetCurrentTime(int key,
                        std::function<void(float, bool)> callback) noexcept;

    REACT_METHOD(Enable, L"enable")
    void Enable(bool enable) noexcept;

private:

    winrt::Windows::Foundation::IAsyncAction
    loadFile(winrt::Windows::Media::Playback::MediaPlayer player, const std::string &fileName);

    std::map<int, winrt::Windows::Media::Playback::MediaPlayer> playerPool;
  };
}
