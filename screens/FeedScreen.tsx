import React from "react";
import { View } from "react-native";
import Header from "../components/header";
import CreatePostModal from "../components/post/CreatePostModal";
import Post from "../components/post/";

export default function FeedScreen() {
  return (
    <View className="flex-1">
      <Header />

      <View className="flex-1">
        <Post />
      </View>
      <CreatePostModal />
    </View>
  );
}
