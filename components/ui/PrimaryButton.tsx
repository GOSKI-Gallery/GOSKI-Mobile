import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { useThemeStore } from "../../states/useThemeStore";

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "solid" | "outline";
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  loading = false,
  variant = "solid",
  disabled,
  className = "",
  ...props
}) => {
  const isDark = useThemeStore((s) => s.isDark);
  const isSolid = variant === "solid";

  const buttonClasses = isSolid
    ? "bg-zinc-900 dark:bg-zinc-200 border-zinc-900 dark:border-zinc-200"
    : "bg-transparent border-zinc-900 dark:border-zinc-200";

  const textClasses = isSolid
    ? "text-white dark:text-zinc-900"
    : "text-zinc-900 dark:text-zinc-200";

  const isButtonDisabled = disabled || loading;

  const indicatorColor = isSolid
    ? isDark
      ? "#18181b"
      : "white"
    : isDark
      ? "#f4f4f5"
      : "#18181b";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={`h-14 px-20 rounded-xl flex items-center justify-center mt-2 ${buttonClasses} ${isButtonDisabled ? "opacity-50" : ""} ${className}`}
      disabled={isButtonDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={indicatorColor} />
      ) : (
        <Text className={`font-bold text-lg text-center ${textClasses}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
