import { View, Text } from "react-native";
import React from "react";
import GradientText from "../components/StyleComponents/gradientText";
import LoginForm from "../components/Auth/loginForm";
import AuthHeader from "../components/Auth/authHeader";

export default function LoginScreen() {
  return (
    <View className="flex-1 flex-col items-center justify-start w-full">

      <AuthHeader toGo="register">Crie sua conta.</AuthHeader>

      <View className="my-auto w-full">
        <View className="flex flex-col justify-center items-start px-10">
          <Text className="font-bold text-4xl text-start">Acompanhe as</Text>
          <View className="flex-row items-center justify-center">
            <GradientText className="text-4xl font-bold">expressões</GradientText>
            <Text className="font-bold text-4xl mx-2">do</Text>
            <GradientText className="text-4xl font-bold">mundo.</GradientText>
          </View>
        </View>

        <View className="flex flex-col justify-center items-start pt-3 w-full px-10 mt-10">
          <Text className="text-start font-bold text-2xl mt-2">Faça seu login.</Text>
          <LoginForm />
        </View>
      </View>

    </View>
  );
}
