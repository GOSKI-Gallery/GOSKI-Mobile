import { useState } from "react";
import { Image, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Path, Svg } from "react-native-svg";
import MenuDropDown, { MenuOption } from "./MenuDropDown";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../states/useAuthStore";
import { useThemeStore } from "../../../states/useThemeStore";
import { ExitIcon, UserIcon } from "../../ui/Icons";

const Menu = () => {
  const [visible, setVisible] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const handleProfileNavigation = () => {
    setVisible(false);
    if (user?.id) {
      router.push(`${user.id}`);
    }
  };

  return (
    <View className="flex justify-center items-center">
      <MenuDropDown
        visible={visible}
        handleOpen={() => setVisible(true)}
        handleClose={() => setVisible(false)}
        trigger={
          <View className="h-10 flex-row justify-between items-center">
            <View className="w-10 h-10 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
              {!avatarError && user?.profile_photo_url ? (
                <Image
                  source={{ uri: user.profile_photo_url }}
                  onError={() => setAvatarError(true)}
                  alt="ProfilePicture"
                  className="w-full h-full"
                />
              ) : (
                <UserIcon color={isDark ? "#a1a1aa" : "#71717a"} size={20} />
              )}
            </View>
            <Svg height={20} width={20} viewBox="0 0 20 20" fill={isDark ? "white" : "black"}>
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
            <Text className="text-lg font-bold dark:text-white">Meu perfil</Text>
            <UserIcon color={isDark ? "#ffffff" : "#18181b"} size={20} />
          </View>
        </MenuOption>

        <MenuOption onSelect={() => { setVisible(false); toggleTheme(); }}>
          <View className="flex flex-row justify-between items-center w-full">
            <Text className="text-lg font-bold dark:text-white">
              {isDark ? "Modo claro" : "Modo escuro"}
            </Text>
            <MaterialCommunityIcons
              name={isDark ? "weather-sunny" : "weather-night"}
              size={22}
              color={isDark ? "#fbbf24" : "#18181b"}
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
            <ExitIcon color="#dc2626" size={20} />
          </View>
        </MenuOption>
      </MenuDropDown>
    </View>
  );
};
export default Menu;
