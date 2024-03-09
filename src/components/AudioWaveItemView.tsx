import React, { useState } from 'react';
import { type LayoutRectangle, StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { ITEM_WIDTH, SPACING } from '../constants';

interface IProps {
  position: SharedValue<number>;
  audioValue: number;
  maxHeight: number;
  inactiveColor?: string;
  activeColor?: string;
}

export const AudioWaveItemView = React.memo((props: IProps) => {
  const { audioValue, position, maxHeight, inactiveColor, activeColor } = props;
  const [layout, setLayout] = useState<LayoutRectangle>();
  const stylez = useAnimatedStyle(() => {
    const startX = layout?.x ?? 0;
    const endX = startX + (layout?.width ?? 0);
    return {
      width: interpolate(
        position.value,
        [0, startX, endX],
        [0, 0, ITEM_WIDTH],
        'clamp'
      ),
    };
  });

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        console.log('event: ', event.nativeEvent.layout.x);
        setLayout(event.nativeEvent.layout);
      }}
    >
      <View
        style={[
          styles.item,
          {
            height: audioValue * maxHeight,
            backgroundColor: inactiveColor ?? 'grey',
          },
        ]}
      />
      <Animated.View
        style={[
          styles.activeItem,
          stylez,
          {
            height: audioValue * maxHeight,
            backgroundColor: activeColor ?? 'blue',
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    marginRight: SPACING,
  },
  item: {
    width: ITEM_WIDTH,
    backgroundColor: 'grey',
    borderRadius: ITEM_WIDTH / 2,
  },
  activeItem: {
    ...StyleSheet.absoluteFillObject,
    width: 0,
    backgroundColor: 'blue',
    borderRadius: ITEM_WIDTH / 2,
  },
});
