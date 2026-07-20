import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  type: "like" | "follow" | "comment";
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
          .select("*")
          .eq("followed_id", userId);

        if (followsError) {
          console.error("Error fetching followers:", followsError);
          return;
        }

        const followerIds = [...new Set((follows || []).map((f: any) => f.follower_id))];
        const { data: followersData } = followerIds.length > 0
          ? await supabase.from("users").select("id, username, profile_photo_url").in("id", followerIds)
          : { data: [] };
        const followersMap = new Map((followersData || []).map((u: any) => [u.id, u]));

        const { data: userPosts } = await supabase
          .from("posts")
          .select("id")
          .eq("user_id", userId);
        const userPostIds = (userPosts || []).map((p: any) => p.id);

        let likes: any[] = [];
        if (userPostIds.length > 0) {
          const { data } = await supabase
            .from("likes")
            .select("*")
            .in("post_id", userPostIds);
          likes = (data || []).filter((l: any) => l.user_id !== userId);
        }

        const likeUserIds = [...new Set(likes.map((l: any) => l.user_id))];
        const { data: likesUsersData } = likeUserIds.length > 0
          ? await supabase.from("users").select("id, username, profile_photo_url").in("id", likeUserIds)
          : { data: [] };
        const likesUsersMap = new Map((likesUsersData || []).map((u: any) => [u.id, u]));

        const followNotifications: Notification[] = (follows || []).map((follow: any) => ({
          id: `follow_${follow.id}`,
          type: "follow",
          user: followersMap.get(follow.follower_id) || { id: follow.follower_id, username: "Usuário", profile_photo_url: "" },
          created_at: follow.created_at,
          is_read: false,
        }));

        const likeNotifications: Notification[] = likes.map((like: any) => ({
          id: `like_${like.id}`,
          type: "like",
          user: likesUsersMap.get(like.user_id) || { id: like.user_id, username: "Usuário", profile_photo_url: "" },
          post_id: like.post_id,
          created_at: like.created_at,
          is_read: false,
        }));

        let comments: any[] = [];
        if (userPostIds.length > 0) {
          const { data } = await supabase
            .from("comments")
            .select("*")
            .in("post_id", userPostIds);
          comments = (data || []).filter((c: any) => c.user_id !== userId);
        }

        const commentUserIds = [...new Set(comments.map((c: any) => c.user_id))];
        const { data: commentsUsersData } = commentUserIds.length > 0
          ? await supabase.from("users").select("id, username, profile_photo_url").in("id", commentUserIds)
          : { data: [] };
        const commentsUsersMap = new Map((commentsUsersData || []).map((u: any) => [u.id, u]));

        const commentNotifications: Notification[] = comments.map((comment: any) => ({
          id: `comment_${comment.id}`,
          type: "comment",
          user: commentsUsersMap.get(comment.user_id) || { id: comment.user_id, username: "Usuário", profile_photo_url: "" },
          post_id: comment.post_id,
          created_at: comment.created_at,
          is_read: false,
        }));

        const { dismissedIds, readIds } = get();

        const allNotifications = [...followNotifications, ...likeNotifications, ...commentNotifications]
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
