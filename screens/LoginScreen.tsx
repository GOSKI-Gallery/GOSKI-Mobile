import React from "react";
import { Text, View } from "react-native";
import AuthHeader from "../components/Auth/authHeader";
import LoginForm from "../components/Auth/loginForm";
import GradientText from "../components/ui/gradientText";

export default function LoginScreen() {
  return (
    <View className="flex flex-col items-center h-full w-full pt-10">
      <AuthHeader toGo="register">Crie sua conta.</AuthHeader>

      <View className="flex flex-col justify-center items-start px-10 pt-40">
        
        <View className="flex flex-col justify-center items-start pb-8">
          <Text className="font-bold text-4xl text-start">Acompanhe as</Text>
          
          <View className="flex flex-row justify-center items-baseline">
            <GradientText className="text-4xl font-bold">expressões</GradientText>
            <Text className="font-bold text-4xl mx-1"> do </Text>
            <GradientText className="text-4xl font-bold">mundo.</GradientText>
          </View>
        </View>


        <View className="flex flex-col justify-center items-start">
          <Text className="font-bold text-2xl mb-4">Faça seu login.</Text>
          <LoginForm />
        </View>

      </View>
    </View>
  );
}
