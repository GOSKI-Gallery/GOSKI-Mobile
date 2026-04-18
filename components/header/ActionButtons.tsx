
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import CreatePostModal from "../post/CreatePostModal";
import { useModalStore } from "../../states/useModalStore";
import  NotificationModal  from "../notification/NotificationModal";

export default function ActionButtons() {
  const { isOpen, open, close } = useModalStore();
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  return (
    <>
      <View className="flex flex-row justify-between items-center gap-2">
        <TouchableOpacity onPress={open}>
          <Image
            source={require("../../assets/icons/add.png")}
            className="w-8 h-8"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setNotificationModalVisible(true)}>
          <Image
            source={require("../../assets/icons/bell.png")}
            className="w-8 h-8"
          />
        </TouchableOpacity>
      </View>
      <CreatePostModal visible={isOpen} onClose={close} />
      <NotificationModal
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
      />
    </>
  );
}
