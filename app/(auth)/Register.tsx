import { View, Text } from 'react-native'
import React from 'react'
import AuthHeader from '../../components/Auth/authHeader';
import GradientText from '../../components/styleComponents/gradientText';
import RegisterForm from '../../components/Auth/registerForm';

export default function Register() {
    return (
        <View className="flex-1 flex-col items-center justify-start w-full">

            <AuthHeader children="Faça seu login." toGo="/" />

            <View className="my-auto w-full">
                <View className="flex flex-col justify-center items-start px-10">
                    <Text className="font-bold text-4xl text-start">Crie sua conta e se</Text>
                    <View className="flex-row items-center justify-center">
                        <GradientText className="text-4xl font-bold">expresse.</GradientText>
                    </View>
                </View>

                <View className="flex flex-col justify-center items-start pt-3 w-full px-10 mt-10">
                    <Text className="text-start font-bold text-2xl mt-2">Crie sua conta.</Text>
                    <RegisterForm />
                </View>
            </View>

        </View>
    );
}