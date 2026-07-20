import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { timeAgo } from "../../lib/time";
import { useAuthStore } from "../../states/useAuthStore";
import { useCommentStore } from "../../states/useCommentStore";
import { useThemeStore } from "../../states/useThemeStore";
import { DeleteIcon, UserIcon } from "../ui/Icons";

interface CommentSectionProps {
  expanded: boolean;
  postId: number;
  postUserId: string;
  onClose: () => void;
}

const CommentSection = ({ expanded, postId, postUserId, onClose }: CommentSectionProps) => {
  const { user } = useAuthStore();
  const isDark = useThemeStore((s) => s.isDark);
  const { comments, fetchComments, addComment, deleteComment } = useCommentStore();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [hasContent, setHasContent] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  const postComments = comments[postId] || [];

  useEffect(() => {
    if (expanded) {
      setLoading(true);
      setError(false);
      setHasContent(true);
      fetchComments(postId)
        .catch(() => setError(true))
        .finally(() => setLoading(false));
      Animated.timing(animatedHeight, {
        toValue: 600,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start(() => setHasContent(false));
    }
  }, [expanded, postId]);

  const handleSend = async () => {
    if (!body.trim() || !user?.id || sending) return;
    setSending(true);
    try {
      await addComment(postId, user.id, body.trim(), [
        {
          id: user.id,
          username: user.username || "Usuário",
          profile_photo_url: user.profile_photo_url || null,
        },
      ]);
      setBody("");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (deletingId === commentId) return;
    setDeletingId(commentId);
    try {
      await deleteComment(commentId, postId);
    } finally {
      setDeletingId(null);
    }
  };

  const renderTime = (createdAt: string) => {
    const formatted = timeAgo(createdAt);
    if (!formatted) return null;
    return (
      <Text className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
        {formatted}
      </Text>
    );
  };

  return (
    <Animated.View
      testID="comment-section"
      style={{ maxHeight: animatedHeight, overflow: "hidden" }}
    >
      {hasContent && (
        <View>
          <View className="border-t border-zinc-200 dark:border-zinc-800 mt-3 pt-3 px-2" />

          {loading ? (
            <View testID="loading-indicator" className="py-4 items-center">
              <Text className="text-sm text-zinc-400">Carregando...</Text>
            </View>
          ) : error ? (
            <View className="py-4 items-center">
              <Text className="text-sm text-zinc-400">Erro ao carregar comentários.</Text>
            </View>
          ) : postComments.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                Nenhum comentário ainda. Seja o primeiro!
              </Text>
            </View>
          ) : (
            <ScrollView
              className="px-2"
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 300 }}
              showsVerticalScrollIndicator
              nestedScrollEnabled
            >
              {postComments.map((comment) => (
                <View
                  key={comment.id}
                  className="py-3 flex-row items-start gap-3 border-b border-zinc-100 dark:border-zinc-800"
                >
                  <View className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 items-center justify-center overflow-hidden flex-shrink-0">
                    {comment.users.profile_photo_url ? (
                      <Image
                        source={{ uri: comment.users.profile_photo_url }}
                        className="w-full h-full"
                      />
                    ) : (
                      <UserIcon color={isDark ? "#a1a1aa" : "#71717a"} size={32} />
                    )}
                  </View>
                  <View className="flex-1 min-w-0">
                    <View className="flex-row items-baseline gap-1.5">
                      <Text className="font-bold text-sm text-zinc-900 dark:text-white">
                        {comment.users.username}
                      </Text>
                      <Text
                        className="text-sm text-zinc-600 dark:text-zinc-400 flex-shrink"
                        numberOfLines={3}
                      >
                        {comment.body}
                      </Text>
                    </View>
                    {renderTime(comment.created_at)}
                  </View>
                  {(user?.id === comment.user_id || user?.id === postUserId) && (
                    <TouchableOpacity
                      testID={`delete-comment-${comment.id}`}
                      onPress={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="p-1 flex-shrink-0"
                    >
                      <DeleteIcon color={isDark ? "#a1a1aa" : "#71717a"} size={16} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View className="flex-row items-center gap-2 px-2 py-3 border-t border-zinc-200 dark:border-zinc-800">
              <View className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 items-center justify-center overflow-hidden flex-shrink-0">
                {user?.profile_photo_url ? (
                  <Image source={{ uri: user.profile_photo_url }} className="w-full h-full" />
                ) : (
                  <UserIcon color={isDark ? "#a1a1aa" : "#71717a"} size={32} />
                )}
              </View>
              <TextInput
                ref={inputRef}
                testID="comment-input"
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white"
                placeholder="Escreva um comentário..."
                placeholderTextColor={isDark ? "#a1a1aa" : "#a1a1aa"}
                value={body}
                onChangeText={setBody}
                multiline={false}
                maxLength={1000}
              />
              <TouchableOpacity
                testID="send-comment"
                onPress={handleSend}
                disabled={!body.trim() || sending}
                className="px-4 py-2 bg-zinc-900 dark:bg-white rounded-lg disabled:opacity-50"
              >
                <Text className="text-sm font-bold text-white dark:text-zinc-900">Enviar</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </Animated.View>
  );
};

export default CommentSection;
