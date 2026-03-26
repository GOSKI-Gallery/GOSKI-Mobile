import { View, Text } from 'react-native'
import React from 'react'
import Logo from './logo'
import Menu from './menu'
import ActionButtons from './actionButtons';
import { BlurView } from 'expo-blur';


export default function index() {
  return (
    <View className="absolute top-0 left-0 right-0 z-50 border-b border-[#ECECEC]">
      <BlurView 
        intensity={50}
        tint="light"
        className="flex-row justify-between items-center w-full py-6 px-5 pt-12" 
      >
        <Logo />
        <View className="flex-row items-center gap-2">
          <ActionButtons />
          <Menu />
        </View>
      </BlurView>
    </View>
  );
}
