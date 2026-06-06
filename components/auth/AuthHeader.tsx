import { Href, useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useThemeStore } from "../../states/useThemeStore";
import { LogoSvg } from "../ui/Icons";

interface AuthHeaderProps {
  children?: string;
  toGo: Href;
}

const AuthHeader = ({ children = "", toGo }: AuthHeaderProps) => {
  const router = useRouter();
  const isDark = useThemeStore((s) => s.isDark);

  return (
    <View className="flex flex-row items-center justify-between w-full pt-5 px-5">
      <View className="flex flex-row justify-between items-center">
        <LogoSvg color={isDark ? "#ffffff" : "#18181b"} size={48} />
        <Text className="font-bold text-3xl dark:text-white">GOSKI</Text>
      </View>

      <TouchableOpacity onPress={() => router.push(toGo)}>
        <Text className="font-bold text-2xl dark:text-white">{children}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthHeader;
