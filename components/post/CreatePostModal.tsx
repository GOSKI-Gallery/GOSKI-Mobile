import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import Modal from "react-native-modal";
import uploadPost from "../../services/postService";
import { getLocationName, ResolvedLocation } from "../../lib/location";
import { useAuthStore } from "../../states/useAuthStore";
import { useAlertStore } from "../../states/useAlertStore";
import { useModalStore } from "../../states/useModalStore";
import { usePostStore } from "../../states/usePostStore";
import ImageCropper from "../ui/ImageCropper";
import PrimaryButton from "../ui/PrimaryButton";
import SourcePickerSheet from "../ui/SourcePickerSheet";
import UploadButton from "../ui/UploadButton";

const { height } = Dimensions.get("window");

const CreatePostModal = () => {
  const [image, setImage] = useState<string | null>(null);
  const [pendingCropUri, setPendingCropUri] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingPost, setPendingPost] = useState<any>(null);
  const [location, setLocation] = useState<ResolvedLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);

  const { isCreatePostModalVisible, closeCreatePostModal, clearAnimating } =
    useModalStore();
  const { addPostOptimistic } = usePostStore();
  const user = useAuthStore((state) => state.user);

  const reset = () => {
    setImage(null);
    setPendingCropUri(null);
    setShowCropper(false);
    setDescription("");
    setLoading(false);
    setPendingPost(null);
    setLocation(null);
    setLocating(false);
    setShowSourcePicker(false);
  };

  const handlePickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPendingCropUri(result.assets[0].uri);
      setShowCropper(true);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPendingCropUri(result.assets[0].uri);
        setShowCropper(true);
      }
    } catch {
      useAlertStore.getState().showAlert({
        title: "Câmera indisponível",
        message: "Não foi possível acessar a câmera. Verifique as permissões.",
      });
    }
  };

  const handleChooseSource = (key: string) => {
    setShowSourcePicker(false);
    if (key === "camera") {
      handleTakePhoto();
    } else if (key === "gallery") {
      handlePickFromLibrary();
    }
  };

  const handleCropComplete = (croppedUri: string) => {
    setImage(croppedUri);
    setShowCropper(false);
    setPendingCropUri(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setPendingCropUri(null);
  };

  const handleToggleLocation = async () => {
    if (location) {
      setLocation(null);
      return;
    }

    setLocating(true);
    try {
      const resolved = await getLocationName();
      if (resolved) {
        setLocation(resolved);
      } else {
        useAlertStore.getState().showAlert({
          title: "Localização indisponível",
          message: "Não foi possível obter sua localização. Verifique as permissões.",
        });
      }
    } catch {
      useAlertStore.getState().showAlert({
        title: "Localização indisponível",
        message: "Não foi possível obter sua localização. Tente novamente.",
      });
    } finally {
      setLocating(false);
    }
  };

  const handlePublish = async () => {
    if (!image || !description || !user) return;

    setLoading(true);
    try {
      const newPost = await uploadPost(
        user.id,
        image,
        description,
        location ?? undefined
      );
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
              maxHeight: height * 0.9,
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ alignItems: "center", paddingBottom: 120 }}
            >
              <View className="w-10 h-1.5 bg-zinc-200 rounded-full mb-6" />

              <Text className="text-zinc-900 dark:text-white text-xl font-bold mb-6">
                Nova Publicação
              </Text>

              <View className={image ? "bg-zinc-200 dark:bg-zinc-800 rounded-2xl p-2" : ""}>
                <UploadButton
                  imageUri={image}
                  onPress={() => setShowSourcePicker(true)}
                />
              </View>

                <TextInput
                  className="w-full text-zinc-800 dark:text-white p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl mt-6 h-28 border border-zinc-100 dark:border-zinc-700"
                  placeholder="Escreva uma legenda..."
                  placeholderTextColor="#a1a1aa"
                  multiline
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />

                <View className="w-full flex-row items-center justify-between px-1 mt-4">
                  <View className="flex-row items-center gap-2 flex-shrink">
                    {location ? (
                      <Text
                        testID="location-name"
                        className="text-sm text-blue-600 dark:text-blue-400"
                      >
                        {location.location_name || "Localização adicionada"}
                      </Text>
                    ) : locating ? (
                      <Text
                        testID="location-loading"
                        className="text-sm text-zinc-400"
                      >
                        Obtendo localização...
                      </Text>
                    ) : (
                      <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                        Adicionar localização
                      </Text>
                    )}
                  </View>
                  <Switch
                    testID="location-toggle"
                    value={!!location}
                    disabled={locating}
                    onValueChange={handleToggleLocation}
                  />
                </View>

                <PrimaryButton
                  onPress={handlePublish}
                  title={"Publicar"}
                  loading={loading}
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        {showCropper && pendingCropUri && (
          <ImageCropper
            className="absolute inset-0 z-50"
            imageUri={pendingCropUri}
            aspect={[1, 1]}
            onCrop={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}
        {showSourcePicker && (
          <SourcePickerSheet
            options={[
              { label: "Tirar foto", key: "camera" },
              { label: "Escolher da galeria", key: "gallery" },
            ]}
            onSelect={handleChooseSource}
            onCancel={() => setShowSourcePicker(false)}
          />
        )}
        </View>
      </Modal>
  );
};
export default CreatePostModal;
