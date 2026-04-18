
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
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-2xl p-4 h-3/4">
          <View className="flex-row justify-between items-center pb-4 border-b border-gray-200">
            <Text className="text-lg font-bold text-gray-800">Notificações</Text>
            <TouchableOpacity onPress={onClose}>
                <Text className="text-gray-500">Fechar</Text>
            </TouchableOpacity>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} className="py-2 items-center">
              <Text className="text-blue-600 font-medium">Marcar todas como lidas</Text>
            </TouchableOpacity>
          )}

          {loading ? (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : notifications.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500">Nenhuma notificação por enquanto.</Text>
            </View>
          ) : (
            <ScrollView>
              {notifications.map((notification) => (
                <View
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 flex-row items-start gap-3 relative ${
                    !notification.is_read ? "bg-blue-50" : "bg-white"
                  }`}
                >
                  {!notification.is_read && (
                    <View className="w-2 h-2 bg-blue-500 rounded-full absolute top-4 right-4" />
                  )}
                  <Image
                    source={{ uri: notification.user.avatar_url || undefined }}
                    className="w-10 h-10 rounded-full bg-gray-200"
                  />
                  <View className="flex-1">
                    <Text className="text-sm text-gray-800">
                      <Text className="font-bold">{notification.user.username}</Text>
                      {notification.type === "like"
                        ? " curtiu sua publicação."
                        : " começou a seguir você."}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </Text>
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
