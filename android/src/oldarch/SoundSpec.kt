package com.zmxv.RNSound;

import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReadableMap

abstract class SoundSpec internal constructor(context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {

  abstract fun prepare(fileName: String, key: Double, options: ReadableMap, callback: Callback)
  abstract fun play(key: Double, callback: Callback)
  abstract fun pause(key: Double, callback: Callback)
  abstract fun stop(key: Double, callback: Callback)
  abstract fun reset(key: Double)
  abstract fun release(key: Double)
  abstract fun setVolume(key: Double, left: Double, right: Double)
  abstract fun getSystemVolume(callback: Callback)
  abstract fun setSystemVolume(value: Double)
  abstract fun setLooping(key: Double, looping: Boolean)
  abstract fun setSpeed(key: Double, speed: Double)
  abstract fun setPitch(key: Double, pitch: Double)
  abstract fun setCurrentTime(key: Double, sec: Double)
  abstract fun getCurrentTime(key: Double, callback: Callback)
  abstract fun setSpeakerphoneOn(key: Double, speaker: Boolean)
  abstract fun setCategory(value: String, mixWithOthers: Boolean)
  abstract fun addListener(eventName: String)
  abstract fun removeListeners(count: Double)

}
