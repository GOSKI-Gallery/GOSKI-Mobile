import { View, Text } from 'react-native'
import React from 'react'
import PostCard from './postCard'

export default function Post() {
  return (
    <View>
      <PostCard isLoading={false} posts={[]} />
    </View>
  )
}