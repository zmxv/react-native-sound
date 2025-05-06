package com.zmxv.RNSound;


import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap

open class SoundSpec internal constructor(context: ReactApplicationContext) :
  NativeSoundAndroidSpec(context) {
  private var module = Sound(context)

  override fun prepare(fileName: String, key: Double, options: ReadableMap, callback: Callback) {
    module.prepare(fileName,key,options,callback)
  }


  override fun setCategory(value: String, mixWithOthers: Boolean) {
    module.setCategory(value,mixWithOthers)
  }


  override fun play(key: Double, callback: Callback) {
    module.play(key,callback)
  }

  override fun pause(key: Double, callback: Callback) {
    module.pause(key,callback)
  }

  override fun stop(key: Double, callback: Callback) {
    module.stop(key,callback)
  }

  override fun reset(key: Double) {
    module.reset(key)
  }

  override fun release(key: Double) {
    module.release(key)
  }

  override fun setVolume(key: Double, left: Double, right: Double) {
    module.setVolume(key,left.toFloat(),right.toFloat())
  }

  override fun getSystemVolume(callback: Callback) {
    module.getSystemVolume(callback)
  }



  override fun setLooping(key: Double, looping: Boolean) {
    module.setLooping(key,looping)
  }
  override fun setSpeed(key: Double, speed: Double) {
    module.setSpeed(key,speed.toFloat())
  }

  override fun setPitch(key: Double, pitch: Double) {
    module.setPitch(key,pitch.toFloat())
  }

  override fun setCurrentTime(key: Double, sec: Double) {
    module.setCurrentTime(key,sec.toFloat())
  }

  override fun getCurrentTime(key: Double, callback: Callback) {
    module.getCurrentTime(key,callback)
  }

  override fun setSpeakerphoneOn(key: Double, speaker: Boolean) {
    module.setSpeakerphoneOn(key,speaker)
  }

  override fun setSystemVolume(value: Double) {
    module.setSystemVolume(value.toFloat())
  }

  override fun addListener(eventName: String){
    // Keep: Needed for RN built in Event Emitter Calls
  }

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
