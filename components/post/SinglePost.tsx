import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useLike } from "../../hooks/useLike";
import { useAuthStore } from "../../states/useAuthStore"; // Importe sua store

const SinglePost = ({ post }: { post: any }) => {
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id;

  const hasLikedInitial = post.likes?.some((l: any) => l.user_id === currentUserId);

  const { isLiked, toggleLike } = useLike(post.id, hasLikedInitial, currentUserId);

  return (
    <View className="w-full mb-8">
      <View className="flex-row items-center justify-between px-5 mb-3">
        <View className="flex-row items-center">
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
        </View>
      </View>

      <Image
        source={{ uri: post.image_url }}
        className="w-full aspect-square bg-zinc-50"
        resizeMode="cover"
      />

      <View className="flex-row items-center px-5 mt-3">
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

      <View className="px-5 mt-2">
        <Text className="text-zinc-800 leading-5">
          <Text className="font-bold">{post.users?.username} </Text>
          {post.description}
        </Text>
      </View>
    </View>
  );
};
export default SinglePost;