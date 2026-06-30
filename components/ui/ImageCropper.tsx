import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStore } from "../../states/useThemeStore";

interface ImageCropperProps {
  imageUri: string;
  aspect?: [number, number];
  onCrop: (croppedUri: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUri,
  aspect = [1, 1],
  onCrop,
  onCancel,
}) => {
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((s) => s.isDark);
  const [normalized, setNormalized] = useState<{
    uri: string;
    width: number;
    height: number;
  } | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [cropping, setCropping] = useState(false);

  const displaySizeRef = useRef(displaySize);
  const containerSizeRef = useRef(containerSize);
  displaySizeRef.current = displaySize;
  containerSizeRef.current = containerSize;

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const tx = useRef(0);
  const ty = useRef(0);
  const sc = useRef(1);

  const panStartX = useRef(0);
  const panStartY = useRef(0);
  const lastTx = useRef(0);
  const lastTy = useRef(0);

  const pinchStartDist = useRef(0);
  const pinchStartScale = useRef(1);

  useEffect(() => {
    (async () => {
      try {
        const result = await manipulateAsync(imageUri, [], {
          format: SaveFormat.JPEG,
          compress: 0.92,
        });
        setNormalized({ uri: result.uri, width: result.width, height: result.height });
      } catch {
        Image.getSize(
          imageUri,
          (w, h) => setNormalized({ uri: imageUri, width: w, height: h }),
          () => {}
        );
      }
    })();
  }, [imageUri]);

  useEffect(() => {
    if (!normalized) return;
    if (containerSize.width === 0 || containerSize.height === 0) return;

    const imageAspect = normalized.width / normalized.height;
    const containerAspect = containerSize.width / containerSize.height;

    let dispWidth: number;
    let dispHeight: number;

    if (imageAspect > containerAspect) {
      dispWidth = containerSize.width;
      dispHeight = dispWidth / imageAspect;
    } else {
      dispHeight = containerSize.height;
      dispWidth = dispHeight * imageAspect;
    }

    setDisplaySize({ width: dispWidth, height: dispHeight });
  }, [normalized, containerSize]);

  const getPinchDist = (touches: any) => {
    if (!touches || touches.length < 2) return 0;
    const dx = touches[1].pageX - touches[0].pageX;
    const dy = touches[1].pageY - touches[0].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const clamp = (cx: number, cy: number, s: number) => {
    const ds = displaySizeRef.current;
    const cs = containerSizeRef.current;
    if (ds.width === 0 || ds.height === 0) return { x: cx, y: cy };

    const cSize = Math.min(cs.width, cs.height);
    const eW = ds.width * s;
    const eH = ds.height * s;

    if (eW <= cSize && eH <= cSize) return { x: 0, y: 0 };

    return {
      x:
        eW <= cSize
          ? 0
          : Math.min((eW - cSize) / 2, Math.max(-(eW - cSize) / 2, cx)),
      y:
        eH <= cSize
          ? 0
          : Math.min((eH - cSize) / 2, Math.max(-(eH - cSize) / 2, cy)),
    };
  };

  const handleTouchStart = (evt: any) => {
    const touches = evt.nativeEvent.touches;
    if (!touches || touches.length === 0) return;

    if (touches.length >= 2) {
      pinchStartDist.current = getPinchDist(touches);
      pinchStartScale.current = sc.current;
    } else {
      panStartX.current = touches[0].pageX;
      panStartY.current = touches[0].pageY;
      lastTx.current = tx.current;
      lastTy.current = ty.current;
    }
  };

  const handleTouchMove = (evt: any) => {
    const touches = evt.nativeEvent.touches;
    if (!touches || touches.length === 0) return;

    if (touches.length >= 2) {
      const dist = getPinchDist(touches);
      if (pinchStartDist.current > 0) {
        const newScale = Math.min(
          5,
          Math.max(0.5, pinchStartScale.current * (dist / pinchStartDist.current))
        );
        sc.current = newScale;
        scale.setValue(newScale);
        const c = clamp(tx.current, ty.current, newScale);
        tx.current = c.x;
        ty.current = c.y;
        translateX.setValue(c.x);
        translateY.setValue(c.y);
      }
    } else {
      const dx = touches[0].pageX - panStartX.current;
      const dy = touches[0].pageY - panStartY.current;
      const newX = lastTx.current + dx;
      const newY = lastTy.current + dy;
      const c = clamp(newX, newY, sc.current);
      tx.current = c.x;
      ty.current = c.y;
      translateX.setValue(c.x);
      translateY.setValue(c.y);
    }
  };

  const handleTouchEnd = () => {
    pinchStartDist.current = 0;
  };

  const handleCrop = async () => {
    if (cropping || !normalized) return;
    setCropping(true);

    try {
      const imgW = normalized.width;
      const imgH = normalized.height;
      const cSize = Math.min(containerSize.width, containerSize.height);
      const cX = containerSize.width / 2;
      const cY = containerSize.height / 2;
      const s = sc.current;
      const cx = tx.current;
      const cy = ty.current;
      const dw = displaySize.width;
      const dh = displaySize.height;

      const imgLeft = cX + cx - (dw * s) / 2;
      const imgTop = cY + cy - (dh * s) / 2;
      const imgRight = imgLeft + dw * s;
      const imgBottom = imgTop + dh * s;

      const cropLeft = cX - cSize / 2;
      const cropTop = cY - cSize / 2;
      const cropRight = cropLeft + cSize;
      const cropBottom = cropTop + cSize;

      const visLeft = Math.max(cropLeft, imgLeft);
      const visTop = Math.max(cropTop, imgTop);
      const visRight = Math.min(cropRight, imgRight);
      const visBottom = Math.min(cropBottom, imgBottom);

      const visWidth = Math.max(0, visRight - visLeft);
      const visHeight = Math.max(0, visBottom - visTop);

      const originX = ((visLeft - imgLeft) / (dw * s)) * imgW;
      const originY = ((visTop - imgTop) / (dh * s)) * imgH;
      const cropW = (visWidth / (dw * s)) * imgW;
      const cropH = (visHeight / (dh * s)) * imgH;

      const squareSize = Math.min(cropW, cropH);

      const adjOriginX = originX + (cropW - squareSize) / 2;
      const adjOriginY = originY + (cropH - squareSize) / 2;

      const safeOriginX = Math.max(
        0,
        Math.min(adjOriginX, imgW - squareSize)
      );
      const safeOriginY = Math.max(
        0,
        Math.min(adjOriginY, imgH - squareSize)
      );
      const safeSize = Math.min(
        squareSize,
        imgW - safeOriginX,
        imgH - safeOriginY
      );

      const result = await manipulateAsync(
        normalized.uri,
        [
          {
            crop: {
              originX: Math.round(safeOriginX),
              originY: Math.round(safeOriginY),
              width: Math.round(safeSize),
              height: Math.round(safeSize),
            },
          },
        ],
        { format: SaveFormat.JPEG, compress: 0.8 }
      );

      onCrop(result.uri);
    } catch {
      onCancel();
    } finally {
      setCropping(false);
    }
  };

  const cropSize = Math.min(containerSize.width, containerSize.height);
  const overlayTop = (containerSize.height - cropSize) / 2;
  const overlayLeft = (containerSize.width - cropSize) / 2;

  const overlayColor = isDark ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.25)";
  const gridColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)";
  const borderColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";

  return (
    <Modal visible animationType="slide" statusBarTranslucent>
      <View className="flex-1 bg-[#FAFAFA] dark:bg-zinc-800">
        <View
          className="flex-1"
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setContainerSize({ width, height });
          }}
        >
          <View
            className="flex-1"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {displaySize.width > 0 && normalized && (
              <Animated.Image
                source={{ uri: normalized.uri }}
                style={{
                  position: "absolute",
                  left: (containerSize.width - displaySize.width) / 2,
                  top: (containerSize.height - displaySize.height) / 2,
                  width: displaySize.width,
                  height: displaySize.height,
                  transform: [
                    { translateX: translateX },
                    { translateY: translateY },
                    { scale: scale },
                  ],
                }}
                resizeMode="contain"
              />
            )}
          </View>

          <View className="absolute inset-0" pointerEvents="none">
            <View style={{ height: overlayTop, backgroundColor: overlayColor }} />
            <View className="flex-row" style={{ height: cropSize }}>
              <View style={{ width: overlayLeft, backgroundColor: overlayColor }} />
              <View
                style={{
                  width: cropSize,
                  height: cropSize,
                  borderWidth: 1,
                  borderColor,
                }}
              >
                <View className="flex-1 justify-center items-center">
                  <View
                    style={{
                      position: "absolute",
                      top: cropSize / 3,
                      left: 0,
                      right: 0,
                      height: 1,
                      backgroundColor: gridColor,
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: (cropSize * 2) / 3,
                      left: 0,
                      right: 0,
                      height: 1,
                      backgroundColor: gridColor,
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      left: cropSize / 3,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      backgroundColor: gridColor,
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      left: (cropSize * 2) / 3,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      backgroundColor: gridColor,
                    }}
                  />
                </View>
              </View>
              <View style={{ width: overlayLeft, backgroundColor: overlayColor }} />
            </View>
            <View style={{ flex: 1, backgroundColor: overlayColor }} />
          </View>

          <View
            className="absolute top-0 left-0 right-0 flex-row justify-between items-center px-6"
            style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}
          >
            <TouchableOpacity
              onPress={onCancel}
              className="px-5 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-700"
              activeOpacity={0.8}
            >
              <Text className="text-zinc-800 dark:text-white font-bold text-base">
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCrop}
              disabled={cropping || !normalized}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-950"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">
                {cropping ? "Processando..." : "Confirmar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ImageCropper;
