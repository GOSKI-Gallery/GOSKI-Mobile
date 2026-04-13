
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useLike } from "../../hooks/useLike";
import { useAuthStore } from "../../states/useAuthStore";
import { useRouter } from "expo-router";

const SinglePost = ({ post }: { post: any }) => {
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id;
  const router = useRouter();

  const handleProfileNavigation = () => {
    if (post.users.id !== currentUserId) {
      router.push(`/${post.users.id}`);
    }
  };

  const hasLikedInitial = post.likes?.some(
    (l: any) => l.user_id === currentUserId
  );

  const { isLiked, toggleLike } = useLike(
    post.id,
    hasLikedInitial,
    currentUserId
  );

  return (
    <View className="w-full mb-8">
      <View className="flex-row items-center justify-between px-5 mb-3">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={handleProfileNavigation}
        >
          <View className="w-10 h-10 rounded-full overflow-hidden border border-zinc-200">
            {post.users?.profile_photo_url && (
              <Image
                source={{ uri: post.users.profile_photo_url }}
                className="w-full h-full"
              />
            )}
          </View>
          <Text className="text-zinc-900 font-bold ml-3 text-lg">
            {post.users?.username || "Usuário"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity></TouchableOpacity>
      </View>

      <Image
        source={{ uri: post.image_url }}
        className="w-full aspect-square bg-zinc-50"
        resizeMode="cover"
      />

      <View className="flex-row justify-between items-center mt-3">
        <View className="flex-row items-center px-5 mt-2 gap-2">
          <Text className="text-zinc-800 leading-5">
            <Text className="font-bold">{post.users?.username} </Text>
          </Text>
          <Text className="text-zinc-500 leading-5">{post.description}</Text>
        </View>

        <TouchableOpacity
          onPress={toggleLike}
          className="mr-4"
          disabled={!currentUserId}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={30}
            color={isLiked ? "#ff2d55" : "#18181b"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default SinglePost;
