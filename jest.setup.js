import { Animated } from 'react-native';

process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://fake-url.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'fake-key';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

// This is the most important mock to prevent "act" warnings with animations.
// It makes Animated.timing complete instantly.
jest.spyOn(Animated, 'timing').mockImplementation(() => ({
  start: (callback) => {
    if (callback) {
      callback({ finished: true });
    }
  },
}));
