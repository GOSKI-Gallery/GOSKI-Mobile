import { View, Text, Image } from "react-native";
import { useState } from "react";
import MenuDropDown, { MenuOption } from "./menuDropDown";
import { Svg, Path } from 'react-native-svg';

const Menu = () => {
  const [visible, setVisible] = useState(false);

  return (
    <View className='flex justify-center items-center bg-black rounded-xl'>
      <MenuDropDown
        visible={visible}
        handleOpen={() => setVisible(true)}
        handleClose={() => setVisible(false)}
        trigger={
          <View className="h-10 bg-primary flex-row justify-between items-center w-25 px-5">
            <Text className="text-base font-bold text-white">Opções</Text>
            <Svg height={20} width={20} viewBox="0 0 20 20" fill="white">
              <Path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
            </Svg>
          </View>
        }
      >

        <MenuOption onSelect={() => { (false) }}>
          <View className="flex flex-row justify-between items-center w-full">
            <Text className="text-lg font-bold">Meu perfil</Text>
            <Image source={require('../../../assets/icons/icon.png')}
              className='w-5 h-5'
            />
          </View>
        </MenuOption>

        <MenuOption onSelect={() => { setVisible(false) }}>
          <View className="flex flex-row justify-between items-center w-full">
            <Text className="text-lg font-bold text-red-500">Logout</Text>
            <Image source={require('../../../assets/icons/exitRed.png')}
              className='w-5 h-5'
            />
          </View>
        </MenuOption>

      </MenuDropDown>
    </View>
  );
}
export default Menu;