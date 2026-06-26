import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useAlertStore } from '../../states/useAlertStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 90;
const CROP_MARGIN = 24;
const CROP_SIZE = SCREEN_WIDTH - CROP_MARGIN * 2;

interface ImageCropperProps {
  visible: boolean;
  imageUri: string;
  onCrop: (croppedUri: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({ visible, imageUri, onCrop, onCancel }: ImageCropperProps) {
  const [loading, setLoading] = useState(false);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUri, (w, h) => setImgSize({ width: w, height: h }));
    }
  }, [imageUri]);

  const handleCrop = async () => {
    if (imgSize.width === 0) return;
    setLoading(true);
    try {
      const imgAspect = imgSize.width / imgSize.height;
      let cropSize: { originX: number; originY: number; width: number; height: number };

      if (imgAspect >= 1) {
        const h = imgSize.height;
        const w = h;
        cropSize = {
          originX: (imgSize.width - w) / 2,
          originY: 0,
          width: w,
          height: h,
        };
      } else {
        const w = imgSize.width;
        const h = w;
        cropSize = {
          originX: 0,
          originY: (imgSize.height - h) / 2,
          width: w,
          height: h,
        };
      }

      const result = await manipulateAsync(
        imageUri,
        [{ crop: cropSize }],
        { format: SaveFormat.JPEG, compress: 0.8 }
      );

      const finalResult = await manipulateAsync(
        result.uri,
        [{ resize: { width: 500, height: 500 } }],
        { format: SaveFormat.JPEG, compress: 0.8 }
      );

      onCrop(finalResult.uri);
    } catch (error: any) {
      useAlertStore.getState().showAlert({
        title: 'Erro ao cortar',
        message: error.message || 'Ocorreu um erro inesperado.',
      });
    } finally {
      setLoading(false);
    }
  };

  const cropTop = (SCREEN_HEIGHT - HEADER_HEIGHT - CROP_SIZE) / 2 + HEADER_HEIGHT;
  const cropLeft = (SCREEN_WIDTH - CROP_SIZE) / 2;

  return (
    <Modal
      isVisible={visible}
      style={{ margin: 0 }}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0}
      useNativeDriver
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} activeOpacity={0.7} disabled={loading}>
            <Text style={styles.headerButton}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ajustar foto</Text>
          <TouchableOpacity onPress={handleCrop} activeOpacity={0.7} disabled={loading}>
            <Text style={[styles.headerButton, styles.confirmButton]}>
              {loading ? '...' : 'Confirmar'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <View style={[styles.overlayPanel, { top: 0, left: 0, right: 0, height: cropTop }]} />
          <View style={[styles.overlayPanel, { top: cropTop, left: 0, width: cropLeft, height: CROP_SIZE }]} />
          <View style={[styles.overlayPanel, { top: cropTop, right: 0, width: cropLeft, height: CROP_SIZE }]} />
          <View style={[styles.overlayPanel, { bottom: 0, left: 0, right: 0, top: cropTop + CROP_SIZE }]} />
          <View style={[styles.cropBorder, { top: cropTop, left: cropLeft, width: CROP_SIZE, height: CROP_SIZE }]} />
        </View>

        <View style={styles.imageArea}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  headerButton: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
  },
  confirmButton: {
    fontWeight: '700',
    color: '#3b82f6',
  },
  overlayPanel: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    zIndex: 5,
  },
  cropBorder: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 2,
    zIndex: 6,
  },
  imageArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
});
