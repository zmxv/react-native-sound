import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";
interface SoundOptionTypes {
  speed: number;
  loadSync: boolean;
}
export interface Spec extends TurboModule {
  setVolume: (key: number, left: number, right: number) => void;
  setSpeed: (key: number, speed: number) => void;
  setSystemVolume: (value: number) => void;
  getSystemVolume: (callback: (volume: number) => void) => void;
  getCurrentTime: (
    key: number,
    callback: (currentTime: number) => void
  ) => void;
  setCurrentTime: (key: number, currentTime: number) => void;
  play: (key: number, callback: (success: boolean) => void) => void;
  pause: (key: number, callback: () => void) => void;
  stop: (key: number, callback: () => void) => void;
  reset: (key: number) => void;
  release: (key: number) => void;
  prepare: (
    fileName: string,
    key: number,
    options: SoundOptionTypes,
    callback: () => void
  ) => void;
  setCategory: (value: string, mixWithOthers: boolean) => void;
  setLooping: (key: number, isLooping: boolean) => void;
  setSpeakerphoneOn: (key: number, value: boolean) => void;
  setPitch: (key: number, pitch: number) => void;
  addListener: (eventName: string) => void;
  removeListeners: (count: number) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>("RNSound");
