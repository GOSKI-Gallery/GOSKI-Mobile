import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, View } from "react-native";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../states/useAuthStore";
import PrimaryButton from "../ui/PrimaryButton";
import StyledTextInput from "../ui/StyledTextInput";
import { EmailIcon, LockIcon } from "../ui/Icons";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const setAuth = useAuthStore((state) => state.setAuth);

  async function signInWithEmail() {
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      Alert.alert(authError.message);
      setLoading(false);
      return;
    }

    if (authData.session && authData.user) {
      let { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (!userData) {
        const now = new Date().toISOString();
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            id: authData.user.id,
            username: authData.user.user_metadata?.username || authData.user.email?.split('@')[0] || 'user',
            email: authData.user.email,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();

        if (insertError) {
          Alert.alert("Erro ao criar perfil", insertError.message);
          setLoading(false);
          return;
        }
        userData = newUser;
      }

      setAuth(
        {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          profile_photo_url: userData.profile_photo_url,
        },
        authData.session.access_token
      );
      router.replace("/(main)");
    } else {
      Alert.alert(
        "Erro de Login",
        "Não foi possível obter os dados do usuário."
      );
    }
    setLoading(false);
  }

  return (
    <View className="pt-4 gap-3 w-full items-center px-4">
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
        title="Entrar"
        onPress={signInWithEmail}
        loading={loading}
        className="mt-2"
      />
    </View>
  );
}
