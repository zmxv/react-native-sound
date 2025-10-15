import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import Sound from 'react-native-sound';

// Types
type TestStatus = '' | 'pending' | 'playing' | 'win' | 'fail';

interface AudioTest {
  title: string;
  url: string | number;
  basePath?: string;
  isRequire?: boolean;
  onPrepared?: (sound: Sound, component: any) => void;
}

interface TestState {
  [key: string]: TestStatus;
}

// Components
const Button = ({ title, onPress }: { title: string; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const TestItem = ({
  title,
  onPress,
  buttonLabel = 'PLAY',
  status,
}: {
  title: string;
  onPress: () => void;
  buttonLabel?: string;
  status?: TestStatus;
}) => (
  <View style={styles.testItem}>
    <View style={styles.testInfo}>
      <Text style={styles.testTitle}>{title}</Text>
      {status && <Text style={styles.statusIcon}>{getStatusIcon(status)}</Text>}
    </View>
    <Button title={buttonLabel} onPress={onPress} />
  </View>
);

// Helper functions
const getStatusIcon = (status: TestStatus): string => {
  const icons = {
    '': '',
    pending: '⏳',
    playing: '▶️',
    win: '✅',
    fail: '❌',
  };
  return icons[status] || '';
};

// Audio tests configuration
const audioTests: AudioTest[] = [
  {
    title: 'MP3 from bundle',
    url: 'whoosh.mp3',
    basePath: Sound.MAIN_BUNDLE,
  },
  {
    title: 'MP3 from bundle (looped)',
    url: 'whoosh.mp3',
    basePath: Sound.MAIN_BUNDLE,
    onPrepared: (sound: Sound) => {
      sound.setNumberOfLoops(-1);
    },
  },
  {
    title: 'MP3 remote download',
    url: 'https://cdn.pixabay.com/download/audio/2024/10/27/audio_694158870e.mp3?filename=abnormal-for-you-255737.mp3',
  },
  {
    title: 'MP3 remote - non-existent file',
    url: 'https://example.com/nonexistent-file.mp3',
  },
  {
    title: 'WAV remote download',
    url: 'https://www.soundjay.com/misc/sounds-738.wav',
  },
];

export const AudioTester = () => {
  const [tests, setTests] = useState<TestState>({});
  const [loopingSound, setLoopingSound] = useState<Sound | null>(null);
  const soundsRef = useRef<Sound[]>([]);

  useEffect(() => {
    // Set audio category for playback
    Sound.setCategory('Playback', true); // true = mixWithOthers

    // Cleanup on unmount
    return () => {
      soundsRef.current.forEach(sound => {
        try {
          sound.release();
        } catch (error) {
          console.log('Error releasing sound:', error);
        }
      });
      if (loopingSound) {
        try {
          loopingSound.stop();
          loopingSound.release();
        } catch (error) {
          console.log('Error stopping looping sound:', error);
        }
      }
    };
  }, [loopingSound]);

  const setTestState = (title: string, status: TestStatus) => {
    setTests(prev => ({ ...prev, [title]: status }));
  };

  const playSound = (testInfo: AudioTest) => {
    setTestState(testInfo.title, 'pending');

    const callback = (error: any, sound: Sound) => {
      if (error) {
        console.log('Sound loading error:', error);
        Alert.alert(
          'Error',
          `Failed to load sound: ${error.message || 'Unknown error'}`,
        );
        setTestState(testInfo.title, 'fail');
        return;
      }

      setTestState(testInfo.title, 'playing');
      soundsRef.current.push(sound);

      // Run optional pre-play callback
      if (testInfo.onPrepared) {
        testInfo.onPrepared(sound, { setLoopingSound });
      }

      sound.play((success: boolean) => {
        if (success) {
          setTestState(testInfo.title, 'win');
        } else {
          setTestState(testInfo.title, 'fail');
          Alert.alert('Playback Error', 'Failed to play audio file');
        }

        // Don't release looped sounds automatically
        if (testInfo.title !== 'MP3 from bundle (looped)') {
          sound.release();
          soundsRef.current = soundsRef.current.filter(s => s !== sound);
        } else {
          setLoopingSound(sound);
        }
      });
    };

    // Create sound instance
    if (testInfo.isRequire) {
      const sound = new Sound(testInfo.url as number, (error: any) =>
        callback(error, sound),
      );
    } else {
      const sound = new Sound(
        testInfo.url as string,
        testInfo.basePath || '',
        (error: any) => callback(error, sound),
      );
    }
  };

  const stopLoopedSound = () => {
    if (!loopingSound) {
      Alert.alert('Info', 'No looped sound is currently playing');
      return;
    }

    try {
      loopingSound.stop();
      loopingSound.release();
      setLoopingSound(null);
      setTestState('MP3 from bundle (looped)', 'win');
      soundsRef.current = soundsRef.current.filter(s => s !== loopingSound);
    } catch (error) {
      console.log('Error stopping looped sound:', error);
      Alert.alert('Error', 'Failed to stop looped sound');
    }
  };

  const clearAllTests = () => {
    // Stop and release all sounds
    soundsRef.current.forEach(sound => {
      try {
        sound.stop();
        sound.release();
      } catch (error) {
        console.log('Error cleaning up sound:', error);
      }
    });

    if (loopingSound) {
      try {
        loopingSound.stop();
        loopingSound.release();
      } catch (error) {
        console.log('Error stopping looping sound:', error);
      }
    }

    soundsRef.current = [];
    setLoopingSound(null);
    setTests({});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Audio Tests</Text>
        <Text style={styles.subtitle}>
          Test different audio loading scenarios
        </Text>
      </View>

      {/* Control buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.clearButton} onPress={clearAllTests}>
          <Text style={styles.clearButtonText}>Clear All Tests</Text>
        </TouchableOpacity>
      </View>

      {/* Tests list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {audioTests.map(testInfo => (
          <TestItem
            key={testInfo.title}
            title={testInfo.title}
            status={tests[testInfo.title]}
            onPress={() => playSound(testInfo)}
          />
        ))}

        {/* Special stop button for looped sound */}
        <TestItem
          title="Stop looped sound"
          buttonLabel="STOP"
          onPress={stopLoopedSound}
        />

        {/* Info section */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>📝 Test Information</Text>
          <Text style={styles.infoText}>
            • ⏳ Pending: Loading audio file{'\n'}• ▶️ Playing: Audio is
            currently playing{'\n'}• ✅ Success: Playback completed successfully
            {'\n'}• ❌ Failed: Error occurred during loading or playback{'\n\n'}
            This component tests various audio loading scenarios including
            bundle files, remote URLs, and error handling.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  controlsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  clearButton: {
    backgroundColor: '#ff5722',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  testInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  testTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  statusIcon: {
    fontSize: 18,
    marginLeft: 10,
    minWidth: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
