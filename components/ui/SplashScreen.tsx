import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useThemeStore } from "../../states/useThemeStore";
import { LogoSvg } from "./Icons";

interface SplashScreenProps {
  loading?: boolean;
}

export default function SplashScreen({ loading = false }: SplashScreenProps) {
  const isDark = useThemeStore((s) => s.isDark);

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: isDark ? "#27272a" : "#FAFAFA" }}
    >
      <LogoSvg color={isDark ? "#ffffff" : "#18181b"} size={48} />

      <Text className="text-3xl text-zinc-900 dark:text-white mb-8">
        GOSKI
      </Text>

      {loading && (
        <ActivityIndicator
          size="large"
          color={isDark ? "#a1a1aa" : "#18181b"}
        />
      )}
    </View>
  );
}
