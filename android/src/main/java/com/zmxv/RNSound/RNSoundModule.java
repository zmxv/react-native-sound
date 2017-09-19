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
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.ExceptionsManagerModule;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.io.IOException;

import android.util.Log;

public class RNSoundModule extends ReactContextBaseJavaModule {
  Map<Integer, MediaPlayer> playerPool = new HashMap<>();
  ReactApplicationContext context;
  final static Object NULL = null;

  public RNSoundModule(ReactApplicationContext context) {
    super(context);
    this.context = context;
  }

  @Override
  public String getName() {
    return "RNSound";
  }

  @ReactMethod
  public void prepare(final String fileName, final Integer key, final ReadableMap options, final Callback callback) {
    int audioStreamType = AudioManager.STREAM_MUSIC;
    if (options.hasKey("audioStreamType")) {
      String audioStreamTypeStr = options.getString("audioStreamType");
      if (audioStreamTypeStr.equals("ALARM")) {
        audioStreamType = AudioManager.STREAM_ALARM;
      } else if (audioStreamTypeStr.equals("DTMF")) {
        audioStreamType = AudioManager.STREAM_DTMF;
      } else if (audioStreamTypeStr.equals("MUSIC")) {
        audioStreamType = AudioManager.STREAM_MUSIC;
      } else if (audioStreamTypeStr.equals("NOTIFICATION")) {
        audioStreamType = AudioManager.STREAM_NOTIFICATION;
      } else if (audioStreamTypeStr.equals("RING")) {
        audioStreamType = AudioManager.STREAM_RING;
      } else if (audioStreamTypeStr.equals("SYSTEM")) {
        audioStreamType = AudioManager.STREAM_SYSTEM;
      } else if (audioStreamTypeStr.equals("VOICE_CALL")) {
        audioStreamType = AudioManager.STREAM_VOICE_CALL;
      } else {
        audioStreamType = AudioManager.STREAM_MUSIC;
      }
    }

    MediaPlayer player = createMediaPlayer(fileName);
    if (player == null) {
      WritableMap e = Arguments.createMap();
      e.putInt("code", -1);
      e.putString("message", "resource not found");
      return;
    }

    final RNSoundModule module = this;
    final int audioStreamTypeFinal = audioStreamType;
    
    player.setAudioStreamType(audioStreamTypeFinal);

    player.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
      boolean callbackWasCalled = false;

      @Override
      public synchronized void onPrepared(MediaPlayer mp) {
        if (callbackWasCalled) return;
        callbackWasCalled = true;

        module.playerPool.put(key, mp);
        WritableMap props = Arguments.createMap();
        props.putDouble("duration", mp.getDuration() * .001);
        try {
          callback.invoke(NULL, props);
        } catch(RuntimeException runtimeException) {
          // The callback was already invoked
          Log.e("RNSoundModule", "Exception", runtimeException);
        }
        module.context.getCurrentActivity().setVolumeControlStream(audioStreamTypeFinal);
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
      player.prepareAsync();
    } catch (IllegalStateException ignored) {
      // When loading files from a file, we useMediaPlayer.create, which actually
      // prepares the audio for us already. So we catch and ignore this error
    }
  }

  protected MediaPlayer createMediaPlayer(final String fileName) {
    int res = this.context.getResources().getIdentifier(fileName, "raw", this.context.getPackageName());
    if (res != 0) {
      String resFilename = "android.resource://" + this.context.getPackageName() + "/raw/" + fileName;
      MediaPlayer mediaPlayer = new MediaPlayer();
      try {
        mediaPlayer.setDataSource(this.context, Uri.parse(resFilename));
      } catch(IOException e) {
        Log.e("RNSoundModule", "Exception", e);
        return null;
      }
      return mediaPlayer;
    }
    if(fileName.startsWith("http://") || fileName.startsWith("https://")) {
      MediaPlayer mediaPlayer = new MediaPlayer();
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
            MediaPlayer mediaPlayer = new MediaPlayer();
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
      Uri uri = Uri.fromFile(file);
      MediaPlayer mediaPlayer = new MediaPlayer();
      try {
        mediaPlayer.setDataSource(this.context, uri);
      } catch(IOException e) {
        Log.e("RNSoundModule", "Exception", e);
        return null;
      }
      return mediaPlayer;
    }
    return null;
  }

