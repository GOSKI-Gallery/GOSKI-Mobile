import React, { useState } from 'react'
import { Alert, Image, View, Text, TextInput, TouchableOpacity } from 'react-native'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'expo-router';


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
      Alert.alert(error.message)
    } 
    
    else {
      router.navigate('/feed')
    }
    setLoading(false)
  }

  return (
    <View className='pt-4 gap-3 w-full items-center px-4'>
      <View className='flex-row items-center bg-[#D9D9D9] rounded-2xl w-full'>
        <Image
          source={require('../../assets/icons/icon.png')}
          className='left-4 absolute w-5 h-5 opacity-30'
        />
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Email"
          placeholderTextColor="#0000004D"
          className='flex-1 text-black text-center font-bold'
        />
      </View>

      <View className='flex-row items-center bg-[#D9D9D9] rounded-2xl w-full'>
        <Image
          source={require('../../assets/icons/lock.png')}
          className='left-4 absolute w-5 h-5 opacity-30'
        />
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Senha"
          placeholderTextColor="#0000004D"
          className='flex-1 text-black text-center font-bold'
        />
      </View>

      <TouchableOpacity
        className="bg-[#1000FF] py-3 px-20 rounded-2xl min-w-lg mt-2"
        onPress={() => signInWithEmail()}
        disabled={loading}
      >
        <Text className="text-white font-bold text-center text-lg">Entrar</Text>
      </TouchableOpacity>
    </View>
  )
}
