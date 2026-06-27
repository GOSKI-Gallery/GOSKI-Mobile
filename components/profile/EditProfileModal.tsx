import * as ImagePicker from "expo-image-picker";
import React, { useEffect } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { supabase } from "../../lib/supabase";
import uploadAvatar from "../../services/avatarService";
import { useAuthStore } from "../../states/useAuthStore";
import { useAlertStore } from "../../states/useAlertStore";
import { useEditProfileStore } from "../../states/useEditProfileStore";
import { useProfileStore } from "../../states/useProfileStore";
import { useModalStore } from "../../states/useModalStore";
import PrimaryButton from "../ui/PrimaryButton";
import StyledTextInput from "../ui/StyledTextInput";
import UploadButton from "../ui/UploadButton";
import { EmailIcon, LockIcon, UserIcon } from "../ui/Icons";

const { height } = Dimensions.get("window");

const EditProfileModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const {
    username,
    email,
    password,
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
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const userId = useAuthStore((state) => state.user?.id);
  const user = useAuthStore((state) => state.user);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const fetchProfileData = useProfileStore((state) => state.fetchProfileData);
  const clearAnimating = useModalStore((s) => s.clearAnimating);

  useEffect(() => {
    if (visible && user) {
      initialize(user);
    }
  }, [visible, user, initialize]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePublish = async () => {
    if (
      !userId ||
      (!imageUri && !username.trim() && !email.trim() && !password.trim())
    ) {
      handleClose();
      return;
    }
    setLoading(true);
    try {
      const updates: any = {};
      if (username.trim()) updates.username = username.trim();
      if (email.trim()) updates.email = email.trim();
      if (password.trim()) updates.password = password.trim();
      if (imageUri && imageUri !== user?.profile_photo_url) {
        const avatarResult = await uploadAvatar(userId, imageUri);
        updates.profile_photo_url = avatarResult.profile_photo_url;
      }
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from("users")
          .update(updates)
          .eq("id", userId);
        if (error) throw error;
      }

      // Inicia a cascata de atualização
      await refreshUser(); // 1. Atualiza o estado global de autenticação
      await fetchProfileData(userId); // 2. Força a atualização dos dados da tela de perfil

      handleClose();
    } catch (error: any) {
      useAlertStore.getState().showAlert({
        title: "Erro ao atualizar",
        message: error.message || "Ocorreu um erro inesperado.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        isVisible={visible}
        onBackdropPress={handleClose}
        onSwipeComplete={handleClose}
        onModalHide={clearAnimating}
        swipeDirection="down"
        style={{ margin: 0, justifyContent: "flex-end" }}
        backdropOpacity={0.2}
        animationInTiming={200}
        animationOutTiming={200}
        hideModalContentWhileAnimating
        avoidKeyboard
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ justifyContent: "flex-end" }}
        >
          <View
            className="bg-white dark:bg-zinc-900 rounded-t-[35px] p-6 shadow-2xl space-y-6"
            style={{ height: height * 0.85 }}
          >
          <View className="items-center">
            <View className="w-10 h-1.5 bg-zinc-200 rounded-full" />
            <Text className="text-zinc-900 dark:text-white text-xl font-bold mt-6">
              Editar perfil
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View className={`items-center mb-6 pt-2 ${imageUri ? "bg-zinc-200 dark:bg-zinc-800 rounded-2xl p-2" : ""}`}>
              <UploadButton imageUri={imageUri} onPress={handlePickImage} />
            </View>

            <View className="space-y-4 px-2 gap-2">
              <StyledTextInput
                icon={<UserIcon />}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
              />
              <StyledTextInput
                icon={<EmailIcon />}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <StyledTextInput
                icon={<LockIcon />}
                placeholder="Nova senha (opcional)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </ScrollView>

          <View className="px-2">
            <PrimaryButton
              onPress={handlePublish}
              title={"Salvar alterações"}
              loading={loading}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
    </>
  );
};
export default EditProfileModal;
