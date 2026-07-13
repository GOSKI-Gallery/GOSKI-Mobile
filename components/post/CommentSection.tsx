import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { timeAgo } from "../../lib/time";
import { useAuthStore } from "../../states/useAuthStore";
import { useCommentStore } from "../../states/useCommentStore";
import { useThemeStore } from "../../states/useThemeStore";
import { DeleteIcon, SendIcon, UserIcon } from "../ui/Icons";

const { height } = Dimensions.get("window");

interface CommentSectionProps {
  visible: boolean;
  postId: number;
  postUserId: string;
  onClose: () => void;
}

const CommentSection = ({ visible, postId, postUserId, onClose }: CommentSectionProps) => {
  const { user } = useAuthStore();
  const isDark = useThemeStore((s) => s.isDark);
  const { comments, commentCounts, fetchComments, addComment, deleteComment } = useCommentStore();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const postComments = comments[postId] || [];
  const commentCount = commentCounts[postId] || 0;

  useEffect(() => {
    if (visible) {
      setLoading(true);
      fetchComments(postId).finally(() => setLoading(false));
    }
  }, [visible, postId]);

  const handleSend = async () => {
    if (!body.trim() || !user?.id) return;

    await addComment(postId, user.id, body.trim(), [
      {
        id: user.id,
        username: user.username || "Usuário",
        profile_photo_url: user.profile_photo_url || null,
      },
    ]);
    setBody("");
  };

  const handleDelete = async (commentId: number) => {
    await deleteComment(commentId, postId);
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={{ margin: 0, justifyContent: "flex-end" }}
      backdropOpacity={0.2}
      animationInTiming={200}
      animationOutTiming={200}
      hideModalContentWhileAnimating
    >
      <View
        testID="comment-section"
        className="bg-white dark:bg-zinc-900 rounded-t-[35px] shadow-2xl"
        style={{ height: height * 0.75 }}
      >
        <View className="items-center pt-3">
          <View className="w-10 h-1.5 bg-zinc-200 dark:bg-zinc-600 rounded-full" />
        </View>

        <View className="flex-row justify-between items-center px-6 pt-4 pb-3 border-b border-gray-200 dark:border-zinc-700">
          <Text className="text-lg font-bold text-gray-800 dark:text-white">
            Comentários ({commentCount})
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-600 dark:text-blue-400 font-semibold">Fechar</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View testID="loading-indicator" className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : postComments.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 dark:text-zinc-400 text-base">
              Nenhum comentário ainda.
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1 px-6 pt-2" keyboardShouldPersistTaps="handled">
            {postComments.map((comment) => (
              <View
                key={comment.id}
                className="py-3 flex-row items-start gap-3 border-b border-gray-100 dark:border-zinc-800"
              >
                <View className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zinc-700 items-center justify-center overflow-hidden">
                  {comment.users.profile_photo_url ? (
                    <Image
                      source={{ uri: comment.users.profile_photo_url }}
                      className="w-full h-full"
                    />
                  ) : (
                    <UserIcon color={isDark ? "#a1a1aa" : "#71717a"} size={18} />
                  )}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-bold text-sm text-gray-900 dark:text-white">
                      {comment.users.username}
                    </Text>
                    <Text className="text-xs text-gray-400 dark:text-zinc-500">
                      {timeAgo(comment.created_at)}
                    </Text>
                  </View>
                  <Text className="text-base text-gray-800 dark:text-zinc-200 mt-0.5">
                    {comment.body}
                  </Text>
                </View>
                {(user?.id === comment.user_id || user?.id === postUserId) && (
                  <TouchableOpacity
                    testID={`delete-comment-${comment.id}`}
                    onPress={() => handleDelete(comment.id)}
                    className="p-1"
                  >
                    <DeleteIcon color={isDark ? "#a1a1aa" : "#71717a"} size={20} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View className="flex-row items-center gap-3 px-4 py-3 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <View className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zinc-700 items-center justify-center overflow-hidden">
              {user?.profile_photo_url ? (
                <Image source={{ uri: user.profile_photo_url }} className="w-full h-full" />
              ) : (
                <UserIcon color={isDark ? "#a1a1aa" : "#71717a"} size={18} />
              )}
            </View>
            <TextInput
              ref={inputRef}
              testID="comment-input"
              className="flex-1 bg-gray-100 dark:bg-zinc-800 rounded-xl px-4 py-2.5 text-base text-gray-900 dark:text-white"
              placeholder="Adicionar comentário..."
              placeholderTextColor={isDark ? "#a1a1aa" : "#9ca3af"}
              value={body}
              onChangeText={setBody}
              multiline={false}
            />
            <TouchableOpacity
              testID="send-comment"
              onPress={handleSend}
              disabled={!body.trim()}
              className="p-2"
            >
              <SendIcon color={body.trim() ? (isDark ? "#3b82f6" : "#2563eb") : (isDark ? "#52525b" : "#d4d4d8")} size={24} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CommentSection;
