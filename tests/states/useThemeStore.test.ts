jest.mock('react-native-css-interop', () => ({
  colorScheme: { set: jest.fn() },
}));

jest.mock('react-native-css-interop/dist/runtime/native/appearance-observables', () => ({
  systemColorScheme: { set: jest.fn() },
}));

import { useThemeStore } from '../../states/useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ isDark: false });
  });

  it('starts with light theme', () => {
    expect(useThemeStore.getState().isDark).toBe(false);
  });

  it('toggles theme', () => {
    const { toggleTheme } = useThemeStore.getState();
    toggleTheme();
    expect(useThemeStore.getState().isDark).toBe(true);
  });

  it('toggles back to light', () => {
    useThemeStore.setState({ isDark: true });
    const { toggleTheme } = useThemeStore.getState();
    toggleTheme();
    expect(useThemeStore.getState().isDark).toBe(false);
  });
});
