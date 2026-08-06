import React from "react";
import {
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface SourceOption {
  label: string;
  key: string;
}

interface SourcePickerSheetProps {
  options: SourceOption[];
  cancelLabel?: string;
  onSelect: (key: string) => void;
  onCancel: () => void;
}

const SourcePickerSheet: React.FC<SourcePickerSheetProps> = ({
  options,
  cancelLabel = "Cancelar",
  onSelect,
  onCancel,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="absolute inset-0 z-50 justify-end">
      <Pressable
        testID="source-sheet-backdrop"
        className="absolute inset-0 bg-black/40"
        onPress={onCancel}
      />
      <View
        className="bg-white dark:bg-zinc-900 rounded-t-[35px] pt-6 px-6 pb-4 border-t border-t-zinc-100 dark:border-t-zinc-700"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            testID={`source-option-${option.key}`}
            onPress={() => onSelect(option.key)}
            className="py-4 items-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-zinc-900 dark:text-white font-semibold text-base">
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          testID="source-cancel"
          onPress={onCancel}
          className="py-4 items-center rounded-2xl bg-zinc-100 dark:bg-zinc-800"
          activeOpacity={0.8}
        >
          <Text className="text-zinc-500 dark:text-zinc-400 font-semibold text-base">
            {cancelLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SourcePickerSheet;
