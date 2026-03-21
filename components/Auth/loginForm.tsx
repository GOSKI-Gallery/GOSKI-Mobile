import React, { useState } from 'react'
import { Alert, View } from 'react-native'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'expo-router';
import PrimaryButton from '../styleComponents/primaryButton';
import StyledTextInput from '../styleComponents/styledTextInput';

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter();

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      Alert.alert(error.message);
    }

    else {
      router.replace('/(main)');
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