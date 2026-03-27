import { Href, useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface AuthHeaderProps {
  children?: string;
  toGo: Href;
}

const AuthHeader = ({ children = "", toGo }: AuthHeaderProps) => {
  const router = useRouter();

  return (
    <View className="flex flex-row items-center justify-between w-full pt-5 px-5">
      <View className="flex flex-row justify-between items-center">
        <Image
          source={require("../../assets/icons/icon.png")}
          className="w-12 h-12"
        />
        <Text className="font-bold text-3xl">GOSKI</Text>
      </View>

      <TouchableOpacity onPress={() => router.push(toGo)}>
        <Text className="font-bold text-2xl">{children}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthHeader;
