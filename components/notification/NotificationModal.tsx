
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNotificationStore } from "../../states/useNotificationStore";
import { useAuthStore } from "../../states/useAuthStore";
import { timeAgo } from "../../lib/time";

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAllAsRead,
    dismissNotification
  } = useNotificationStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      if (visible && user?.id) {
        setLoading(true);
        await fetchNotifications(user.id);
        setLoading(false);
      }
    };
    loadNotifications();
  }, [visible, user?.id]);

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80">
        <TouchableOpacity onPress={onClose} className="flex-1" />
        <View className="bg-white rounded-t-2xl p-4 h-3/4">
          <View className="flex-row justify-between items-center pb-4 border-b border-gray-200">
            <View className="flex-row justify-between items-center gap-2">
            <Text className="text-xl font-bold text-gray-800">Notificações</Text>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllAsRead}>
                <Text className="text-blue-600 font-semibold">Marcar como lido</Text>
              </TouchableOpacity>
            )}
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-600 font-semibold">Fechar</Text>
            </TouchableOpacity>
          </View>


          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : notifications.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500 text-lg">Nenhuma notificação.</Text>
            </View>
          ) : (
            <ScrollView>
              {notifications.map((notification) => (
                <View
                  key={notification.id}
                  className={`p-4 flex-row items-center gap-4 ${!notification.is_read ? "bg-blue-50/50" : "bg-white"
                    } rounded-lg`}
                >
                  <Image
                    source={notification.user.profile_photo_url ? { uri: notification.user.profile_photo_url } : require("../../assets/icons/icon.png")}
                    className="w-12 h-12 rounded-full bg-gray-200"
                  />
                  <View className="flex-1">
                    <Text className="text-base text-gray-900 leading-relaxed">
                      <Text className="font-bold">{notification.user.username}</Text>
                      {notification.type === "like"
                        ? " curtiu sua publicação."
                        : " começou a seguir você."}
                      <Text className="text-sm text-gray-500"> {timeAgo(notification.created_at)}</Text>
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    {!notification.is_read && (
                      <View className="w-3 h-3 bg-blue-500 rounded-full" />
                    )}
                    <TouchableOpacity onPress={() => dismissNotification(notification.id)}>
                      <Image source={require('../../assets/icons/delete.png')} className="w-6 h-6 opacity-70" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default NotificationModal;
