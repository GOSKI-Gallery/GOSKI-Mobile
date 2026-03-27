import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useLike } from "../../hooks/useLike";

const SinglePost = ({
  post,
  currentUserId,
}: {
  post: any;
  currentUserId: string;
}) => {
  const hasLiked = post.likes?.some((l: any) => l.user_id === currentUserId);

  const { isLiked, toggleLike } = useLike(post.id, hasLiked, currentUserId);

  return (
    <View className="w-full mb-8">
      <View className="flex-row items-center justify-between px-5 mb-3">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-zinc-800 rounded-full overflow-hidden">
            <Image
              source={{ uri: post.users?.profile_photo_url }}
              className="w-full h-full"
            />
          </View>
          <Text className="text-white font-bold ml-3 text-lg">
            {post.users?.username}
          </Text>
        </View>
      </View>

      <Image
        source={{ uri: post.image_url }}
        className="w-full aspect-square bg-zinc-900"
      />

      <View className="flex-row items-center px-5 mt-3">
        <TouchableOpacity onPress={toggleLike} className="mr-4">
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={30}
            color={isLiked ? "#ff2d55" : "white"}
          />
        </TouchableOpacity>
      </View>

      <View className="px-5 mt-2">
        <Text className="text-white">
          <Text className="font-bold">{post.users?.username} </Text>
          {post.description}
        </Text>
      </View>
    </View>
  );
};
export default SinglePost;
