import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, View } from "react-native";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../states/useAuthStore";
import PrimaryButton from "../ui/PrimaryButton";
import StyledTextInput from "../ui/StyledTextInput";

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
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (userError) {
        Alert.alert("Error fetching user data", userError.message);
      } else if (userData) {
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
      }
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
        title="Entrar"
        onPress={signInWithEmail}
        loading={loading}
        className="mt-2"
      />
    </View>
  );
}
