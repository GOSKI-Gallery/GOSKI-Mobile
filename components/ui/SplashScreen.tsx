import React from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { useThemeStore } from "../../states/useThemeStore";

interface SplashScreenProps {
  loading?: boolean;
}

export default function SplashScreen({ loading = false }: SplashScreenProps) {
  const isDark = useThemeStore((s) => s.isDark);

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: isDark ? "#18181b" : "#ECECEC" }}
    >
      <Image
        source={require("../../assets/icon.png")}
        className="w-20 h-20 mb-6"
        resizeMode="contain"
      />

      <Text className="font-krona text-3xl text-zinc-900 dark:text-white mb-8">
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
