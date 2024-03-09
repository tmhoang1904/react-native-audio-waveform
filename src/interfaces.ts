import type { StyleProp, ViewStyle } from 'react-native';

export interface IProps {
  style?: StyleProp<ViewStyle>;
  url?: string;
  source?: number;
  progress: number;
  containerHeight: number;
  inactiveColor?: string;
  activeColor?: string;
  onChanged?: (progress: number) => void;
  onSeekComplete?: (progress: number) => void;
  onLoading?: () => void;
  onReady?: () => void;
  onError?: (error?: any) => void;
}