  @ReactMethod
  public void play(final Integer key, final Callback callback) {
    MediaPlayer player = this.playerPool.get(key);
    if (player == null) {
      callback.invoke(false);
      return;
    }
    if (player.isPlaying()) {
      return;
    }
    player.setOnCompletionListener(new OnCompletionListener() {
      boolean callbackWasCalled = false;

      @Override
      public synchronized void onCompletion(MediaPlayer mp) {
        if (!mp.isLooping()) {
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
        if (callbackWasCalled) return true;
        callbackWasCalled = true;
        callback.invoke(false);
        return true;
      }
    });
    player.start();
  }

  @ReactMethod
  public void pause(final Integer key, final Callback callback) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null && player.isPlaying()) {
      player.pause();
    }
    callback.invoke();
  }

  @ReactMethod
  public void stop(final Integer key, final Callback callback) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null && player.isPlaying()) {
      player.pause();
      player.seekTo(0);
    }
    callback.invoke();
  }

  @ReactMethod
  public void reset(final Integer key) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null) {
      player.reset();
    }
  }

  @ReactMethod
  public void release(final Integer key) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null) {
      player.release();
      this.playerPool.remove(key);
    }
  }

  @ReactMethod
  public void setVolume(final Integer key, final Float left, final Float right) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null) {
      player.setVolume(left, right);
    }
  }

  @ReactMethod
  public void getSystemVolume(final Callback callback) {
    try {
      AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);

      callback.invoke(NULL, (float) audioManager.getStreamVolume(AudioManager.STREAM_MUSIC) / audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC));
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
  public void setLooping(final Integer key, final Boolean looping) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null) {
      player.setLooping(looping);
    }
  }

  @ReactMethod
  public void setSpeed(final Integer key, final Float speed) {
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
      MediaPlayer player = this.playerPool.get(key);
      if (player != null) {
        player.setPlaybackParams(player.getPlaybackParams().setSpeed(speed));
      }
    }
  }

  @ReactMethod
  public void setCurrentTime(final Integer key, final Float sec) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null) {
      player.seekTo((int)Math.round(sec * 1000));
    }
  }

  @ReactMethod
  public void getCurrentTime(final Integer key, final Callback callback) {
    MediaPlayer player = this.playerPool.get(key);
    if (player == null) {
      callback.invoke(-1, false);
      return;
    }
    callback.invoke(player.getCurrentPosition() * .001, player.isPlaying());
  }

  //turn speaker on
  @ReactMethod
  public void setSpeakerphoneOn(final Integer key, final Boolean speaker) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null) {
      AudioManager audioManager = (AudioManager)this.context.getSystemService(this.context.AUDIO_SERVICE);
      audioManager.setSpeakerphoneOn(speaker);
    }
  }

  @ReactMethod
  public void enable(final Boolean enabled) {
    // no op
  }

  @ReactMethod
  public void isPlaying(final Integer key, Promise promise) {
    MediaPlayer player = this.playerPool.get(key);
    if (player != null) {
      promise.resolve(player.isPlaying());
    } else {
      promise.resolve(false);
    }
  }

  @ReactMethod
  public void isHeadsetPluggedIn(Promise promise) {
    AudioManager audioManager = (AudioManager)this.context.getSystemService(this.context.AUDIO_SERVICE);
    boolean headphonesLocated = audioManager.isWiredHeadsetOn() || audioManager.isBluetoothA2dpOn() || audioManager.isBluetoothScoOn();
    promise.resolve(headphonesLocated);
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put("IsAndroid", true);
    return constants;
  }
}
