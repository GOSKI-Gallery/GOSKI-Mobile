import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { useModalStore } from "../../states/useModalStore";

export default function ActionButtons() {
  const { openCreatePostModal, setNotificationModalVisible } = useModalStore();

  return (
    <View className="flex flex-row justify-between items-center gap-2">
      <TouchableOpacity testID="add-post-button" onPress={openCreatePostModal}>
        <Image
          testID="add-post-icon"
          source={require("../../assets/icons/add.png")}
          className="w-8 h-8"
        />
      </TouchableOpacity>

      <TouchableOpacity
        testID="notification-bell-button"
        onPress={() => setNotificationModalVisible(true)}
      >
        <Image
          testID="notification-bell-icon"
          source={require("../../assets/icons/bell.png")}
          className="w-8 h-8"
        />
      </TouchableOpacity>
    </View>
  );
}
