import React from "react";
import { View } from "react-native";

export default function ScreenWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={`flex-1 bg-zinc-50 dark:bg-zinc-800 ${className}`}>
      {children}
    </View>
  );
}
