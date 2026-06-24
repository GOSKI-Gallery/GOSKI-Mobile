import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

interface UploadButtonProps extends TouchableOpacityProps {
  imageUri?: string | null;
  label?: string;
}

const UploadButton: React.FC<UploadButtonProps> = ({
  imageUri,
  label = "Escolher foto",
  className = "",
  ...props
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={`w-full aspect-square bg-zinc-50 dark:bg-zinc-900 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 items-center justify-center overflow-hidden ${className}`}
      {...props}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} className="w-full h-full" />
      ) : (
        <View className="items-center">
          <MaterialCommunityIcons name="image-plus" size={48} color="#a1a1aa" />
          <Text className="text-zinc-400 mt-2 font-medium">{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default UploadButton;
