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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.playerContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.title}>Loading audio...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.playerContainer}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>🎵</Text>
          </View>
        </View>

        {/* Title and subtitle */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>React Native Sound</Text>
          <Text style={styles.subtitle}>Example Player</Text>
        </View>

        {/* Progress display without slider */}
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{secondsToMMSS(currentTime)}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    duration > 0 ? (currentTime / duration) * 100 : 0
                  }%`,
                },
              ]}
            />
          </View>
          <Text style={styles.timeText}>{secondsToMMSS(duration)}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onPressBackward}
          >
            <Text style={styles.controlIcon}>⏪</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={onPressPlayPause}
          >
            <Text style={[styles.controlIcon, styles.playIcon]}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={onPressFastFoward}
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1976D2',
    borderRadius: 2,
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
