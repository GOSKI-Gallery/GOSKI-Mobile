
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import CreatePostModal from "../post/CreatePostModal";
import { useModalStore } from "../../states/useModalStore";
import  NotificationModal  from "../notification/NotificationModal";

export default function ActionButtons() {
  const { setNotificationModalVisible } = useModalStore();
  const { isOpen, open, close } = useModalStore();

  return (
    <>
      <View className="flex flex-row justify-between items-center gap-2">
        <TouchableOpacity testID="add-post-button" onPress={open}>
          <Image
            testID="add-post-icon"
            source={require("../../assets/icons/add.png")}
            className="w-8 h-8"
          />
        </TouchableOpacity>

        <TouchableOpacity 
          testID="notification-bell-button"
          onPress={() => setNotificationModalVisible(true)}>
          <Image
            testID="notification-bell-icon"
            source={require("../../assets/icons/bell.png")}
            className="w-8 h-8"
          />
        </TouchableOpacity>
      </View>
      <CreatePostModal visible={isOpen} onClose={close} />
    </>
  );
}
