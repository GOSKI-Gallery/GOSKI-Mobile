import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { timeAgo } from "../../lib/time";
import { useAuthStore } from "../../states/useAuthStore";
import { useModalStore } from "../../states/useModalStore";
import { useNotificationStore } from "../../states/useNotificationStore";

const { height } = Dimensions.get("window");

const NotificationModal = () => {
  const { user } = useAuthStore();
  const { isNotificationModalVisible, setNotificationModalVisible } =
    useModalStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAllAsRead,
    dismissNotification,
  } = useNotificationStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      if (isNotificationModalVisible && user?.id) {
        setLoading(true);
        await fetchNotifications(user.id);
        setLoading(false);
      }
    };
    loadNotifications();
  }, [isNotificationModalVisible, user?.id]);

  const handleMarkAllAsRead = () => {
    if (user?.id) {
      markAllAsRead();
    }
  };

  const handleClose = () => {
    setNotificationModalVisible(false);
  };

  return (
    <Modal
      isVisible={isNotificationModalVisible}
      onBackdropPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection="down"
      style={{ margin: 0, justifyContent: "flex-end" }}
      backdropOpacity={0.2}
    >
      <View
        className="bg-white rounded-t-[35px] p-6 shadow-2xl"
        style={{ height: height * 0.8 }}
      >
        <View className="items-center">
          <View className="w-10 h-1.5 bg-zinc-200 rounded-full" />
        </View>

        <View className="flex-row justify-between items-center mt-6 pb-4 border-b border-gray-200">
          <View className="flex-row items-center gap-2">
            <Text className="text-xl font-bold text-gray-800">
              Notificações
            </Text>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllAsRead}>
                <Text className="text-blue-600 font-semibold">
                  Marcar como lido
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <View
            testID="loading-indicator"
            className="flex-1 justify-center items-center"
          >
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : notifications.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-lg">
              Nenhuma notificação.
            </Text>
          </View>
        ) : (
          <ScrollView className="mt-4">
            {notifications.map((notification) => (
              <View
                key={notification.id}
                className={`p-4 flex-row items-center gap-4 ${
                  !notification.is_read ? "bg-blue-50/50" : "bg-white"
                } rounded-lg`}
              >
                <Image
                  source={
                    notification.user.profile_photo_url
                      ? { uri: notification.user.profile_photo_url }
                      : require("../../assets/icons/icon.png")
                  }
                  className="w-12 h-12 rounded-full bg-gray-200"
                />
                <View className="flex-1">
                  <Text className="text-base text-gray-900 leading-relaxed">
                    <Text className="font-bold">
                      {notification.user.username}
                    </Text>
                    {notification.type === "like"
                      ? " curtiu sua publicação."
                      : " começou a seguir você."}
                    <Text className="text-sm text-gray-500">
                      {" "}
                      {timeAgo(notification.created_at)}
                    </Text>
                  </Text>
                </View>
                <View className="flex-row items-center gap-3">
                  {!notification.is_read && (
                    <View className="w-3 h-3 bg-blue-500 rounded-full" />
                  )}
                  <TouchableOpacity
                    testID={`delete-notification-button-${notification.id}`}
                    onPress={() => dismissNotification(notification.id)}
                  >
                    <Image
                      source={require("../../assets/icons/delete.png")}
                      className="w-6 h-6 opacity-70"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

export default NotificationModal;
