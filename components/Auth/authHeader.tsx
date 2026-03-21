import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { Href, useRouter } from 'expo-router'


interface AuthHeaderProps {
  children?: string,
  toGo: Href,
}

const AuthHeader = ({ children = "", toGo }: AuthHeaderProps) => {
  const router = useRouter();

  return (
    <View className="flex flex-row items-center justify-between w-full px-4">

      <View className='flex flex-row justify-between items-center'>
        <Image source={require('../../assets/icons/icon.png')}
          className='w-lg h-lg'
        />
        <Text className='font-bold text-3xl'>GOSKI</Text>
      </View>

      <TouchableOpacity onPress={() => router.push(toGo)}>
        <Text className='font-bold text-2xl'>{children}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthHeader;
