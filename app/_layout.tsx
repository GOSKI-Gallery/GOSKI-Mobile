import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import React from "react";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import "../global.css";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../states/useAuthStore";

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

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { user, setAuth, clearAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setAuth(session.user, session.access_token);
      } else {
        clearAuth();
      }

      if (event === "TOKEN_REFRESH_FAILED" || event === "SIGNED_OUT") {
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
    return null;
  }

  return (
    <ActionSheetProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#ECECEC", flex: 1 },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
      </Stack>
    </ActionSheetProvider>
  );
}
