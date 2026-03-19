import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import GradientText from "./gradientText";
import LoginForm from "./Auth/loginForm";

export default function Main() {
  return (
    <View className="flex flex-col items-center justify-between w-full">
      <View className="flex flex-col justify-center items-start px-10">
        <Text className="font-bold text-4xl text-start">Acompanhe as</Text>

        <View className="flex-row items-center justify-center">
          <GradientText className="text-4xl font-bold">expressões</GradientText>
          <Text className="font-bold text-4xl mx-2">do</Text>
          <GradientText className="text-4xl font-bold">mundo.</GradientText>
        </View>

        <View className="flex flex-col justify-center items-start pt-4">
          <Text className="text-start font-bold text-2xl mt-2">Faça seu login.</Text>

          <LoginForm />
        </View>

      </View>

    </View>
  );
}
