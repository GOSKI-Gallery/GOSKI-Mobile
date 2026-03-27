import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Logo() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.navigate("/(main)")}>
      <View className="flex flex-row justify-between items-center min-w-screen">
        <Image
          source={require("../../assets/icons/icon.png")}
          className="w-12 h-12"
        />
        <Text className="font-bold text-3xl">GOSKI</Text>
      </View>
    </TouchableOpacity>
  );
}
