import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import "../global.css";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../states/useAuthStore";
import { useThemeStore } from "../states/useThemeStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "KronaOne-Regular": require("../assets/fonts/KronaOne-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const isDark = useThemeStore((state) => state.isDark);

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? "#18181b" : "#ECECEC" }} />
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { user, setAuth, clearAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [authLoaded, setAuthLoaded] = useState(false);
  const isDark = useThemeStore((state) => state.isDark);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setAuth(session.user, session.access_token);
      } else {
        clearAuth();
      }

      if (event === "SIGNED_OUT") {
        clearAuth();
      }

      setAuthLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, [setAuth, clearAuth]);

  useEffect(() => {
    if (!authLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)");
    } else if (user && inAuthGroup) {
      router.replace("/(main)");
    }
  }, [user, segments, authLoaded, router]);

  if (!authLoaded) {
    return (
      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "#18181b" : "#ECECEC" }}
      >
        <ActivityIndicator size="large" color={isDark ? "#a1a1aa" : "#18181b"} />
      </View>
    );
  }

  return (
    <ActionSheetProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDark ? "#18181b" : "#ECECEC",
            flex: 1,
          },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
      </Stack>
    </ActionSheetProvider>
  );
}
