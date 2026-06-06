import React from "react";
import { View } from "react-native";
import Header from "../components/header";
import Profile from "../components/profile/";
import ScreenWrapper from "../components/ui/ScreenWrapper";

export default function ProfileScreen() {
  return (
    <ScreenWrapper>
      <Header />

      <View className="flex-1">
        <Profile userId={""} isOwnProfile={false} />
      </View>
    </ScreenWrapper>
  );
}
