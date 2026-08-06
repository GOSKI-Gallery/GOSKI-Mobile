import React, { useState } from "react";
import { Image, LayoutChangeEvent, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { PinIcon } from "../ui/Icons";
import { getMapTiles, tileUrl } from "../../lib/tileMap";

interface LocationMapModalProps {
  visible: boolean;
  latitude: number;
  longitude: number;
  locationName?: string | null;
  onClose: () => void;
}

const ZOOM = 15;

const LocationMapModal = ({
  visible,
  latitude,
  longitude,
  locationName,
  onClose,
}: LocationMapModalProps) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSize({ width, height });
    }
  };

  const tiles = getMapTiles(latitude, longitude, ZOOM, size.width, size.height);

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

          <View
            className="w-full aspect-square bg-zinc-100 dark:bg-zinc-800 overflow-hidden"
            testID="location-map-area"
            onLayout={handleLayout}
          >
            {size.width > 0 &&
              tiles.map((tile) => (
                <Image
                  key={`${tile.x}-${tile.y}`}
                  source={{ uri: tileUrl(tile.x, tile.y, ZOOM) }}
                  testID="location-map-image"
                  style={{
                    position: "absolute",
                    width: 256,
                    height: 256,
                    left: tile.left,
                    top: tile.top,
                  }}
                  resizeMode="cover"
                />
              ))}
            <View
              className="absolute items-center justify-center"
              style={{
                left: size.width / 2 - 18,
                top: size.height / 2 - 32,
                width: 36,
                height: 36,
              }}
              pointerEvents="none"
            >
              <PinIcon color="#2563eb" size={36} />
            </View>
            <Text
              className="absolute bottom-1 left-1 bg-white/70 dark:bg-zinc-900/70 px-1 rounded text-[10px] text-zinc-500 dark:text-zinc-400"
              testID="map-attribution"
              pointerEvents="none"
            >
              © OpenStreetMap contributors © CARTO
            </Text>
          </View>

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