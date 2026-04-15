import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import uploadPost from "../../services/postService";
import { useAuthStore } from "../../states/useAuthStore";
import PrimaryButton from "../ui/PrimaryButton";
import UploadButton from "../ui/UploadButton";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get("window");

const CreatePostModal = ({ visible, onClose }: CreatePostModalProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const userId = useAuthStore((state) => state.user?.id);

  const handlePublish = async () => {
    if (!image || !description || !userId) return;

    setLoading(true);
    try {
      await uploadPost(userId, image, description);
    } catch (error: any) {
      Alert.alert(
        "Erro ao publicar",
        error.message || "Ocorreu um erro inesperado.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={{ margin: 0, justifyContent: "flex-end" }}
      backdropOpacity={0.2}
    >
      <View className="flex-1 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            className="bg-white rounded-t-[35px] p-6 items-center shadow-2xl"
            style={{
              height: height * 0.8,
              borderTopWidth: 1,
              borderTopColor: "#f4f4f5",
            }}
          >
            <View className="w-10 h-1.5 bg-zinc-200 rounded-full mb-6" />

            <Text className="text-zinc-900 text-xl font-bold mb-6">
              Nova Publicação
            </Text>

            <UploadButton imageUri={image} onPress={handlePickImage} />

            <TextInput
              className="w-full text-zinc-800 p-4 bg-zinc-50 rounded-2xl mt-6 h-28 border border-zinc-100"
              placeholder="Escreva uma legenda..."
              placeholderTextColor="#a1a1aa"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />

            <PrimaryButton onPress={handlePublish} title={"Publicar"} />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
export default CreatePostModal;
