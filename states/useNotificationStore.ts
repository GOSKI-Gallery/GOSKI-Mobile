
import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface Notification {
  id: string;
  type: "like" | "follow";
  user: {
    id: string;
    username: string;
    avatar_url: string;
  };
  post_id?: string;
  created_at: string;
  is_read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: (userId: string) => Promise<void>;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async (userId) => {
    const { data: follows, error: followsError } = await supabase
      .from("follows")
      .select(`
        *, 
        follower:users!inner(*)
      `)
      .eq("followed_id", userId);

    if (followsError) {
      console.error("Error fetching followers:", followsError);
      return;
    }

    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select(`
        *, 
        user:users!inner(*),
        post:posts!inner(*)
      `)
      .eq("post.user_id", userId)
      .neq("user_id", userId);

    if (likesError) {
      console.error("Error fetching likes:", likesError);
      return;
    }

    const followNotifications: Notification[] = follows.map((follow: any) => ({
      id: `follow_${follow.id}`,
      type: "follow",
      user: {
        id: follow.follower.id,
        username: follow.follower.username,
        avatar_url: follow.follower.avatar_url,
      },
      created_at: follow.created_at,
      is_read: false, 
    }));

    const likeNotifications: Notification[] = likes.map((like: any) => ({
      id: `like_${like.id}`,
      type: "like",
      user: {
        id: like.user.id,
        username: like.user.username,
        avatar_url: like.user.avatar_url,
      },
      post_id: like.post_id,
      created_at: like.created_at,
      is_read: false, 
    }));

    const allNotifications = [...followNotifications, ...likeNotifications].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    set({ notifications: allNotifications, unreadCount: allNotifications.filter(n => !n.is_read).length });
  },
  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount: 0
    }))
  }
}));
