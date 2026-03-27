import React from "react";
import { Text, View } from "react-native";
import AuthHeader from "../components/auth/AuthHeader";
import RegisterForm from "../components/auth/RegisterForm";
import GradientText from "../components/ui/GradientText";

export default function RegisterScreen() {
  return (
    <View className="flex flex-col items-center h-full w-full pt-10">
      <AuthHeader toGo="/">Faça seu login.</AuthHeader>

      <View className="flex flex-col justify-center items-start px-10 pt-40">
        <View className="flex flex-col justify-center items-start pb-8">
          <Text className="font-bold text-4xl text-start">
            Crie sua conta e se
          </Text>
          <GradientText className="text-4xl font-bold">expresse.</GradientText>
        </View>

        <View className="flex flex-col justify-center items-start">
          <Text className="text-start font-bold text-2xl mt-2">
            Crie sua conta.
          </Text>
          <RegisterForm />
        </View>
      </View>
    </View>
  );
}
