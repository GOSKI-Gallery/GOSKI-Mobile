import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useThemeStore } from "../../states/useThemeStore";
import { useModalStore } from "../../states/useModalStore";
import { useNotificationStore } from "../../states/useNotificationStore";
import NotificationModal from "../notification/NotificationModal";
import { AddIcon, BellIcon } from "../ui/Icons";

export default function ActionButtons() {
  const { openCreatePostModal, setNotificationModalVisible } = useModalStore();
  const isDark = useThemeStore((s) => s.isDark);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
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
          <View testID="notification-bell-icon" className="relative">
            <BellIcon color={iconColor} size={32} />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                <Text className="text-white text-[11px] font-bold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
      <NotificationModal />
    </>
  );
}
