import React from 'react';
import {
  StyleSheet,
  Button,
  View,
  Slider,
  Text,
} from 'react-native';
import Sound from 'react-native-sound';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    width: 200,
  },
});

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      speed: 1.0,
    };
    this.onSlidingComplete = this.onSlidingComplete.bind(this);
    this.prepare = this.prepare.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.stop = this.stop.bind(this);
    this.release = this.release.bind(this);
    this.setSpeakerphoneOn = this.setSpeakerphoneOn.bind(this);

    this.enableEarpieceMode = () => this.setSpeakerphoneOn(false);
    this.enableSpeakerMode = () => this.setSpeakerphoneOn(true);
  }

  componentWillUpdate(nextProps, nextState) {
    const { speed } = this.state;
    const { speed: nextSpeed } = nextState;

    if (speed !== nextSpeed) {
      this.player.setSpeed(nextSpeed);
    }
  }

  onSlidingComplete(value) {
    this.setState({ speed: value });
  }

  setSpeakerphoneOn(value) {
    this.player.setSpeakerphoneOn(value);
  }

  play() {
    this.player.play();
  }

  pause() {
    this.player.pause();
  }

  stop() {
    this.player.stop();
  }

  release() {
    this.player.release();
  }

  prepare() {
    const playerOptions = { audioStreamType: 'VOICE_CALL' };
    this.player = new Sound(
      'example.mp3',
      Sound.MAIN_BUNDLE,
      (error) => {
        if (error) {
          console.log('failed to load the sound', error); // eslint-disable-line no-console
        } else {
          Sound.setCategory('PlayAndRecord', false, true); // 3rd parameter is allowing bluetooth device
        }
      },
      playerOptions,
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Button title="Prepare" onPress={this.prepare} />
        <Button title="Play" onPress={this.play} />
        <Button title="Pause" onPress={this.pause} />
        <Button title="Stop" onPress={this.stop} />
        <Button title="Release" onPress={this.release} />
        <Button title="Earpiece mode" onPress={this.enableEarpieceMode} />
        <Button title="Speaker mode" onPress={this.enableSpeakerMode} />
        <Text>{`Speed: ${this.state.speed}`}</Text>
        <Slider
          style={styles.slider}
          value={this.state.speed}
          minimumValue={0.0}
          maximumValue={2.0}
          onSlidingComplete={this.onSlidingComplete}
        />
      </View>
    );
  }
}

export default App;
