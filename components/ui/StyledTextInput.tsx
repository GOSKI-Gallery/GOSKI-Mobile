import React from "react";
import {
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { useThemeStore } from "../../states/useThemeStore";

interface styledTextInputProps extends TextInputProps {
  icon?: React.ReactNode;
}

const StyledTextInput: React.FC<styledTextInputProps> = ({
  icon,
  className = "",
  ...props
}) => {
  const isDark = useThemeStore((s) => s.isDark);

  const themedIcon =
    icon && React.isValidElement(icon)
      ? React.cloneElement(icon as React.ReactElement<{ color?: string; size?: number }>, {
          color: isDark ? "#ffffff" : "#18181b",
          size: 20,
        })
      : icon;

  return (
    <View className="flex-row items-center bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full px-4 h-14">
      {themedIcon && <View className="mr-3 opacity-30">{themedIcon}</View>}
      <TextInput
        placeholderTextColor="#a1a1aa"
        className={`flex-1 text-black dark:text-white font-bold text-center h-full ${className}`}
        {...props}
      />

      {themedIcon && <View className="w-5 h-5 ml-3 opacity-0" />}
    </View>
  );
};

export default StyledTextInput;
