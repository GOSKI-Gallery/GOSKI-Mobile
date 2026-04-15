import { useState } from "react";
import { Image, Text, View } from "react-native";
import { Path, Svg } from "react-native-svg";
import MenuDropDown, { MenuOption } from "./MenuDropDown";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../states/useAuthStore";

const Menu = () => {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  const handleProfileNavigation = () => {
    setVisible(false);
    if (user?.id) {
      router.push(`${user.id}`);
    }
  };

  const getImageSource = () => {
    if (user?.profile_photo_url) {
      return { uri: user.profile_photo_url };
    }
    return require("../../../assets/icons/icon.png");
  };

  return (
    <View className="flex justify-center items-center">
      <MenuDropDown
        visible={visible}
        handleOpen={() => setVisible(true)}
        handleClose={() => setVisible(false)}
        trigger={
          <View className="h-10 bg-primary flex-row justify-between items-center">
            <Image
              source={getImageSource()}
              alt="ProfilePicture"
              className="w-10 h-10 rounded-full"
            />
            <Svg height={20} width={20} viewBox="0 0 20 20" fill="black">
              <Path
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
                fillRule="evenodd"
              />
            </Svg>
          </View>
        }
      >
        <MenuOption onSelect={handleProfileNavigation}>
          <View className="flex flex-row justify-between items-center w-full">
            <Text className="text-lg font-bold">Meu perfil</Text>
            <Image
              source={require("../../../assets/icons/icon.png")}
              className="w-5 h-5"
            />
          </View>
        </MenuOption>

        <MenuOption
          onSelect={async () => {
            setVisible(false);
            await signOut();
            router.replace("/(auth)");
          }}
        >
          <View className="flex flex-row justify-between items-center w-full">
            <Text className="text-lg font-bold text-red-500">Sair</Text>
            <Image
              source={require("../../../assets/icons/exitRed.png")}
              className="w-5 h-5"
            />
          </View>
        </MenuOption>
      </MenuDropDown>
    </View>
  );
};
export default Menu;
