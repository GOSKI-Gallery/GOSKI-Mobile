import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme } from "nativewind";

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

function applyColorScheme(value: "light" | "dark") {
  colorScheme.set(value);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () =>
        set((state) => {
          const newIsDark = !state.isDark;
          applyColorScheme(newIsDark ? "dark" : "light");
          return { isDark: newIsDark };
        }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            applyColorScheme(state.isDark ? "dark" : "light");
          }
        };
      },
    },
  ),
);
