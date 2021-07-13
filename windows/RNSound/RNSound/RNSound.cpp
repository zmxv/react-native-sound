#include "pch.h"
#include "RNSound.h"

using namespace winrt::Windows::ApplicationModel;
using namespace winrt::Windows::Media::Core;
using namespace winrt::Windows::Media::Playback;
using namespace winrt::Windows::Storage;
using namespace winrt::RNSound;

void RNSound::Prepare(const std::string& fileName, int key, JSValueObject options,
    std::function<void(JSValue, JSValue)> callback) noexcept {
    bool enableSMTCIntegration = true;
    if (options["enableSMTCIntegration"] != nullptr) {
        enableSMTCIntegration = options["enableSMTCIntegration"].AsBoolean();
    }

    MediaPlayer player{};
    loadFile(player, fileName);

    player.CommandManager().IsEnabled(enableSMTCIntegration);

    if (player == nullptr) {
        JSValueObject e{};
        e["code"] = -1;
        e["message"] = "resource not found";
        callback(std::move(e), nullptr);
        return;
    }

    player.AutoPlay(false);
    player.MediaOpened(
        [callback](winrt::Windows::Media::Playback::MediaPlayer sender,
               const winrt::Windows::Foundation::IInspectable &) {
            JSValueObject props{};
            props["duration"] = sender.PlaybackSession().NaturalDuration().count() / 
                winrt::impl::filetime_period::den;
            callback(nullptr, std::move(props));
        });

    playerPool[key] = player;
}

winrt::Windows::Foundation::IAsyncAction RNSound::loadFile(MediaPlayer player,
    const std::string &fileName) {
    if (fileName.rfind("http", 0) == 0)
    {
        winrt::Windows::Foundation::Uri uri{ winrt::to_hstring(fileName) };
        auto mediaSource = MediaSource::CreateFromUri(uri);
        player.Source(mediaSource);
    }
    else
    {
        StorageFile file{nullptr};
        StorageFolder LocalFolder = ApplicationData::Current().LocalFolder();
        StorageFolder InstallationFolder =
            winrt::Windows::ApplicationModel::Package::Current()
            .InstalledLocation();

        try {
            file = co_await winrt::Windows::ApplicationModel::Package::Current()
                .InstalledLocation().GetFileAsync(winrt::to_hstring(fileName));
        }
        catch (winrt::hresult_error const& ex) {
            (void)ex;
        }

        if (file == nullptr) {
            try {
                auto filePath = std::string("Assets\\") + fileName;
                file = co_await winrt::Windows::ApplicationModel::Package::Current()
                    .InstalledLocation()
                    .GetFileAsync(winrt::to_hstring(filePath));
            }
            catch (winrt::hresult_error const& ex) {
                (void)ex;
            }
        }

        if (file == nullptr) {
            try {
                file =
                    co_await LocalFolder.GetFileAsync(winrt::to_hstring(fileName));
            }
            catch (winrt::hresult_error const& ex) {
                (void)ex;
            }
        }

        if (file != nullptr) {
            auto stream = co_await file.OpenAsync(FileAccessMode::Read);

            auto mediaSource = MediaSource::CreateFromStorageFile(file);
            player.Source(mediaSource);
        }
    }
}

void RNSound::Play(int key,
                   std::function<void(bool)> callback) noexcept {
    bool callbackWasCalled = false;

    OutputDebugStringA("play()");

    if (playerPool.find(key) == playerPool.end()) {
        OutputDebugStringA("Player is null");
        callback(false);
        return;
    }

    auto player = playerPool[key];
    if (player == nullptr) {
        OutputDebugStringA("Player is null");
        callback(false);
        return;
    }

    if (player.PlaybackSession().PlaybackState() == MediaPlaybackState::Playing) {
        OutputDebugStringA("Already playing...");
        return;
    }

    player.MediaEnded(
        [callback, &callbackWasCalled](winrt::Windows::Media::Playback::MediaPlayer sender,
            const winrt::Windows::Foundation::IInspectable &) {
            if (callbackWasCalled)
                return;
            callbackWasCalled = true;
            OutputDebugStringA("Media Ended");
            callback(true);
        });

    player.Play();
}

void RNSound::Pause(int key, std::function<void()> callback) noexcept {
    if (playerPool.find(key) == playerPool.end()) {
        return;
    }

    auto player = playerPool[key];
    if (player != nullptr && player.PlaybackSession().PlaybackState() ==
                                 MediaPlaybackState::Playing) {
        player.Pause();
    }

    callback();
}

void RNSound::Stop(int key, std::function<void()> callback) noexcept {

    if (playerPool.find(key) == playerPool.end()) {
        return;
    }

    auto player = playerPool[key];
    if (player != nullptr) {
        player.Pause();
        player.PlaybackSession().Position(winrt::Windows::Foundation::TimeSpan(0));
        callback();
    }
}

void RNSound::Release(int key) noexcept {
    if (playerPool.find(key) == playerPool.end()) {
        return;
    }

    auto player = playerPool[key];
    if (player != nullptr) {
        player.Source(nullptr);
    }

    playerPool.erase(key);
}

void RNSound::SetVolume(int key, float volume) noexcept {
    if (playerPool.find(key) == playerPool.end()) {
        return;
    }

    auto player = playerPool[key];
    if (player != nullptr) {
        player.Volume(volume);
    }
}

void RNSound::SetLooping(int key, bool looping) noexcept {
    if (playerPool.find(key) == playerPool.end()) {
        return;
    }

    auto player = playerPool[key];
    if (player != nullptr) {
        player.IsLoopingEnabled(looping);
    }
}

void RNSound::SetCurrentTime(int key, float seconds) noexcept {
    if (playerPool.find(key) == playerPool.end()) {
        return;
    }

    auto player = playerPool[key];
    if (player != nullptr) {
        player.PlaybackSession().Position(winrt::Windows::Foundation::TimeSpan((int)seconds * 1000));
    }
}

void RNSound::GetCurrentTime(int key,
                             std::function<void(float, bool)> callback) noexcept {
    if (playerPool.find(key) == playerPool.end()) {
        return;
    }

    auto player = playerPool[key];
    if (player != nullptr) {
        callback(player.PlaybackSession().Position().count() * .001f,
                        player.PlaybackSession().PlaybackState() ==
                            MediaPlaybackState::Playing);
    }
}

void RNSound::Enable(bool enable) noexcept {
    // no op
    (void)enable;
}