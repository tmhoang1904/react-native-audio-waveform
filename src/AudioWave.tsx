import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { analyzeAudio, sample, scale } from 'react-native-audio-analyzer';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { AudioWaveItemView } from './components/AudioWaveItemView';
import { ITEM_WIDTH, SPACING } from './constants';
import type { IProps } from './interfaces';

export const AudioWave = React.memo((props: IProps) => {
  const {
    style,
    progress,
    url,
    prefetchOnly,
    containerHeight,
    activeColor,
    inactiveColor,
    onChanged,
    onSeekComplete,
    onLoading,
    onReady,
    onError,
  } = props;

  const [result, setResult] = useState<any[]>([]);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const position = useSharedValue(0);
  const progressChangedByActions = useRef<number>(0);
  const urlChanged = useRef(false);

  useEffect(() => {
    urlChanged.current = true;
  }, [url]);

  const start = useCallback(async () => {
    if (!url || !urlChanged.current) {
      return;
    }
    try {
      onLoading?.();
      const response = await ReactNativeBlobUtil.config({
        fileCache: true,
      }).fetch('GET', url, {});
      urlChanged.current = false;
      const path = response.path();
      const data = await analyzeAudio(path);
      setResult(data);
      onReady?.();
    } catch (error) {
      console.log(error);
      onError?.(error);
    }
  }, [url, onLoading, onError, onReady]);

  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    if (progressChangedByActions.current !== progress) {
      position.value = progress * containerWidth;
    }
  }, [progress, containerWidth, position]);

  const numberOfSample = useMemo(() => {
    const itemWidth = ITEM_WIDTH;
    const spacing = SPACING;
    const totalViewWidth = (itemWidth + spacing) * result.length - spacing * 2;
    if (totalViewWidth > containerWidth) {
      return Math.floor((result.length * containerWidth) / totalViewWidth);
    }

    return result.length;
  }, [containerWidth, result]);

  const _onChanged = useCallback(
    (progress: number) => {
      let _progress = progress;
      if (_progress < 0) {
        _progress = 0;
      } else if (_progress > 1) {
        _progress = 1;
      }
      onChanged?.(_progress);
    },
    [onChanged]
  );

  const _onSeekComplete = useCallback(
    (progress: number) => {
      let _progress = progress;
      if (_progress < 0) {
        _progress = 0;
      } else if (_progress > 1) {
        _progress = 1;
      }
      onSeekComplete?.(_progress);
    },
    [onSeekComplete]
  );

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // console.log('pan: ', e.x);
      position.value = e.x;
      if (containerWidth > 0) {
        const _progress = e.x / containerWidth;
        progressChangedByActions.current = _progress;
        runOnJS(_onChanged)(_progress);
      }
    })
    .onEnd((e) => {
      if (containerWidth > 0) {
        const _progress = e.x / containerWidth;
        progressChangedByActions.current = _progress;
        runOnJS(_onSeekComplete)(_progress);
      }
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    // console.log('touch: ', e.x);
    position.value = e.x;
    if (containerWidth > 0) {
      const _progress = e.x / containerWidth;
      progressChangedByActions.current = _progress;
      runOnJS(_onSeekComplete)(_progress);
    }
  });

  const composed = Gesture.Race(panGesture, tapGesture);

  if (prefetchOnly) {
    return null;
  }

  return (
    <View style={[styles.container, style, { height: containerHeight }]}>
      <GestureDetector gesture={composed}>
        <View
          style={styles.row}
          onLayout={(event) => {
            console.log(
              'event.nativeEvent.layout: ',
              event.nativeEvent.layout.width
            );
            setContainerWidth(event.nativeEvent.layout.width);
          }}
        >
          {result.length > 0 &&
            scale(
              sample(
                result.map((_) => _.amplitude),
                numberOfSample
              )
            ).map((value, index) => (
              <AudioWaveItemView
                key={index}
                position={position}
                audioValue={value}
                maxHeight={containerHeight}
                activeColor={activeColor}
                inactiveColor={inactiveColor}
              />
            ))}
        </View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scroll: {
    maxHeight: 200,
  },
  item: {
    width: ITEM_WIDTH,
    backgroundColor: 'grey',
    marginRight: SPACING,
    borderRadius: ITEM_WIDTH / 2,
  },
});
