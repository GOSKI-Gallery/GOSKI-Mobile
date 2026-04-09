import React from "react";
import { View } from "react-native";
import Header from "../components/header";
import Profile from "../components/profile/";

export default function ProfileScreen() {
  return (
    <View className="flex-1">
      <Header />

      <View className="flex-1">
        <Profile />
      </View>
    </View>
  );
}
