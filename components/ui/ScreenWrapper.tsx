import React from "react";
import { View } from "react-native";
import { useThemeStore } from "../../states/useThemeStore";

export default function ScreenWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <View
      className={`flex-1 ${className}`}
      style={{ backgroundColor: isDark ? "#27272a" : "#FAFAFA" }}
    >
      {children}
    </View>
  );
}
