import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'


export default function AuthHeader() {
  return (
      <View className="flex flex-row items-center justify-between w-full px-4">
        <TouchableOpacity onPress={()+}>
          <View className='flex flex-row justify-between items-center min-w-screen'>
            <Image source={require('../assets/icons/icon.png')}
              className='w-lg h-lg'
            />
            <Text className='font-bold text-3xl'>GOSKI</Text>
          </View>
        </TouchableOpacity>

        <Text className='font-bold text-2xl'>Crie sua conta.</Text>
      </View>
  )
}