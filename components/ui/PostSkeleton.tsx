import React from "react";
import { View } from "react-native";

export default function PostSkeleton() {
  return (
    <View className="w-full mb-8 animate-pulse gap-5 bg-white dark:bg-zinc-950 rounded-2xl p-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          <View className="ml-3 w-32 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        </View>
        <View className="w-16 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
      </View>

      <View className="w-full aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />

      <View className="mt-3 space-y-2 gap-5">
        <View className="w-3/4 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <View className="w-1/2 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </View>
    </View>
  );
}
