import { View, Text } from "react-native";
import React from "react";
import GradientText from "./gradientText";
import Login from "./Auth/loginForm";
import Header from "./Header";

export default function Main() {
  return (
    <View className="flex items-start justify-center w-full px-10">
      <Header />
      <Text className="font-bold text-4xl text-center">Acompanhe as</Text>
      <View className="flex-row items-center justify-center">
        <GradientText className="text-4xl font-bold">expressões</GradientText>
        <Text className="font-bold text-4xl mx-2">do</Text>
        <GradientText className="text-4xl font-bold">mundo.</GradientText>
      </View>

      <View className="flex flex-col justify-center items-start pt-4">
        <Text className="text-start font-bold text-2xl mt-2">Faça seu login.</Text>

        <Login />
      </View>
    </View>
  );
}
