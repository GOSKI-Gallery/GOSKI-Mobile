import { View, FlatList, Image, Dimensions, StyleProp, ViewStyle } from "react-native";
import React, { useState } from "react";

const { width } = Dimensions.get("window");

export default function UserPosts({
  posts,
  ListHeaderComponent,
  contentContainerStyle,
}: {
  posts: any[];
  ListHeaderComponent?: React.ReactElement;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
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
    />
  );
}

function PostGridItem({ item }: { item: any }) {
  const [error, setError] = useState(false);
  return (
    <View style={{ width: width / 3, height: width / 3 }}>
      <Image
        source={error ? require("../../assets/icons/icon.png") : { uri: item.image_url }}
        onError={() => setError(true)}
        style={{ flex: 1, margin: 1 }}
      />
    </View>
  );
}
