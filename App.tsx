import { View } from 'react-native';
import Index from './app/(auth)/index';
import "./global.css"


export default function App() {
  return (
    <View className="flex-1 items-center bg-[#ECECEC] pt-12">
      <Index />
    </View>
  );
}