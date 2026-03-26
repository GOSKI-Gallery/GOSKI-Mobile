import { View, Text } from 'react-native'
import React from 'react'
import Header from '../components/Header'
import Post from '../components/Post/postCard'

export default function FeedScreen() {
  return (
    <View className='flex-1'>
      <Header />

      <View className="flex-1"> 
         <Post isLoading={true} posts={[]} />
      </View>
    </View>
  )
}