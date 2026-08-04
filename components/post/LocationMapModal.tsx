import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { PinIcon } from "../ui/Icons";

interface LocationMapModalProps {
  visible: boolean;
  latitude: number;
  longitude: number;
  locationName?: string | null;
  onClose: () => void;
}

const staticMapUrl = (latitude: number, longitude: number) =>
  `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=15&size=600x400&maptype=mapnik&markers=${latitude},${longitude},red`;

const LocationMapModal = ({
  visible,
  latitude,
  longitude,
  locationName,
  onClose,
}: LocationMapModalProps) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={{ margin: 0 }}
      backdropOpacity={0.4}
      animationInTiming={200}
      animationOutTiming={200}
      hideModalContentWhileAnimating
    >
      <View className="flex-1 justify-center px-6">
        <View className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <Text className="text-zinc-900 dark:text-white text-lg font-bold">
              Localização
            </Text>
            <TouchableOpacity onPress={onClose} testID="close-location-map">
              <Text className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                Fechar
              </Text>
            </TouchableOpacity>
          </View>

          <Image
            source={{ uri: staticMapUrl(latitude, longitude) }}
            testID="location-map-image"
            className="w-full aspect-square bg-zinc-100 dark:bg-zinc-800"
            resizeMode="cover"
          />

          <View className="px-5 py-4 flex-row items-center gap-2">
            <PinIcon color="#2563eb" size={18} />
            <Text className="text-sm text-zinc-700 dark:text-zinc-300 flex-shrink">
              {locationName || "Localização exata"}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LocationMapModal;