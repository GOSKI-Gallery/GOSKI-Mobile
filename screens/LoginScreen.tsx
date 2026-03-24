import { View, Text } from "react-native";
import React from "react";
import GradientText from "../components/StyleComponents/gradientText";
import LoginForm from "../components/Auth/loginForm";
import AuthHeader from "../components/Auth/authHeader";

export default function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-start w-full">
      <AuthHeader toGo="register">Crie sua conta.</AuthHeader>

      <View className="flex-1 w-full justify-center items-center px-10">
        
        <View className="pb-8">
          <Text className="font-bold text-4xl text-start">Acompanhe as</Text>
          
          <View className="flex-row items-baseline">
            <GradientText className="text-4xl font-bold">expressões</GradientText>
            <Text className="font-bold text-4xl mx-1"> do </Text>
            <GradientText className="text-4xl font-bold">mundo.</GradientText>
          </View>
        </View>


        <View className="w-full py-8">
          <Text className="font-bold text-2xl mb-4">Faça seu login.</Text>
          <LoginForm />
        </View>

      </View>
    </View>
  );
}
