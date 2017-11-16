package com.zmxv.RNSound;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

public class RNSoundPackage implements ReactPackage {

  @Override
  public List<NativeModule> createNativeModules (ReactApplicationContext context) {
    List<NativeModule> modules = new ArrayList<>();
    modules.add(new RNSoundModule(context));
    return modules;
  }

  // Deprecated RN 0.47
  public List<Class<? extends JavaScriptModule>> createJSModules() {
    return Collections.emptyList();
  }

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext context) {
    return Collections.emptyList();
  }
}
