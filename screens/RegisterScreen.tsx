import React from "react";
import { Text, View } from "react-native";
import AuthHeader from "../components/auth/AuthHeader";
import RegisterForm from "../components/auth/RegisterForm";
import GradientText from "../components/ui/GradientText";
import ScreenWrapper from "../components/ui/ScreenWrapper";

export default function RegisterScreen() {
  return (
    <ScreenWrapper>
      <View className="flex flex-col items-center w-full pt-10">
        <AuthHeader toGo="/">Faça seu login.</AuthHeader>

        <View className="flex flex-col justify-center items-start px-10 pt-40">
          <View className="flex flex-col justify-center items-start pb-8">
            <Text className="font-bold text-4xl text-start dark:text-white">
              Crie sua conta e se
            </Text>
            <GradientText className="text-4xl font-bold">expresse.</GradientText>
          </View>

          <View className="flex flex-col justify-center items-start">
            <Text className="text-start font-bold text-2xl mt-2 dark:text-white">
              Crie sua conta.
            </Text>
            <RegisterForm />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}
