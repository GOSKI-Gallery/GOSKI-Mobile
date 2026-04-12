import { useLocalSearchParams } from "expo-router";
import { useAuthStore } from "../../../states/useAuthStore";
import Profile from "../../../components/profile";
import Header from "../../../components/header";
import { View } from "react-native";

export default function UserProfile() {
  const { userId } = useLocalSearchParams();
  const { user } = useAuthStore();

  const id = Array.isArray(userId) ? userId[0] : userId;

  if (!id) {
    return null;
  }

  const isOwnProfile = user ? user.id === id : false;

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <Profile userId={id} isOwnProfile={isOwnProfile} />
    </View>
  );
}
