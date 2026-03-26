import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

export default function ActionButtons() {
    const router = useRouter();
    return (
        <View className='flex flex-row justify-between items-center gap-2'>
            <TouchableOpacity onPress={() => router.navigate('/(main)')}>
                <Image source={require('../../assets/icons/add.png')}
                    className='w-8 h-8'
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.navigate('/(main)')}>
                <Image source={require('../../assets/icons/bell.png')}
                    className='w-8 h-8'
                />
            </TouchableOpacity>
        </View>
    )
}