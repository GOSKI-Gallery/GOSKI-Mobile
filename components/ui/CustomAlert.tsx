import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { useThemeStore } from "../../states/useThemeStore";
import { useAlertStore, AlertButton } from "../../states/useAlertStore";

export default function CustomAlert() {
  const isDark = useThemeStore((s) => s.isDark);
  const { visible, title, message, buttons, hideAlert } = useAlertStore();

  const handlePress = (btn: AlertButton) => {
    hideAlert();
    btn.onPress?.();
  };

  const isSingle = buttons.length <= 1;

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={hideAlert}
      backdropOpacity={0.3}
      animationIn="fadeInUp"
      animationOut="fadeOutDown"
      animationInTiming={200}
      animationOutTiming={200}
      useNativeDriver
    >
      <View
        className={`rounded-2xl p-6 mx-4 border border-zinc-200 dark:border-zinc-700 ${isDark ? "bg-zinc-950" : "bg-white"}`}
      >
        <Text
          className={`text-lg font-bold text-center mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}
        >
          {title}
        </Text>

        <Text
          className={`text-sm text-center mb-6 leading-5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
        >
          {message}
        </Text>

        <View className={`flex-row ${isSingle ? "" : "justify-between"}`}>
          {buttons.map((btn, index) => {
            const isDestructive = btn.style === "destructive";
            const isCancel = btn.style === "cancel";

            const bgClass = isDestructive
              ? "bg-red-600"
              : isCancel
                ? isDark
                  ? "bg-zinc-800"
                  : "bg-zinc-200"
                : isDark
                  ? "bg-zinc-200"
                  : "bg-zinc-900";

            const textClass = isDestructive
              ? "text-white"
              : isCancel
                ? isDark
                  ? "text-zinc-400"
                  : "text-zinc-500"
                : isDark
                  ? "text-zinc-900"
                  : "text-white";

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                className={`flex-1 py-3 rounded-xl items-center mx-1 ${bgClass}`}
                onPress={() => handlePress(btn)}
              >
                <Text className={`font-bold text-base ${textClass}`}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}
