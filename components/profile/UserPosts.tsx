import { View, FlatList, Image, Dimensions, RefreshControl, StyleProp, ViewStyle } from "react-native";
import React, { useState } from "react";
import { useThemeStore } from "../../states/useThemeStore";

const { width } = Dimensions.get("window");

export default function UserPosts({
  posts,
  refreshing,
  onRefresh,
  ListHeaderComponent,
  contentContainerStyle,
}: {
  posts: any[];
  refreshing: boolean;
  onRefresh: () => void;
  ListHeaderComponent?: React.ReactElement;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  const isDark = useThemeStore((s) => s.isDark);

  return (
    <FlatList
      data={posts}
      numColumns={3}
      renderItem={({ item }) => (
        <PostGridItem item={item} />
      )}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={contentContainerStyle}
      className="bg-white dark:bg-zinc-950"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? "#a1a1aa" : "#18181b"}
          colors={[isDark ? "#a1a1aa" : "#18181b"]}
        />
      }
    />
  );
}

function PostGridItem({ item }: { item: any }) {
  const [error, setError] = useState(false);
  const isDark = useThemeStore((s) => s.isDark);
  return (
    <View style={{ width: width / 3, height: width / 3 }}>
      {error ? (
        <View style={{ flex: 1, margin: 1, backgroundColor: isDark ? "#27272a" : "#e4e4e7" }} />
      ) : (
        <Image
          source={{ uri: item.image_url }}
          onError={() => setError(true)}
          style={{ flex: 1, margin: 1 }}
        />
      )}
    </View>
  );
}
