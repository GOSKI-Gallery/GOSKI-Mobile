import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import uploadPost from '../../services/postService';
import { useAuthStore } from '../../states/useAuthStore';


interface CreatePostModalProps {
    visible: boolean;
    onClose: () => void;
}

const { height } = Dimensions.get('window');

const CreatePostModal = ({ visible, onClose }: CreatePostModalProps) => {
    const [image, setImage] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const userId = useAuthStore((state) => state.user?.id);

    const handlePublish = async () => {
        if (!image || !description || !userId) return;

        setLoading(true);
        try {
            await uploadPost(userId, image, description);
            
            Alert.alert(
                "Enviado!", 
                "Sua publicação está sendo analisada pela nossa IA e aparecerá no feed em breve.",
                [{ text: "OK", onPress: () => {
                    setImage(null);
                    setDescription('');
                    onClose();
                }}]
            );
        } catch (error: any) {
            Alert.alert("Erro ao publicar", error.message || "Ocorreu um erro inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onSwipeComplete={onClose}
            swipeDirection="down"
            style={{ margin: 0, justifyContent: 'flex-end' }}
            backdropOpacity={0.2}
        >
            <View className="flex-1 justify-end">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View
                        className="bg-white rounded-t-[35px] p-6 items-center shadow-2xl"
                        style={{ height: height * 0.8, borderTopWidth: 1, borderTopColor: '#f4f4f5' }}
                    >
                        <View className="w-10 h-1.5 bg-zinc-200 rounded-full mb-6" />

                        <Text className="text-zinc-900 text-xl font-bold mb-6">
                            Nova Publicação
                        </Text>

                        <TouchableOpacity
                            onPress={handlePickImage}
                            className="w-full aspect-square bg-zinc-50 rounded-3xl border border-dashed border-zinc-200 items-center justify-center overflow-hidden"
                        >
                            {image ? (
                                <Image source={{ uri: image }} className="w-full h-full" />
                            ) : (
                                <View className="items-center">
                                    <MaterialCommunityIcons name="image-plus" size={48} color="#a1a1aa" />
                                    <Text className="text-zinc-400 mt-2 font-medium">Escolher foto</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TextInput
                            className="w-full text-zinc-800 p-4 bg-zinc-50 rounded-2xl mt-6 h-28 border border-zinc-100"
                            placeholder="Escreva uma legenda..."
                            placeholderTextColor="#a1a1aa"
                            multiline
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />

                        <TouchableOpacity
                            className={`w-full p-4 rounded-2xl mt-auto flex-row justify-center items-center ${
                                !image || !description || loading || !userId ? 'bg-zinc-100' : 'bg-[#1000FF]'
                            }`}
                            onPress={handlePublish}
                            disabled={!image || !description || loading || !userId}
                        >
                            {loading ? (
                                <ActivityIndicator color="#1000FF" />
                            ) : (
                                <Text className={`font-bold text-lg ${!image || !description || !userId ? 'text-zinc-400' : 'text-white'}`}>
                                    Postar
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};
export default CreatePostModal;