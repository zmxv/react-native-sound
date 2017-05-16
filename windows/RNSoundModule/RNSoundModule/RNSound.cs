using ReactNative.Bridge;
using ReactNative.Collections;
using System;
using System.Collections.Generic;
using Windows.ApplicationModel.Core;
using Windows.UI.Core;
using Windows.UI.Popups;
using Windows.Media.Capture;
using Windows.Media.MediaProperties;
using Windows.Storage;
using Windows.Storage.Streams;
using Windows.UI.Xaml.Controls;
using System.Threading.Tasks;
using System.Diagnostics;
using System.IO;
using ReactNative.Modules.Core;
using System.Threading;
using Newtonsoft.Json.Linq;
using Windows.UI.Xaml;
using System.Windows;
using Windows.UI.Xaml.Media;
using Windows.Media.Playback;
using Windows.Media.Core;
using System.Text;

namespace RNSoundModule
{
    public class RNSound : ReactContextNativeModuleBase
    {
        private const String IsWindows = "IsWindows";
        private ReactContext context;

        Dictionary<int, MediaPlayer> playerPool = new Dictionary<int, MediaPlayer>();
        static Object NULL = null;



        public RNSound(ReactContext reactContext)
            : base(reactContext)
        {
            context = reactContext;
        }
        public override string Name
        {
            get
            {
                return "RNSound";
            }
        }
        public override void Initialize()
        {
        }

        public override IReadOnlyDictionary<string, object> Constants
        {
            get
            {
                return new Dictionary<string, object>
                {
                    { IsWindows, true },
                };
            }
        }


        [ReactMethod]
        public async void prepare(String fileName, int key, JObject options, ICallback callback)
        {
            bool enableSMTCIntegration = true;
            JToken smtcOptionToken = options["enableSMTCIntegration"];
            if (smtcOptionToken != null)
            {
                enableSMTCIntegration = smtcOptionToken.Value<bool>();
            }

            await CoreApplication.MainView.CoreWindow.Dispatcher.RunAsync(CoreDispatcherPriority.Normal, async () =>
            {
                MediaPlayer player = await createMediaPlayer(fileName, enableSMTCIntegration);
                player.MediaOpened +=
                    delegate
                    {
                        JObject props = new JObject();
                        props.Add("duration", player.PlaybackSession.NaturalDuration.TotalMilliseconds * .001);
                        callback.Invoke(NULL, props);
                    };
                player.AutoPlay = false;
                if (player == null)
                {
                    JObject e = new JObject();

                    e.Add("code", -1);
                    e.Add("message", "resource not found");
                    callback.Invoke(e);
                    return;
                }

                this.playerPool.Add(key, player);
            });
        }

        protected async Task<MediaPlayer> createMediaPlayer(String fileName, bool enableSMTCIntegration)
        {
            MediaPlayer player = new MediaPlayer();
            player.CommandManager.IsEnabled = enableSMTCIntegration;

            StorageFile file = null;
            await CoreApplication.MainView.CoreWindow.Dispatcher.RunAsync(CoreDispatcherPriority.Normal,
                async () =>
                {
                    StorageFolder LocalFolder = ApplicationData.Current.LocalFolder;
                    StorageFolder InstallationFolder = Windows.ApplicationModel.Package.Current.InstalledLocation;

                    try
                    {
                        file = await InstallationFolder.GetFileAsync(@"Assets\" + fileName);
                    }
                    catch (Exception e) { }

                    if (file == null)
                    {
                        try
                        {
                            file = await LocalFolder.GetFileAsync(fileName);
                        }
                        catch (Exception e) { }

                    }

                    if (file != null)
                    {
                        var stream = await file.OpenAsync(FileAccessMode.Read);

                        var mediaSource = MediaSource.CreateFromStorageFile(file);
                        player.Source = mediaSource;
                    }
                }).AsTask();

            return player;
        }

        [ReactMethod]
        public void play(int key, ICallback callback)
        {
            Boolean callbackWasCalled = false;
            MediaPlayer player = null;
            Debug.WriteLine("play()");

            if (!playerPool.TryGetValue(key, out player))
            {
                Debug.WriteLine("Player is null");
                callback.Invoke(false);
                return;
            }

            if (player == null)
            {
                Debug.WriteLine("Player is null");
                callback.Invoke(false);
                return;
            }
            if (player.PlaybackSession.PlaybackState == MediaPlaybackState.Playing)
            {
                Debug.WriteLine("Already playing...");
                return;
            }

            player.MediaEnded +=
                delegate
                {
                    if (callbackWasCalled) return;
                    callbackWasCalled = true;
                    Debug.WriteLine("Media Ended");
                    callback.Invoke(true);
                };

            player.Play();
        }

        [ReactMethod]
        public void pause(int key, ICallback callback)
        {
            MediaPlayer player = null;

            if (!playerPool.TryGetValue(key, out player))
            {
                return;
            }
            if (player != null && player.PlaybackSession.PlaybackState == MediaPlaybackState.Playing)
            {
                player.Pause();
            }
            callback.Invoke();
        }

        [ReactMethod]
        public void stop(int key, ICallback callback)
        {
            MediaPlayer player = null;

            if (!playerPool.TryGetValue(key, out player))
            {
                return;
            }

            player.Pause();
            player.PlaybackSession.Position = new TimeSpan(0);
            callback.Invoke();
        }

        [ReactMethod]
        public void release(int key)
        {
            MediaPlayer player = null;

            if (!playerPool.TryGetValue(key, out player))
            {
                return;
            }

            player.Source = null;
            playerPool.Remove(key);
        }

        [ReactMethod]
        public void setVolume(int key, float volume)
        {
            MediaPlayer player = null;

            if (!playerPool.TryGetValue(key, out player))
            {
                return;
            }

            player.Volume = volume;


        }

        [ReactMethod]
        public void setLooping(int key, bool looping)
        {
            MediaPlayer player = null;

            if (!playerPool.TryGetValue(key, out player))
            {
                return;
            }

            player.IsLoopingEnabled = looping;

        }

        [ReactMethod]
        public void setCurrentTime(int key, float seconds)
        {
            MediaPlayer player = null;

            if (!playerPool.TryGetValue(key, out player))
            {
                return;
            }

            player.PlaybackSession.Position = new TimeSpan(0, 0, 0, 0, (int)seconds * 1000);

        }

        [ReactMethod]
        public void getCurrentTime(int key, ICallback callback)
        {
            MediaPlayer player = null;

            if (!playerPool.TryGetValue(key, out player))
            {
                return;
            }
            callback.Invoke(player.PlaybackSession.Position.Milliseconds * .001, player.PlaybackSession.PlaybackState == MediaPlaybackState.Playing);
        }

        [ReactMethod]
        public void enable(bool enabled)
        {
            // no op
        }
    }
}
