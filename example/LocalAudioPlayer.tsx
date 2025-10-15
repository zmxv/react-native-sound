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
  Platform,
} from 'react-native';

import Sound from 'react-native-sound';

Sound.setCategory('Playback');

const secondsToMMSS = (seconds: number) =>
  new Date(seconds * 1000).toISOString().substring(14, 19);

export const LocalAudioPlayer = () => {
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const sound = React.useRef<Sound | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Load local audio file from bundle
    // On Android, file should be placed in android/app/src/main/res/raw/
    // On iOS, file should be added to the Xcode project bundle
    sound.current = new Sound(
      'whoosh.mp3', // File name (should exist in bundle)
      Sound.MAIN_BUNDLE,
      (error, props) => {
        setIsLoading(false);
        if (error) {
          Alert.alert(
            'Error',
            'Failed to load local sound file. Make sure whoosh.mp3 is in your bundle.\n\n' +
              'Android: place in android/app/src/main/res/raw/\n' +
              'iOS: add to Xcode project bundle\n\n' +
              'Error: ' +
              error.message,
          );
          return;
        }
        if (props && props.duration) {
          setDuration(props.duration);
        }
      },
    );

    // Cleanup
    return () => {
      if (sound.current) {
        sound.current.release();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
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
        sound.current.play(success => {
          if (success) {
            console.log('Successfully finished playing');
            setIsPlaying(false);
            stopListening();
            setCurrentTime(0);
          } else {
            console.log('Playback failed due to audio decoding errors');
            Alert.alert('Playback Error', 'Failed to play audio file');
            setIsPlaying(false);
            stopListening();
          }
        });
        setIsPlaying(true);
        startListening();
      }
    }
  };

  const onPressStop = () => {
    if (sound.current) {
      sound.current.stop();
      setIsPlaying(false);
      stopListening();
      setCurrentTime(0);
    }
  };

  const onPressRewind = () => {
    if (sound.current) {
      sound.current.setCurrentTime(0);
      setCurrentTime(0);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.playerContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.title}>Loading local audio...</Text>
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
            <Text style={styles.logoText}>🎶</Text>
          </View>
        </View>

        {/* Title and subtitle */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Local Audio Player</Text>
          <Text style={styles.subtitle}>Playing from bundle</Text>
          <Text style={styles.fileInfo}>whoosh.mp3</Text>
        </View>

        {/* Progress display */}
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

        {/* Info text */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {Platform.OS === 'android'
              ? 'Place audio files in:\nandroid/app/src/main/res/raw/'
              : 'Add audio files to:\nXcode project bundle'}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onPressRewind}
          >
            <Text style={styles.controlIcon}>⏮️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={onPressPlayPause}
          >
            <Text style={[styles.controlIcon, styles.playIcon]}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={onPressStop}>
            <Text style={styles.controlIcon}>⏹️</Text>
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
    marginBottom: 30,
  },
  logoPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 60,
    color: '#fff',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
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
    marginBottom: 4,
  },
  fileInfo: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
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
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    minWidth: 50,
    textAlign: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
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
    backgroundColor: '#4CAF50',
    width: 70,
    height: 70,
    borderRadius: 35,
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
    fontSize: 28,
    color: '#4CAF50',
  },
  playIcon: {
    fontSize: 28,
  },
});
