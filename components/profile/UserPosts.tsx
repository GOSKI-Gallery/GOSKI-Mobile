import { View, FlatList, Image, Dimensions, StyleProp, ViewStyle } from "react-native";
import React from "react";

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
        <View style={{ width: width / 3, height: width / 3 }}>
          <Image
            source={{ uri: item.image_url }}
            style={{ flex: 1, margin: 1 }}
          />
        </View>
      )}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={contentContainerStyle}
    />
  );
}
