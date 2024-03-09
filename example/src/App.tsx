import * as React from 'react';
import { useEffect, useState } from 'react';

import { StyleSheet, View } from 'react-native';
import AudioWave from 'react-native-simple-audio-waveform';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [progress, setProgress] = useState(0);
  const progressRef = React.useRef(0);
  const isReady = React.useRef(false);

  useEffect(() => {
    const timeout = setInterval(() => {
      if (isReady.current) {
        progressRef.current = progressRef.current + 0.01;
        setProgress(progressRef.current);
      }
    }, 1000);

    return () => {
      clearInterval(timeout);
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <AudioWave
          url={
            'https://sculptures-api.projectuat.com/wp-content/uploads/2021/11/SxS-PAUL-CAPORN-PLUS-INTRO.mp3'
          }
          prefetchOnly
          progress={progress}
          containerHeight={40}
          inactiveColor={'#fff'}
          activeColor={'#1CA9C2'}
          onChanged={(newProgress) => {
            console.log('progress updated: ', newProgress);
            progressRef.current = newProgress;
            setProgress(newProgress);
          }}
          onSeekComplete={(newProgress) => {
            console.log('onSeekComplete: ', newProgress);
          }}
          onReady={() => {
            console.log('Ready');
            isReady.current = true;
          }}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#00294A',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
