import React from "react";
import { Text, View } from "react-native";
import AuthHeader from "../components/auth/AuthHeader";
import LoginForm from "../components/auth/LoginForm";
import GradientText from "../components/ui/GradientText";
import ScreenWrapper from "../components/ui/ScreenWrapper";

export default function LoginScreen() {
  return (
    <ScreenWrapper>
      <View className="flex flex-col items-center w-full pt-10">
        <AuthHeader toGo="register">Crie sua conta.</AuthHeader>

        <View className="flex flex-col justify-center items-start px-10 pt-40">
          <View className="flex flex-col justify-center items-start pb-8">
            <Text className="font-bold text-4xl text-start dark:text-white">Acompanhe as</Text>

            <View className="flex flex-row justify-center items-baseline">
              <GradientText className="text-4xl font-bold">
                expressões
              </GradientText>
              <Text className="font-bold text-4xl mx-1 dark:text-white"> do </Text>
              <GradientText className="text-4xl font-bold">mundo.</GradientText>
            </View>
          </View>

          <View className="flex flex-col justify-center items-start">
            <Text className="font-bold text-2xl mb-4 dark:text-white">Faça seu login.</Text>
            <LoginForm />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}
