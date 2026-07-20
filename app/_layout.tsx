import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import "../global.css";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../states/useAuthStore";
import { useThemeStore } from "../states/useThemeStore";
import SplashScreenComponent from "../components/ui/SplashScreen";
import CustomAlert from "../components/ui/CustomAlert";
import { registerForPushNotificationsAsync, setupNotificationHandler } from "../lib/notifications";

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
    return <SplashScreenComponent />;
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
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session) {
        setAuth(session.user, session.access_token);
      }
      setAuthLoaded(true);
    }).catch(() => {
      if (!mounted) return;
      clearAuth();
      setAuthLoaded(true);
    });

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

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setAuth, clearAuth]);

  useEffect(() => {
    setupNotificationHandler();
  }, []);

  useEffect(() => {
    if (user?.id) {
      registerForPushNotificationsAsync(user.id).catch(() => {});
    }
  }, [user?.id]);

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
    return <SplashScreenComponent loading />;
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <ActionSheetProvider>
        <View className="flex-1">
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                  backgroundColor: isDark ? "#27272a" : "#FAFAFA",
                flex: 1,
              },
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(main)" options={{ headerShown: false }} />
          </Stack>
          <CustomAlert />
        </View>
      </ActionSheetProvider>
    </GestureHandlerRootView>
  );
}
