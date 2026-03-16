import { View, Text } from "react-native";
import React from "react";
import GradientText from "./gradientText";
import Login from "./Auth/Login";

export default function Main() {
  return (
    <View className="flex items-start justify-start w-full">
      <Text className="font-bold text-2xl text-center">Acompanhe as</Text>
      <View className="flex-row items-center justify-center">
        <GradientText className="text-2xl font-bold">expressões</GradientText>
        <Text className="font-bold text-2xl mx-2">do</Text>
        <GradientText className="text-2xl font-bold">mundo.</GradientText>
      </View>

      <View className="flex flex-col justify-center items-start">
        <Text className="text-start text-lg mt-2">Faça seu login.</Text>

        <Login />
      </View>
    </View>
  );
}
