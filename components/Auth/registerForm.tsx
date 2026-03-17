import { View, Text, Alert } from 'react-native'
import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }
  
  return (
    <View>
      <Text>register</Text>
    </View>
  )
}