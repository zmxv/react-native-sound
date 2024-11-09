import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
interface SoundOptionTypes {
  speed: number;
  loadSync: boolean;
}
export interface Spec extends TurboModule {
  setVolume: (key: number, left: number, right: number) => void;
  setMode: (value: string) => void;
  setSpeed: (key: number, speed: number) => void;
  setPitch: (key: number, pitch: number) => void;
  setPan: (key: number, pan: number) => void;
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
  enableInSilenceMode: (enabled: boolean) => void;
  setActive: (value: boolean) => void;
  setCategory: (value: string, mixWithOthers?: boolean) => void;
  setLooping: (key: number, looping: boolean) => void;
  getDuration: (key: number, callback: (duration: number) => void) => void;
  setSpeakerPhone: (key: number, isSpeaker: boolean) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Sound') as Spec;
