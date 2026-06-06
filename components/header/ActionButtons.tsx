import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useThemeStore } from "../../states/useThemeStore";
import { useModalStore } from "../../states/useModalStore";
import NotificationModal from "../notification/NotificationModal";
import { AddIcon, BellIcon } from "../ui/Icons";

export default function ActionButtons() {
  const { openCreatePostModal, setNotificationModalVisible } = useModalStore();
  const isDark = useThemeStore((s) => s.isDark);
  const iconColor = isDark ? "#ffffff" : "#18181b";

  return (
    <>
      <View className="flex flex-row justify-between items-center gap-2">
        <TouchableOpacity testID="add-post-button" onPress={openCreatePostModal}>
          <View testID="add-post-icon">
            <AddIcon color={iconColor} size={32} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          testID="notification-bell-button"
          onPress={() => setNotificationModalVisible(true)}
        >
          <View testID="notification-bell-icon">
            <BellIcon color={iconColor} size={32} />
          </View>
        </TouchableOpacity>
      </View>
      <NotificationModal />
    </>
  );
}
