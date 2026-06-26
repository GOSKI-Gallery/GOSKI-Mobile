import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Modal from "react-native-modal";
import uploadPost from "../../services/postService";
import { useAuthStore } from "../../states/useAuthStore";
import { useAlertStore } from "../../states/useAlertStore";
import { useModalStore } from "../../states/useModalStore";
import { usePostStore } from "../../states/usePostStore";
import PrimaryButton from "../ui/PrimaryButton";
import UploadButton from "../ui/UploadButton";
import ImageCropper from "../ui/ImageCropper";

const { height } = Dimensions.get("window");

const CreatePostModal = () => {
  const [image, setImage] = useState<string | null>(null);
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingPost, setPendingPost] = useState<any>(null);

  const { isCreatePostModalVisible, closeCreatePostModal, clearAnimating } =
    useModalStore();
  const { addPostOptimistic } = usePostStore();
  const user = useAuthStore((state) => state.user);

  const reset = () => {
    setImage(null);
    setPickedImageUri(null);
    setDescription("");
    setLoading(false);
    setPendingPost(null);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPickedImageUri(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!image || !description || !user) return;

    setLoading(true);
    try {
      const newPost = await uploadPost(user.id, image, description);
      if (newPost) {
        setPendingPost({
          ...newPost,
          users: {
            id: user.id,
            username: user.username,
            profile_photo_url: user.profile_photo_url,
            followers: [],
          },
          likes: [],
        });
        closeCreatePostModal();
      }
    } catch (error: any) {
      useAlertStore.getState().showAlert({
        title: "Erro ao publicar",
        message: error.message || "Ocorreu um erro inesperado.",
      });
      setLoading(false);
    }
  };

  const onModalHide = () => {
    clearAnimating();
    if (pendingPost) {
      addPostOptimistic(pendingPost);
    }
    reset();
  };

  return (
    <>
      <ImageCropper
        visible={!!pickedImageUri}
        imageUri={pickedImageUri || ''}
        onCrop={(uri) => {
          setImage(uri);
          setPickedImageUri(null);
        }}
        onCancel={() => setPickedImageUri(null)}
      />
      <Modal
        isVisible={isCreatePostModalVisible}
        onBackdropPress={closeCreatePostModal}
        onSwipeComplete={closeCreatePostModal}
        onModalHide={onModalHide}
        swipeDirection="down"
        style={{ margin: 0, justifyContent: "flex-end" }}
        backdropOpacity={0.2}
        animationInTiming={200}
        animationOutTiming={200}
        hideModalContentWhileAnimating
      >
        <View className="flex-1 justify-end">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View
              className="bg-white dark:bg-zinc-900 rounded-t-[35px] p-6 items-center shadow-2xl border-t border-t-zinc-100 dark:border-t-zinc-700"
              style={{
                height: height * 0.8,
              }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ alignItems: "center" }}
              >
                <View className="w-10 h-1.5 bg-zinc-200 rounded-full mb-6" />

                <Text className="text-zinc-900 dark:text-white text-xl font-bold mb-6">
                  Nova Publicação
                </Text>

                <UploadButton imageUri={image} onPress={handlePickImage} />

                <TextInput
                  className="w-full text-zinc-800 dark:text-white p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl mt-6 h-28 border border-zinc-100 dark:border-zinc-700"
                  placeholder="Escreva uma legenda..."
                  placeholderTextColor="#a1a1aa"
                  multiline
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />

                <PrimaryButton
                  onPress={handlePublish}
                  title={"Publicar"}
                  loading={loading}
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
};
export default CreatePostModal;
