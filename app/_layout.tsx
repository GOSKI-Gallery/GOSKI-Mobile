import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import React from "react";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import "../global.css";
import { SafeAreaView } from "react-native";


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        'KronaOne-Regular': require('../assets/fonts/KronaOne-Regular.ttf'),
    });

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
          <SafeAreaView style={{ flex: 1, backgroundColor: '#ECECEC' }}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </SafeAreaView>
        </ActionSheetProvider>
      );
}
