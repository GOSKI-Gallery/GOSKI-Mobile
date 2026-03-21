import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import React from "react";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [loaded, error] = useFonts({
    'KronaOne-Regular': require('../assets/fonts/KronaOne-Regular.ttf'),
  });
  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  if (!loaded) {
    return null;
  }
  return <RootLayoutNav />;
}
function RootLayoutNav() {
  return (
      <ActionSheetProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </ActionSheetProvider>
  );
}