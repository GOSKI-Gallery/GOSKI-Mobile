import React from "react";
import { View } from "react-native";
import Header from "../components/header";
import CreatePostModal from "../components/post/CreatePostModal";
import Post from "../components/post/";
import ScreenWrapper from "../components/ui/ScreenWrapper";

export default function FeedScreen() {
  return (
    <ScreenWrapper>
      <Header />

      <View className="flex-1">
        <Post />
      </View>
      <CreatePostModal />
    </ScreenWrapper>
  );
}
