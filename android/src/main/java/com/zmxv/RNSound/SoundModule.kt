package com.zmxv.RNSound;


import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReactMethod

class SoundModule internal constructor(context: ReactApplicationContext) :
  SoundSpec(context) {
  private var module = Sound(context)

  @ReactMethod
  override fun prepare(fileName: String, key: Double, options: ReadableMap, callback: Callback) {
    module.prepare(fileName,key,options,callback)
  }
  @ReactMethod
  override fun setCategory(value: String, mixWithOthers: Boolean) {
    module.setCategory(value,mixWithOthers)
  }
  @ReactMethod
  override fun play(key: Double, callback: Callback) {
    module.play(key,callback)
  }
  @ReactMethod
  override fun pause(key: Double, callback: Callback) {
    module.pause(key,callback)
  }
  @ReactMethod
  override fun stop(key: Double, callback: Callback) {
    module.stop(key,callback)
  }
  @ReactMethod
  override fun reset(key: Double) {
    module.reset(key)
  }
  @ReactMethod
  override fun release(key: Double) {
    module.release(key)
  }
  @ReactMethod
  override fun setVolume(key: Double, left: Double, right: Double) {
    module.setVolume(key,left.toFloat(),right.toFloat())
  }
  @ReactMethod
  override fun getSystemVolume(callback: Callback) {
    module.getSystemVolume(callback)
  }


  @ReactMethod
  override fun setLooping(key: Double, looping: Boolean) {
    module.setLooping(key,looping)
  }

  @ReactMethod
  override fun setSpeed(key: Double, speed: Double) {
    module.setSpeed(key,speed.toFloat())
  }
  @ReactMethod
  override fun setPitch(key: Double, pitch: Double) {
    module.setPitch(key,pitch.toFloat())
  }
  @ReactMethod
  override fun setCurrentTime(key: Double, sec: Double) {
    module.setCurrentTime(key,sec.toFloat())
  }
  @ReactMethod
  override fun getCurrentTime(key: Double, callback: Callback) {
    module.getCurrentTime(key,callback)
  }
  @ReactMethod
  override fun setSpeakerphoneOn(key: Double, speaker: Boolean) {
    module.setSpeakerphoneOn(key,speaker)
  }
  @ReactMethod
  override fun setSystemVolume(value: Double) {
    module.setSystemVolume(value.toFloat())
  }

  @ReactMethod
  override fun addListener(eventName: String){
    // Keep: Needed for RN built in Event Emitter Calls
  }

 @ReactMethod
  override fun removeListeners(count: Double){
    // Keep: Needed for RN built in Event Emitter Calls
  }

  override fun getName(): String {
    return NAME
  }





  companion object {
    const val NAME = "RNSound"
  }
}
