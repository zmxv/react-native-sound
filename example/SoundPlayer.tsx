import * as React from 'react';

import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  type ImageStyle,
  StatusBar,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import Slider from '@react-native-community/slider';
import Sound from 'react-native-sound';

const getImageStyle = (size: number, tinColor: string = '#000') => {
  return {
    width: size,
    height: size,
    tinColor,
  } as ImageStyle;
};
Sound.setCategory('Playback');
const secondsToMMSS = (seconds: number) =>
  new Date(seconds * 1000).toISOString().substring(14, 19);

export default () => {
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const sound = React.useRef<Sound>();
  const timerRef = React.useRef<NodeJS.Timeout>();
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
      <StatusBar backgroundColor={'white'} barStyle={'dark-content'} />
      <Text style={styles.now_playing_text}> Now Playing </Text>

      <View>
        <Image
          source={require('./assets/logo.jpg')}
          style={[styles.image_view, getImageStyle(250)]}
        />
        {isLoading && (
          <ActivityIndicator
            style={StyleSheet.absoluteFill}
            size={'large'}
            color={'#e75480'}
          />
        )}
      </View>
      <View style={styles.name_of_song_View}>
        <Text style={styles.name_of_song_Text1}>#02 - Practice</Text>
        <Text style={styles.name_of_song_Text2}>
          Digital Marketing - By Setup Cast
        </Text>
      </View>

      <View style={styles.slider_view}>
        <Text style={styles.slider_time}> {secondsToMMSS(currentTime)} </Text>
        <Slider
          style={styles.slider_style}
          minimumValue={0}
          onSlidingComplete={value => {
            sound.current?.setCurrentTime(value);
          }}
          maximumValue={duration}
          minimumTrackTintColor="#e75480"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#e75480"
          value={currentTime}
        />
        <Text style={styles.slider_time}>{secondsToMMSS(duration)}</Text>
      </View>

      <View style={styles.functions_view}>
        <TouchableOpacity onPress={onPressBackward}>
          <Image
            source={require('./assets/left_foward.png')}
            style={getImageStyle(24, '#e75480')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressPlayPause}>
          <Image
            source={
              isPlaying
                ? require('./assets/pause.png')
                : require('./assets/play.png')
            }
            style={getImageStyle(50, '#e75480')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressFastFoward}>
          <Image
            source={require('./assets/right_foward.png')}
            style={getImageStyle(24, '#e75480')}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-evenly',
  },

  now_playing_text: {
    fontSize: 19,
    alignSelf: 'center',
    marginVertical: 15,
  },

  image_view: {
    alignSelf: 'center',
    borderRadius: 10,
  },
  name_of_song_View: {
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    rowGap: 20,
  },
  name_of_song_Text1: {
    fontSize: 19,
    fontWeight: '500',
  },
  name_of_song_Text2: {
    color: '#808080',
  },
  slider_view: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginVertical: 20,
  },
  slider_style: {
    flex: 1,
  },
  slider_time: {
    fontSize: 15,
    color: '#808080',
  },
  functions_view: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
});
