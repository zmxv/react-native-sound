package com.zmxv.RNSound;

import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnCompletionListener;
import android.media.MediaPlayer.OnErrorListener;
import android.net.Uri;
import android.media.AudioManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.modules.core.ExceptionsManagerModule;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.io.IOException;

import android.util.Log;

public class RNSoundModule extends ReactContextBaseJavaModule implements AudioManager.OnAudioFocusChangeListener {
  Map<Double, MediaPlayer> playerPool = new HashMap<>();
  ReactApplicationContext context;
  final static Object NULL = null;
  String category;
  Boolean mixWithOthers = true;
  Double focusedPlayerKey;
  Boolean wasPlayingBeforeFocusChange = false;

  public RNSoundModule(ReactApplicationContext context) {
    super(context);
    this.context = context;
    this.category = null;
  }

  private void setOnPlay(boolean isPlaying, final Double playerKey) {
    final ReactContext reactContext = this.context;
    WritableMap params = Arguments.createMap();
    params.putBoolean("isPlaying", isPlaying);
    params.putDouble("playerKey", playerKey);
    reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("onPlayChange", params);
  }

  @Override
  public String getName() {
    return "RNSound";
  }

  @ReactMethod
  public void prepare(final String fileName, final Double key, final ReadableMap options, final Callback callback) {
    MediaPlayer player = createMediaPlayer(fileName);
    if (player == null) {
      WritableMap e = Arguments.createMap();
      e.putInt("code", -1);
      e.putString("message", "resource not found");
      callback.invoke(e, NULL);
      return;
    }
    this.playerPool.put(key, player);

    final RNSoundModule module = this;

    if (module.category != null) {
      Integer category = null;
      switch (module.category) {
        case "Playback":
          category = AudioManager.STREAM_MUSIC;
          break;
        case "Ambient":
          category = AudioManager.STREAM_NOTIFICATION;
          break;
        case "System":
          category = AudioManager.STREAM_SYSTEM;
          break;
        case "Voice":
          category = AudioManager.STREAM_VOICE_CALL;
          break;
        case "Ring":
          category = AudioManager.STREAM_RING;
          break;
        case "Alarm":
          category = AudioManager.STREAM_ALARM;
          break;
        default:
          Log.e("RNSoundModule", String.format("Unrecognised category %s", module.category));
          break;
      }
      if (category != null) {
        player.setAudioStreamType(category);
      }
    }

    player.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
      boolean callbackWasCalled = false;

      @Override
      public synchronized void onPrepared(MediaPlayer mp) {
        if (callbackWasCalled) return;
        callbackWasCalled = true;

        WritableMap props = Arguments.createMap();
        props.putDouble("duration", mp.getDuration() * .001);
        try {
          callback.invoke(NULL, props);
        } catch(RuntimeException runtimeException) {
          // The callback was already invoked
          Log.e("RNSoundModule", "Exception", runtimeException);
        }
      }

    });

    player.setOnErrorListener(new OnErrorListener() {
      boolean callbackWasCalled = false;

      @Override
      public synchronized boolean onError(MediaPlayer mp, int what, int extra) {
        if (callbackWasCalled) return true;
        callbackWasCalled = true;
        try {
          WritableMap props = Arguments.createMap();
          props.putInt("what", what);
          props.putInt("extra", extra);
          callback.invoke(props, NULL);
        } catch(RuntimeException runtimeException) {
          // The callback was already invoked
          Log.e("RNSoundModule", "Exception", runtimeException);
        }
        return true;
      }
    });

    try {
      if(options.hasKey("loadSync") && options.getBoolean("loadSync")) {
        player.prepare();
      } else {
        player.prepareAsync();
      }
    } catch (Exception ignored) {
      // When loading files from a file, we useMediaPlayer.create, which actually
      // prepares the audio for us already. So we catch and ignore this error
      Log.e("RNSoundModule", "Exception", ignored);
    }
  }

  protected MediaPlayer createMediaPlayer(final String fileName) {
    int res = this.context.getResources().getIdentifier(fileName, "raw", this.context.getPackageName());
    MediaPlayer mediaPlayer = new MediaPlayer();
    if (res != 0) {
      try {
        AssetFileDescriptor afd = context.getResources().openRawResourceFd(res);
        mediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
        afd.close();
      } catch (IOException e) {
        Log.e("RNSoundModule", "Exception", e);
        return null;
      }
      return mediaPlayer;
    }

    if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
      mediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
      Log.i("RNSoundModule", fileName);
      try {
        mediaPlayer.setDataSource(fileName);
      } catch(IOException e) {
        Log.e("RNSoundModule", "Exception", e);
        return null;
      }
      return mediaPlayer;
    }

    if (fileName.startsWith("asset:/")){
        try {
            AssetFileDescriptor descriptor = this.context.getAssets().openFd(fileName.replace("asset:/", ""));
            mediaPlayer.setDataSource(descriptor.getFileDescriptor(), descriptor.getStartOffset(), descriptor.getLength());
            descriptor.close();
            return mediaPlayer;
        } catch(IOException e) {
            Log.e("RNSoundModule", "Exception", e);
            return null;
        }
    }

    File file = new File(fileName);
    if (file.exists()) {
      mediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
      Log.i("RNSoundModule", fileName);
      try {
          mediaPlayer.setDataSource(fileName);
      } catch(IOException e) {
          Log.e("RNSoundModule", "Exception", e);
          return null;
      }
      return mediaPlayer;
    }
    
    return null;
  }

  @ReactMethod
  public void play(final Double key, final Callback callback) {
    MediaPlayer player = this.playerPool.get(key);
    if (player == null) {
      setOnPlay(false, key);
      if (callback != null) {
          callback.invoke(false);
      }
      return;
    }
    if (player.isPlaying()) {
      return;
    }

    // Request audio focus in Android system
    if (!this.mixWithOthers) {
      AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);

      audioManager.requestAudioFocus(this, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);

      this.focusedPlayerKey = key;
    }

    player.setOnCompletionListener(new OnCompletionListener() {
      boolean callbackWasCalled = false;

      @Override
      public synchronized void onCompletion(MediaPlayer mp) {
        if (!mp.isLooping()) {
          setOnPlay(false, key);
          if (callbackWasCalled) return;
          callbackWasCalled = true;
          try {
            callback.invoke(true);
          } catch (Exception e) {
              //Catches the exception: java.lang.RuntimeException·Illegal callback invocation from native module
          }
        }
      }
    });
    player.setOnErrorListener(new OnErrorListener() {
      boolean callbackWasCalled = false;

      @Override
      public synchronized boolean onError(MediaPlayer mp, int what, int extra) {
        setOnPlay(false, key);
        if (callbackWasCalled) return true;
        callbackWasCalled = true;
        try {
          callback.invoke(true);
        } catch (Exception e) {
          //Catches the exception: java.lang.RuntimeException·Illegal callback invocation from native module
        }
        return true;
      }
    });
    player.start();
    setOnPlay(true, key);
  }

  @ReactMethod
  public void pause(final Double key, final Callback callback) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null && player.isPlaying()) {
      player.pause();
    }

    if (callback != null) {
      callback.invoke();
    }
  }

  @ReactMethod
  public void stop(final Double key, final Callback callback) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null && player.isPlaying()) {
      player.pause();
      player.seekTo(0);
    }

    // Release audio focus in Android system
    if (!this.mixWithOthers && key == this.focusedPlayerKey) {
      AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
      audioManager.abandonAudioFocus(this);
    }

    callback.invoke();
  }

  @ReactMethod
  public void reset(final Double key) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null) {
      player.reset();
    }
  }

  @ReactMethod
  public void release(final Double key) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null) {
      player.reset();
      player.release();
      this.playerPool.remove(key);

      // Release audio focus in Android system
      if (!this.mixWithOthers && key == this.focusedPlayerKey) {
        AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
        audioManager.abandonAudioFocus(this);
      }
    }
  }
	
  @Override
  public void onCatalystInstanceDestroy() {
    java.util.Iterator it = this.playerPool.entrySet().iterator();
    while (it.hasNext()) {
      Map.Entry entry = (Map.Entry)it.next();
      MediaPlayer player = (MediaPlayer)entry.getValue();
      if (player != null) {
        player.reset();
        player.release();
      }
      it.remove();
    }
  }

  @ReactMethod
  public void setVolume(final Double key, final Float left, final Float right) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null) {
      player.setVolume(left, right);
    }
  }

  @ReactMethod
  public void getSystemVolume(final Callback callback) {
    try {
      AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);

      callback.invoke((float) audioManager.getStreamVolume(AudioManager.STREAM_MUSIC) / audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC));
    } catch (Exception error) {
      WritableMap e = Arguments.createMap();
      e.putInt("code", -1);
      e.putString("message", error.getMessage());
      callback.invoke(e);
    }
  }

  @ReactMethod
  public void setSystemVolume(final Float value) {
    AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);

    int volume = Math.round(audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC) * value);
    audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, volume, 0);
  }

  @ReactMethod
  public void setLooping(final Double key, final Boolean looping) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null) {
      player.setLooping(looping);
    }
  }

  @ReactMethod
  public void setSpeed(final Double key, final Float speed) {
	if (android.os.Build.VERSION.SDK_INT < 23) {
	  Log.w("RNSoundModule", "setSpeed ignored due to sdk limit");
	  return;
	}

    MediaPlayer player = this.playerPool.get(key);
    if (player != null) {
      player.setPlaybackParams(player.getPlaybackParams().setSpeed(speed));
    }
  }

  @ReactMethod
  public void setCurrentTime(final Double key, final Float sec) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null) {
      player.seekTo((int)Math.round(sec * 1000));
    }
  }

  @ReactMethod
  public void getCurrentTime(final Double key, final Callback callback) {
    MediaPlayer player = this.playerPool.get(key);
    if (player == null) {
      callback.invoke(-1, false);
      return;
    }
    callback.invoke(player.getCurrentPosition() * .001, player.isPlaying());
  }

  //turn speaker on
  @ReactMethod
  public void setSpeakerphoneOn(final Double key, final Boolean speaker) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null) {
      player.setAudioStreamType(AudioManager.STREAM_MUSIC);
      AudioManager audioManager = (AudioManager)this.context.getSystemService(this.context.AUDIO_SERVICE);
      if(speaker){
        audioManager.setMode(AudioManager.MODE_IN_COMMUNICATION);
      }else{
        audioManager.setMode(AudioManager.MODE_NORMAL);
      }
      audioManager.setSpeakerphoneOn(speaker);
    }
  }

  @ReactMethod
  public void setCategory(final String category, final Boolean mixWithOthers) {
    this.category = category;
    this.mixWithOthers = mixWithOthers;
  }

  @Override
  public void onAudioFocusChange(int focusChange) {
    if (!this.mixWithOthers) {
      MediaPlayer player = this.playerPool.get(this.focusedPlayerKey);

      if (player != null) {
        if (focusChange <= 0) {
            this.wasPlayingBeforeFocusChange = player.isPlaying();

            if (this.wasPlayingBeforeFocusChange) {
              this.pause(this.focusedPlayerKey, null);
            }
        } else {
            if (this.wasPlayingBeforeFocusChange) {
              this.play(this.focusedPlayerKey, null);
              this.wasPlayingBeforeFocusChange = false;
            }
        }
      }
    }
  }

  @ReactMethod
  public void enable(final Boolean enabled) {
    // no op
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put("IsAndroid", true);
    return constants;
  }
}
