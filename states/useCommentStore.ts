import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Alert } from "react-native";

interface User {
  id: string;
  username: string;
  profile_photo_url: string | null;
}

interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  body: string;
  created_at: string;
  users: User;
}

interface CommentState {
  comments: { [key: string]: Comment[] };
  commentCounts: { [key: string]: number };
  fetchComments: (postId: number) => Promise<void>;
  addComment: (postId: number, userId: string, body: string, users: User[]) => Promise<void>;
  deleteComment: (commentId: number, postId: number) => Promise<void>;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: {},
  commentCounts: {},

  fetchComments: async (postId) => {
    const { data: commentsData, error: commentsError } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error("[useCommentStore] fetchComments error:", commentsError);
      return;
    }

    const comments = commentsData || [];

    if (comments.length > 0) {
      const userIds = [...new Set(comments.map((c: any) => c.user_id))];

      const { data: usersData } = await supabase
        .from("users")
        .select("id, username, profile_photo_url")
        .in("id", userIds);

      const usersMap = new Map((usersData || []).map((u: any) => [u.id, u]));

      const enriched = comments.map((c: any) => ({
        ...c,
        users: usersMap.get(c.user_id) || { id: c.user_id, username: "Usuário", profile_photo_url: null },
      }));

      set((state) => ({
        comments: { ...state.comments, [postId]: enriched },
        commentCounts: { ...state.commentCounts, [postId]: enriched.length },
      }));
    } else {
      set((state) => ({
        comments: { ...state.comments, [postId]: [] },
        commentCounts: { ...state.commentCounts, [postId]: 0 },
      }));
    }
  },

  addComment: async (postId, userId, body, users) => {
    if (!userId) {
      Alert.alert("Erro", "Você precisa estar logado para comentar.");
      return;
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userId,
        body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      Alert.alert("Erro", "Não foi possível adicionar o comentário.");
      console.error(error.message);
      return;
    }

    const userData = users.find((u) => u.id === userId) || {
      id: userId,
      username: "Usuário",
      profile_photo_url: null,
    };

    const newComment: Comment = {
      id: data.id,
      post_id: postId,
      user_id: userId,
      body,
      created_at: data.created_at,
      users: userData,
    };

    set((state) => ({
      comments: {
        ...state.comments,
        [postId]: [...(state.comments[postId] || []), newComment],
      },
      commentCounts: {
        ...state.commentCounts,
        [postId]: (state.commentCounts[postId] || 0) + 1,
      },
    }));
  },

  deleteComment: async (commentId, postId) => {
    const currentComments = get().comments[postId] || [];
    const currentCount = get().commentCounts[postId] || 0;

    const deletedComment = currentComments.find((c) => c.id === commentId);

    set((state) => ({
      comments: {
        ...state.comments,
        [postId]: state.comments[postId]?.filter((c) => c.id !== commentId) || [],
      },
      commentCounts: {
        ...state.commentCounts,
        [postId]: Math.max(0, (state.commentCounts[postId] || 0) - 1),
      },
    }));

    const { error } = await supabase
      .from("comments")
      .delete()
      .match({ id: commentId });

    if (error) {
      set((state) => ({
        comments: { ...state.comments, [postId]: currentComments },
        commentCounts: { ...state.commentCounts, [postId]: currentCount },
      }));
      Alert.alert("Erro", "Não foi possível excluir o comentário.");
      console.error(error.message);
    }
  },
}));
