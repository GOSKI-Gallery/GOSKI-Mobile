import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../../states/useAuthStore";
import { useRouter } from "expo-router";
import { useLikeStore } from "../../states/useLikeStore";
import { useFollowStore } from "../../states/useFollowStore";

const SinglePost = ({ post }: { post: any }) => {
  const user = useAuthStore((state) => state.user);
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
    <View className="w-full mb-8">
      <View className="flex-row items-center justify-between px-5 mb-3">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={handleProfileNavigation}
        >
          <View className="w-10 h-10 rounded-full overflow-hidden border border-zinc-200">
            {post.users?.avatar_url && (
              <Image
                source={{ uri: post.users.avatar_url }}
                className="w-full h-full"
              />
            )}
          </View>
          <Text className="text-zinc-900 font-bold ml-3 text-lg">
            {post.users?.username || "Usuário"}
          </Text>
        </TouchableOpacity>

        {!isOwnPost && (
          <TouchableOpacity onPress={handleFollowToggle} className="px-6 py-2 bg-zinc-900 rounded-lg">
            <Text className="text-sm font-bold text-white">
              {isFollowing ? 'Seguindo' : 'Seguir'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Image
        source={{ uri: post.image_url }}
        className="w-full aspect-square bg-zinc-50"
        resizeMode="cover"
      />

      <View className="flex-row justify-between items-center mt-3 px-5">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => toggleLike(post.id, currentUserId)}
            disabled={!currentUserId}
            className="flex-row items-center gap-2 pr-3 py-2 rounded-xl active:bg-red-50 transition-all"
          >
            <Image
              className={`w-6 h-6 opacity-80 transition-all ${isLiked ? 'opacity-100' : ''}`}
              source={require("../../assets/icons/like.png")}
              alt="Like"
            />
            <Text
              className={`text-sm font-black text-gray-700 transition-all ${isLiked ? 'text-red-600' : ''}`}>
              {likeCount}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-5 mt-2">
        <Text className="text-zinc-800 leading-5">
          <Text className="font-bold">{post.users?.username} </Text>
          <Text className="text-zinc-500">{post.description}</Text>
        </Text>
      </View>
    </View>
  );
};
export default SinglePost;
