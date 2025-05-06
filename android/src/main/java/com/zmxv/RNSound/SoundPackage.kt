package com.zmxv.RNSound;

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.NativeModule
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.module.model.ReactModuleInfo
import java.util.HashMap

class SoundPackage : TurboReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == SoundModule.NAME) {
      SoundModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
      val isTurboModule: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      val canOverrideExistingModule=false
      val needsEagerInit=false
      val isCxxModule=false
      moduleInfos[SoundModule.NAME] = ReactModuleInfo(
        SoundModule.NAME,
        SoundModule.NAME,
        canOverrideExistingModule,
        needsEagerInit,
        isCxxModule,
        isTurboModule
      )
      moduleInfos
    }
  }

}
