import * as React from 'react';

import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import Slider from '@react-native-community/slider';
import Sound from 'react-native-sound';

// Removed getImageStyle as we're using emoji icons instead
Sound.setCategory('Playback');
const secondsToMMSS = (seconds: number) =>
  new Date(seconds * 1000).toISOString().substring(14, 19);

export default () => {
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const sound = React.useRef<Sound | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    sound.current = new Sound(
      'https://cdn.pixabay.com/download/audio/2024/10/27/audio_694158870e.mp3?filename=abnormal-for-you-255737.mp3',
      Sound.MAIN_BUNDLE,
      (error, props) => {
        setIsLoading(false);
        if (error) {
          Alert.alert('Error', 'failed to load the sound' + error);
          return;
        }
        if (props.duration) {
          setDuration(props.duration);
        }
      },
    );
  }, []);

  const stopListening = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startListening = () => {
    stopListening();
    timerRef.current = setInterval(() => {
      if (sound.current) {
        sound.current.getCurrentTime(setCurrentTime);
      }
    }, 1000);
  };

  const onPressPlayPause = () => {
    if (sound.current) {
      if (isPlaying) {
        sound.current.pause();
        setIsPlaying(false);
        stopListening();
      } else {
        sound.current.play();
        setIsPlaying(true);
        startListening();
      }
    }
  };

  const onPressBackward = () => {
    if (sound.current) {
      sound.current.getCurrentTime(sec => {
        sound.current?.setCurrentTime(sec - 10);
      });
    }
  };

  const onPressFastFoward = () => {
    if (sound.current) {
      sound.current.getCurrentTime(sec => {
        sound.current?.setCurrentTime(sec + 10);
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.playerContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>🎵</Text>
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>React Native Sound Player</Text>
          <Text style={styles.subtitle}>Abnormal For You - Demo Track</Text>
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.timeText}>{secondsToMMSS(currentTime)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={currentTime}
            onSlidingComplete={value => {
              if (sound.current) {
                sound.current.setCurrentTime(value);
              }
            }}
            minimumTrackTintColor="#1976D2"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#1976D2"
          />
          <Text style={styles.timeText}>{secondsToMMSS(duration)}</Text>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            onPress={onPressBackward}
            style={styles.controlButton}
          >
            <Text style={styles.controlIcon}>⏪</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onPressPlayPause}
            style={styles.playButton}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Text style={styles.playIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onPressFastFoward}
            style={styles.controlButton}
          >
            <Text style={styles.controlIcon}>⏩</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 80,
    color: '#fff',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    minWidth: 50,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '60%',
  },
  controlButton: {
    padding: 15,
  },
  playButton: {
    backgroundColor: '#1976D2',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  controlIcon: {
    fontSize: 30,
    color: '#1976D2',
  },
  playIcon: {
    fontSize: 30,
  },
});
