import { View, Text } from 'react-native'
import React from 'react'
import Logo from './logo'
import Menu from './menu'


export default function index() {
  return (
    <View className="flex flex-row justify-between items-center w-full pt-5 px-5">
      <Logo />
      <Menu />
    </View>
  );
}