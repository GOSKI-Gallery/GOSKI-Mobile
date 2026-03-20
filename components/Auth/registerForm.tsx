import { View, Alert, Image, TextInput } from 'react-native'
import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'expo-router'
import PrimaryButton from '../styleComponents/primaryButton'
import StyledTextInput from '../styleComponents/styledTextInput'

export default function RegiterForm() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function signUpWithEmail() {
    if (password !== passwordConfirm) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }

    setLoading(true)
    const { data: { session }, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
        }
      }
    })

    if (error) {
      Alert.alert(error.message)
    }

    else if (!session) {
      router.replace('/');
    }
    setLoading(false)
  }

  return (
    <View className='pt-4 gap-3 w-full items-center px-4'>

      <StyledTextInput
        icon={require('../../assets/icons/icon.png')}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

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

      <StyledTextInput
        icon={require('../../assets/icons/lock.png')}
        placeholder="Confirme sua Senha"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        secureTextEntry
      />

      <PrimaryButton
        title="Cadastrar"
        onPress={signUpWithEmail}
        loading={loading}
        className="mt-2 w-full"
      />
    </View>
  )
}