import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  type: "like" | "follow";
  user: {
    id: string;
    username: string;
    profile_photo_url: string;
  };
  post_id?: string;
  created_at: string;
  is_read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  dismissedIds: string[];
  readIds: string[];
  fetchNotifications: (userId: string) => Promise<void>;
  markAllAsRead: () => void;
  dismissNotification: (notificationId: string) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      dismissedIds: [],
      readIds: [],
      fetchNotifications: async (userId) => {
        const { data: follows, error: followsError } = await supabase
          .from("follows")
          .select("*, follower:users!follows_follower_id_foreign(*)")
          .eq("followed_id", userId);

        if (followsError) {
          console.error("Error fetching followers:", followsError);
          return;
        }

        const { data: likes, error: likesError } = await supabase
          .from("likes")
          .select("*, user:users!inner(*), post:posts!inner(*)")
          .eq("post.user_id", userId)
          .neq("user_id", userId);

        if (likesError) {
          console.error("Error fetching likes:", likesError);
          return;
        }

        const followNotifications: Notification[] = (follows || []).map((follow: any) => ({
          id: `follow_${follow.id}`,
          type: "follow",
          user: follow.follower,
          created_at: follow.created_at,
          is_read: false,
        }));

        const likeNotifications: Notification[] = (likes || []).map((like: any) => ({
          id: `like_${like.id}`,
          type: "like",
          user: like.user,
          post_id: like.post_id,
          created_at: like.created_at,
          is_read: false,
        }));

        const { dismissedIds, readIds } = get();

        const allNotifications = [...followNotifications, ...likeNotifications]
          .filter(n => !dismissedIds.includes(n.id))
          .map(n => ({ ...n, is_read: readIds.includes(n.id) }))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const newUnreadCount = allNotifications.filter(n => !n.is_read).length;
        
        set({
          notifications: allNotifications,
          unreadCount: newUnreadCount
        });
      },
      markAllAsRead: () => {
        set(state => {
          const allCurrentIds = state.notifications.map(n => n.id);
          const newReadIds = [...new Set([...state.readIds, ...allCurrentIds])];
          
          return {
            notifications: state.notifications.map(n => ({ ...n, is_read: true })),
            readIds: newReadIds,
            unreadCount: 0,
          };
        });
      },
      dismissNotification: (notificationId: string) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === notificationId);
          const wasUnread = notification ? !notification.is_read : false;
          
          return {
            dismissedIds: [...state.dismissedIds, notificationId],
            notifications: state.notifications.filter(n => n.id !== notificationId),
            unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
          };
        });
      }
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        dismissedIds: state.dismissedIds,
        readIds: state.readIds,
      }),
    }
  )
);
