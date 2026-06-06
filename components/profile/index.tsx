import {
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useState } from "react";
import { useProfileStore } from "../../states/useProfileStore";
import { useThemeStore } from "../../states/useThemeStore";
import UserPosts from "./UserPosts";
import { useFocusEffect } from "expo-router";
import { useFollowStore } from "../../states/useFollowStore";
import { useAuthStore } from "../../states/useAuthStore";
import EditProfileModal from "./EditProfileModal";
import { UserIcon } from "../ui/Icons";

export default function Profile({
  userId,
  isOwnProfile,
}: {
  userId: string;
  isOwnProfile: boolean;
}) {
  const {
    profileUser,
    userPosts,
    followersCount,
    followingCount,
    isLoading,
    fetchProfileData,
    clearProfile,
  } = useProfileStore();
  const { following, toggleFollow } = useFollowStore();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const isDark = useThemeStore((s) => s.isDark);
  const isFollowing = following[userId] || false;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchProfileData(userId);
      }

      return () => {
        clearProfile();
      };
    }, [userId, fetchProfileData, clearProfile]),
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-950">
        <ActivityIndicator testID="loading-indicator" size="large" color="#18181b" />
      </View>
    );
  }

  const handleFollowToggle = () => {
    toggleFollow(userId, currentUserId);
  };

  const ProfileHeader = () => (
    <View className='flex justify-center bg-white dark:bg-zinc-950'>
      <View className="pt-32 px-4">
        <View className="flex-col items-center gap-4 mb-6">
          <View className="w-32 h-32 rounded-full p-1 bg-zinc-200 dark:bg-zinc-700">
            <View className="w-full h-full rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
              {profileUser?.profile_photo_url ? (
                <Image
                  source={{ uri: profileUser.profile_photo_url }}
                  className="w-full h-full"
                />
              ) : (
                <UserIcon color={isDark ? "#a1a1aa" : "#71717a"} size={48} />
              )}
            </View>
          </View>

          <View className="flex-1 flex-col items-center">
            <View className="flex-col items-center gap-4 mb-6">
              <Text className="text-2xl font-light text-zinc-900 dark:text-white">
                {profileUser?.username}
              </Text>
              <View className="flex-row gap-2">
                {isOwnProfile ? (
                  <TouchableOpacity
                    onPress={() => setIsEditModalOpen(true)}
                    className="px-6 py-2 bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                  >
                    <Text className="text-sm font-bold text-white">
                      Editar perfil
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleFollowToggle}
                    className="px-6 py-2 bg-zinc-900 rounded-lg"
                  >
                    <Text className="text-sm font-bold text-white">
                      {isFollowing ? "Seguindo" : "Seguir"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View className="flex-row gap-8 mb-6">
              <View className="items-center gap-1">
                <Text className="font-bold text-zinc-900 dark:text-white">
                  {userPosts.length}
                </Text>
                <Text className="text-zinc-500 dark:text-zinc-400 text-sm">publicações</Text>
              </View>
              <View className="items-center gap-1">
                <Text className="font-bold text-zinc-900 dark:text-white">
                  {followersCount}
                </Text>
                <Text className="text-zinc-500 dark:text-zinc-400 text-sm">seguidores</Text>
              </View>
              <View className="items-center gap-1">
                <Text className="font-bold text-zinc-900 dark:text-white">
                  {followingCount}
                </Text>
                <Text className="text-zinc-500 dark:text-zinc-400 text-sm">seguindo</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="border-t border-zinc-100 dark:border-zinc-800">
          <View className="flex-row justify-center">
            <View className="flex-row items-center gap-2 py-4 border-t-2 border-zinc-900 dark:border-white -mt-px w-1/3 justify-center">
              <Text className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                Publicações
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <UserPosts posts={userPosts} ListHeaderComponent={<ProfileHeader />} />
      <EditProfileModal
        visible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
}
