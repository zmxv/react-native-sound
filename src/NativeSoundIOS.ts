import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";
interface SoundOptionTypes {
  speed: number;
  loadSync: boolean;
}
export interface Spec extends TurboModule {
  readonly getDirectories: () => {
    MainBundlePath: string;
    NSDocumentDirectory: string;
    NSLibraryDirectory: string;
    NSCachesDirectory: string;
  };
  setVolume: (key: number, left: number, right: number) => void;
  setMode: (value: string) => void;
  setSpeed: (key: number, speed: number) => void;
  setPan: (key: number, pan: number) => void;
  getSystemVolume: (callback: (volume: number) => void) => void;
  getCurrentTime: (
    key: number,
    callback: (currentTime: number) => void
  ) => void;
  setCurrentTime: (key: number, currentTime: number) => void;
  play: (key: number, callback: (success: boolean) => void) => void;
  pause: (key: number, callback: () => void) => void;
  stop: (key: number, callback: () => void) => void;
  release: (key: number) => void;
  prepare: (
    fileName: string,
    key: number,
    options: SoundOptionTypes,
    callback: () => void
  ) => void;
  enableInSilenceMode: (enabled: boolean) => void;
  enable: (enabled: boolean) => void;
  setActive: (value: boolean) => void;
  setCategory: (value: string, mixWithOthers?: boolean) => void;
  setSpeakerPhone: (key: number, isSpeaker: boolean) => void;
  setNumberOfLoops: (key: number, loops: number) => void;
  addListener: (eventName: string) => void;
  removeListeners: (count: number) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>("RNSound") as Spec;
