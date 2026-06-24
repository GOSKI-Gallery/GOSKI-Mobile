import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../states/useAuthStore";
import { useAlertStore } from "../../states/useAlertStore";
import PrimaryButton from "../ui/PrimaryButton";
import StyledTextInput from "../ui/StyledTextInput";
import { EmailIcon, LockIcon, UserIcon } from "../ui/Icons";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      useAlertStore.getState().showAlert({ title: "Aviso", message: "Por favor, preencha todos os campos." });
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

      if (authData.user) {
        const now = new Date().toISOString();
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          username: username.trim(),
          email: email.trim(),
          created_at: now,
          updated_at: now,
        });

        if (profileError) {
          console.warn('[Register] Profile insert error (RLS?):', profileError.message);
        }

        if (authData.session) {
          setAuth(
            {
              id: authData.user.id,
              email: authData.user.email,
              username: username.trim(),
            },
            authData.session.access_token
          );
          router.replace("/(main)");
        } else {
          useAlertStore.getState().showAlert({ title: "Verifique seu email", message: "Enviamos um link de confirmação para seu email." });
        }
      } else {
        throw new Error("Não foi possível registrar o usuário.");
      }
    } catch (error: any) {
      useAlertStore.getState().showAlert({
        title: "Erro no registro",
        message: error.message || "Ocorreu um erro inesperado."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="pt-4 gap-3 w-full items-center px-4">
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
