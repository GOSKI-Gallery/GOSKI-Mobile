import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, View } from "react-native";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../states/useAuthStore";
import PrimaryButton from "../ui/PrimaryButton";
import StyledTextInput from "../ui/StyledTextInput";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            username: username.trim(),
          },
        },
      });

      if (authError) throw authError;

      if (authData.user && authData.session) {
        setAuth(
          {
            id: authData.user.id,
            email: authData.user.email,
            username: authData.user.user_metadata.username,
          },
          authData.session.access_token
        );
        router.replace("/(main)");
      } else {
        throw new Error("Não foi possível registrar o usuário.");
      }
    } catch (error: any) {
      Alert.alert(
        "Erro no registro",
        error.message || "Ocorreu um erro inesperado."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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

      <PrimaryButton
        title="Registrar"
        onPress={handleRegister}
        loading={loading}
        className="mt-2"
      />
    </View>
  );
}
