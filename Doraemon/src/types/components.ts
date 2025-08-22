import { ViewStyle } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Message } from './index';

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

// Component prop interfaces
export interface HomeScreenProps {
  navigation: NavigationProp<RootStackParamList, 'Home'>;
}

export interface SettingsScreenProps {
  navigation: NavigationProp<RootStackParamList, 'Settings'>;
}

export type MicButtonState = 'idle' | 'listening' | 'processing';

export interface MicButtonProps {
  state: MicButtonState;
  onPress: () => void;
  disabled?: boolean;
}

export interface WaveformVisualizerProps {
  audioLevels: number[];
  isActive: boolean;
  style?: ViewStyle;
}

export interface TranscriptViewProps {
  transcript: string;
  isPartial: boolean;
  isVisible: boolean;
}

export interface ChatHistoryProps {
  messages: Message[];
  onMessagePress?: (message: Message) => void;
}

export interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: string[];
}