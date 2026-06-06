import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../../states/useAuthStore";
import { useThemeStore } from "../../states/useThemeStore";
import { timeAgo } from "../../lib/time";
import { useRouter } from "expo-router";
import { useLikeStore } from "../../states/useLikeStore";
import { useFollowStore } from "../../states/useFollowStore";
import { LikeIcon, UserIcon } from "../ui/Icons";

const SinglePost = ({ post }: { post: any }) => {
  const [profileError, setProfileError] = useState(false);
  const [postImageError, setPostImageError] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isDark = useThemeStore((s) => s.isDark);
  const currentUserId = user?.id;
  const router = useRouter();

  const { likes, likeCounts, toggleLike } = useLikeStore();
  const isLiked = likes[post.id] || false;
  const likeCount = likeCounts[post.id] || 0;

  const { following, toggleFollow } = useFollowStore();
  const isFollowing = following[post.users.id] || false;

  const handleProfileNavigation = () => {
    if (post.users.id !== currentUserId) {
      router.push(`/(main)/(profile)/${post.users.id}`);
    }
  };

  const handleFollowToggle = () => {
    toggleFollow(post.users.id, currentUserId);
  };

  const isOwnPost = currentUserId === post.users.id;

  return (
    <View className="w-full mb-8 bg-white dark:bg-zinc-950 rounded-2xl p-4 shadow-sm">
      <View className="flex-row items-center justify-between px-5 mb-3">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={handleProfileNavigation}
        >
          <View className="w-10 h-10 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
            {!profileError && post.users?.profile_photo_url ? (
              <Image
                source={{ uri: post.users.profile_photo_url }}
                onError={() => setProfileError(true)}
                className="w-full h-full"
              />
            ) : (
              <UserIcon color={isDark ? "#a1a1aa" : "#71717a"} size={20} />
            )}
          </View>
          <View>
            <Text className="text-zinc-900 dark:text-white font-bold ml-3 text-lg">
              {post.users?.username || "Usuário"}
            </Text>
              <Text className="text-zinc-400 dark:text-zinc-500 text-xs ml-3">
              {timeAgo(post.created_at)}
            </Text>
          </View>
        </TouchableOpacity>

        {!isOwnPost && (
          <TouchableOpacity onPress={handleFollowToggle} className="px-6 py-2 bg-zinc-900 rounded-lg">
            <Text className="text-sm font-bold text-white">
              {isFollowing ? 'Seguindo' : 'Seguir'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {postImageError ? (
        <View className="w-full aspect-square bg-zinc-50 dark:bg-zinc-800" />
      ) : (
        <Image
          source={{ uri: post.image_url }}
          onError={() => setPostImageError(true)}
          className="w-full aspect-square bg-zinc-50 dark:bg-zinc-800"
          resizeMode="cover"
        />
      )}

      <View className="flex-row justify-between items-center mt-3 px-2">
        <View className="mt-2">
          <Text className="text-zinc-800 dark:text-zinc-300 leading-5">
            <Text className="font-bold">{post.users?.username} </Text>
            <Text className="text-zinc-500 dark:text-zinc-400">{post.description}</Text>
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => toggleLike(post.id, currentUserId)}
            disabled={!currentUserId}
            className="flex-row items-center gap-2 pr-3 py-2 rounded-xl active:bg-red-50 dark:active:bg-zinc-800 transition-all"
            testID="like-button"
          >
            <LikeIcon
              color={isLiked ? "#dc2626" : (isDark ? "#d4d4d8" : "#18181b")}
              filled={isLiked}
              size={24}
            />
            <Text
              className={`text-sm font-black text-zinc-700 dark:text-zinc-300 transition-all ${isLiked ? 'text-red-600' : ''}`}>
              {likeCount}
            </Text>
          </TouchableOpacity>
        </View>
        
      </View>

    </View>
  );
};
export default SinglePost;
