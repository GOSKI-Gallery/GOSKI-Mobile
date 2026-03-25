import React, { useState } from 'react'
import { Alert, View } from 'react-native'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'expo-router';
import PrimaryButton from '../StyleComponents/primaryButton';
import StyledTextInput from '../StyleComponents/styledTextInput';
import { useAuthStore } from '../../states/useAuthStore';

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter();

  const setAuth = useAuthStore((state) => state.setAuth);

  async function signInWithEmail() {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      Alert.alert(error.message);
    }

    else {
      if (data.session && data.user && data.user.email) {
        setAuth({
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata.username,
        }, data.session.access_token)
        router.replace('/(main)');
      } 
      else {
        Alert.alert('Erro de Login', 'Não foi possível obter os dados do usuário.')
      }
    }
    setLoading(false)
  }

  return (
    <View className='pt-4 gap-3 w-full items-center px-4'>
      <StyledTextInput
        icon={require('../../assets/icons/email.png')}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <StyledTextInput
        icon={require('../../assets/icons/lock.png')}
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
  )
}
