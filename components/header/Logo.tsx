import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useThemeStore } from "../../states/useThemeStore";
import { LogoSvg } from "../ui/Icons";

export default function Logo() {
  const router = useRouter();
  const isDark = useThemeStore((s) => s.isDark);
  return (
    <TouchableOpacity onPress={() => router.navigate("/(main)")}>
      <View className="flex flex-row justify-between items-center min-w-screen">
        <LogoSvg color={isDark ? "#ffffff" : "#18181b"} size={48} />
        <Text className="font-bold text-3xl dark:text-white">GOSKI</Text>
      </View>
    </TouchableOpacity>
  );
}
