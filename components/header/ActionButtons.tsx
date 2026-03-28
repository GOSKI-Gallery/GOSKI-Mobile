import { useRouter } from "expo-router";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import CreatePostModal from "../post/CreatePostModal";
import { useCreatePostModalStore } from "../../states/useCreatePostModalStore";

export default function ActionButtons() {
  const router = useRouter();
  const { isOpen, open, close } = useCreatePostModalStore();

  return (
    <>
      <View className="flex flex-row justify-between items-center gap-2">
        <TouchableOpacity onPress={open}>
          <Image
            source={require("../../assets/icons/add.png")}
            className="w-8 h-8"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.navigate("/(main)")}>
          <Image
            source={require("../../assets/icons/bell.png")}
            className="w-8 h-8"
          />
        </TouchableOpacity>
      </View>
      <CreatePostModal visible={isOpen} onClose={close} />
    </>
  );
}