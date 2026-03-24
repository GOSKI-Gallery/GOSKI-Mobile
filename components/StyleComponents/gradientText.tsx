import React from "react";
import { Text, View } from "react-native";
import { cssInterop } from "nativewind";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";

cssInterop(LinearGradient, {
  className: "style",
});
cssInterop(MaskedView, {
  className: "style",
});

interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

const GradientText = ({ children, className = "" }: GradientTextProps) => {
  return (
    <MaskedView
      className="h-12 flex-row"
      maskElement={
        <Text className={`${className}`}>{children}</Text>
      }
    >
      <LinearGradient
        colors={["#FF0000", "#AF054D", "#1B0EDB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text className="font-bold text-4xl opacity-0">{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

export default GradientText;
