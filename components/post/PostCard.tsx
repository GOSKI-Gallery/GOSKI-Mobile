import React from "react";
import { ScrollView } from "react-native";
import { supabase } from "../../lib/supabase";
import PostSkeleton from "../ui/PostSkeleton";
import SinglePost from "./SinglePost";

export default function PostCard({
  isLoading,
  posts,
}: {
  isLoading: boolean;
  posts: any[];
}) {
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  if (isLoading || !userId)
    return (
      <ScrollView
        className="flex-1 w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 110, paddingBottom: 20 }}
      >
        {[1, 2, 3].map((key) => (
          <PostSkeleton key={key} />
        ))}
      </ScrollView>
    );

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 110, paddingBottom: 100 }}
    >
      {posts.map((post) => (
        <SinglePost key={post.id} post={post} currentUserId={userId} />
      ))}
    </ScrollView>
  );
}
