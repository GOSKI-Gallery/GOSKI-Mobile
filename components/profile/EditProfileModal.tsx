import * as ImagePicker from "expo-image-picker";
import React, { useEffect } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import Modal from "react-native-modal";
import uploadAvatar from "../../services/avatarService";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../states/useAuthStore";
import { useEditProfileStore } from "../../states/useEditProfileStore";
import PrimaryButton from "../ui/PrimaryButton";
import UploadButton from "../ui/UploadButton";
import StyledTextInput from "../ui/StyledTextInput";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get("window");

const EditProfileModal = ({ visible, onClose }: CreatePostModalProps) => {
  const {
    username,
    email,
    password,
    profilePhotoUrl,
    imageUri,
    loading,
    setUsername,
    setEmail,
    setPassword,
    setImageUri,
    setLoading,
    initialize,
    reset,
  } = useEditProfileStore();

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const userId = useAuthStore((state) => state.user?.id);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (visible && user) {
      initialize(user);
    } else if (!visible) {
      reset();
    }
  }, [visible, user, initialize, reset]);

  const handlePublish = async () => {
    if (
      !userId ||
      (!imageUri && !username.trim() && !email.trim() && !password.trim())
    )
      return;

    setLoading(true);
    try {
      const updates: any = {};
      if (username.trim()) {
        updates.username = username.trim();
      }
      if (email.trim()) {
        updates.email = email.trim();
      }
      if (password.trim()) {
        // Note: Password updates might require special handling
        updates.password = password.trim();
      }
      if (imageUri) {
        const avatarResult = await uploadAvatar(userId, imageUri);
        updates.profile_photo_url = avatarResult.profile_photo_url;
      }

      if (Object.keys(updates).length > 0) {
        const { data, error } = await supabase
          .from("users")
          .update(updates)
          .eq("id", userId)
          .select()
          .single();

        if (error) throw error;
      }

      onClose();
    } catch (error: any) {
      Alert.alert(
        "Erro ao atualizar",
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
              Editar perfil
            </Text>

            <View className="pt-4 gap-3 w-full items-center px-4">
              <StyledTextInput
                icon={require("../../assets/icons/icon.png")}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
              />

              <StyledTextInput
                icon={require("../../assets/icons/email.png")}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <StyledTextInput
                icon={require("../../assets/icons/lock.png")}
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <UploadButton imageUri={imageUri} onPress={handlePickImage} />

            <PrimaryButton
              onPress={handlePublish}
              title={"Salvar alterações"}
              loading={loading}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
export default EditProfileModal;
