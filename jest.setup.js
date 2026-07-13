import { Animated } from 'react-native';

process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://fake-url.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'fake-key';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
}));

jest.spyOn(Animated, 'timing').mockImplementation(() => ({
  start: (callback) => {
    if (callback) {
      callback({ finished: true });
    }
  },
}));

jest.mock('expo-device', () => ({
  isDevice: false,
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'ExponentPushToken[test-token]' }),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationHandler: jest.fn(),
  AndroidImportance: { MAX: 5 },
}));


