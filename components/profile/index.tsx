import { View, Text, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import React, { useCallback } from "react";
import { useProfileStore } from "../../states/useProfileStore";
import UserPosts from "./UserPosts";
import { useFocusEffect } from "expo-router";
import { useFollowStore } from "../../states/useFollowStore";
import { useAuthStore } from "../../states/useAuthStore";

export default function Profile({ userId, isOwnProfile }: { userId: string, isOwnProfile: boolean }) {
  const { profileUser, userPosts, followersCount, followingCount, isLoading, fetchProfileData, clearProfile } = useProfileStore();
  const { following, toggleFollow } = useFollowStore();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const isFollowing = following[userId] || false;

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchProfileData(userId);
      }

      return () => {
        clearProfile();
      };
    }, [userId, fetchProfileData, clearProfile])
  );

  if (isLoading) {
    return <ActivityIndicator className="flex-1 justify-center items-center" />;
  }

  const handleFollowToggle = () => {
    toggleFollow(userId, currentUserId);
  };

  const ProfileHeader = () => (
    <View>
      <View className="pt-32 px-4">
        <View className="flex-col items-center gap-8 mb-12">
          <View className="w-24 h-24 rounded-full p-1 bg-gray-200">
            <View className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100">
              <Image
                source={
                  profileUser?.avatar_url
                    ? { uri: profileUser.avatar_url }
                    : require("../../assets/icons/icon.png")
                }
                className="w-full h-full object-cover"
              />
            </View>
          </View>

          <View className="flex-1 flex-col items-center">
            <View className="flex-col items-center gap-4 mb-6">
              <Text className="text-2xl font-light text-gray-900">
                {profileUser?.username}
              </Text>
              <View className="flex-row gap-2">
                {isOwnProfile ? (
                  <TouchableOpacity className="px-6 py-2 bg-white border border-gray-200 rounded-lg">
                    <Text className="text-sm font-bold">Editar perfil</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={handleFollowToggle} className="px-6 py-2 bg-zinc-900 rounded-lg">
                    <Text className="text-sm font-bold text-white">
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View className="flex-row gap-8 mb-6">
              <View className="items-center gap-1">
                <Text className="font-bold text-gray-900">{userPosts.length}</Text>
                <Text className="text-gray-500 text-sm">publicações</Text>
              </View>
              <View className="items-center gap-1">
                <Text className="font-bold text-gray-900">{followersCount}</Text>
                <Text className="text-gray-500 text-sm">seguidores</Text>
              </View>
              <View className="items-center gap-1">
                <Text className="font-bold text-gray-900">{followingCount}</Text>
                <Text className="text-gray-500 text-sm">seguindo</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="border-t border-gray-100">
          <View className="flex-row justify-center">
            <View className="flex-row items-center gap-2 py-4 border-t-2 border-gray-900 -mt-px w-1/3 justify-center">
              <Text className="text-xs font-black uppercase tracking-widest text-gray-900">
                Publicações
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <UserPosts
      posts={userPosts}
      ListHeaderComponent={<ProfileHeader />}
    />
  );
}
