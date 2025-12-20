import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

export default function Index() {
  return (
    <View style={style.container}>
      <Text>GoskiGallery</Text>
    </View>
  )
}

const style = StyleSheet.create({
    container : {
        flex : 1,
        justifyContent : 'center',
        alignItems : 'center',
        experimental_backgroundImage: 'url(https://picsum.photos/200/300)'
    }
})
