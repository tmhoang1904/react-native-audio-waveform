import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AudioWave } from './AudioWave';
import type { IProps } from './interfaces';

const App = (props: IProps) => {
  return (
    <GestureHandlerRootView>
      <AudioWave {...props} />
    </GestureHandlerRootView>
  );
};

export default App;
