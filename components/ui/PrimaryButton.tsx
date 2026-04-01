import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

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
  const isSolid = variant === "solid";

  const buttonClasses = isSolid
    ? "bg-[#000000] border-[#000000]"
    : "bg-transparent border-[#000000]";
  
  const textClasses = isSolid ? "text-white" : "text-[#000000]";

  const isButtonDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={`h-14 px-20 rounded-xl flex items-center justify-center mt-2 ${buttonClasses} ${isButtonDisabled ? "opacity-50" : ""} ${className}`}
      disabled={isButtonDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isSolid ? "white" : "#000000"} />
      ) : (
        <Text className={`font-bold text-lg text-center ${textClasses}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
