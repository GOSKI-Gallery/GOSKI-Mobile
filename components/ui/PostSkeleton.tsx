import { View } from 'react-native';
import React from 'react';

export default function PostSkeleton() {
  return (
    <View className="w-full mb-8 animate-pulse gap-5">
      <View className="flex-row items-center justify-between px-5 mb-3">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-zinc-200 rounded-full" />
          <View className="ml-3 w-32 h-4 bg-zinc-200 rounded-xl" />
        </View>
        <View className="w-16 h-8 bg-zinc-200 rounded-full" />
      </View>

      <View className="w-full aspect-square bg-zinc-200 px-5" />

      <View className="px-5 mt-3 space-y-2 gap-5">
        <View className="w-3/4 h-4 bg-zinc-200 rounded" />
        <View className="w-1/2 h-4 bg-zinc-200 rounded" />
      </View>
    </View>
  );
}