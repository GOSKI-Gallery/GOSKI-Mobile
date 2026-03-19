import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

export default function Logo() {
    const router = useRouter();
    return (
        <TouchableOpacity onPress={() => router.navigate('/Feed')}>
            <View className='flex flex-row justify-between items-center min-w-screen'>
                <Image source={require('../../assets/icons/icon.png')}
                    className='w-20 h-20'
                />
                <Text className='font-bold text-3xl'>GOSKI</Text>
            </View>
        </TouchableOpacity>
    )
}