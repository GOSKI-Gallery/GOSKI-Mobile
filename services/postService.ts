import { supabase } from '../lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy'; 

const uploadPost = async (userId: string, imageUri: string, description: string) => {
  try {
    const fileName = `${userId}/${Date.now()}.jpg`;

    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64', 
    });

    const { data: storageData, error: storageError } = await supabase.storage
      .from('posts')
      .upload(fileName, decode(base64), {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (storageError) throw storageError;

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(fileName);

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        description: description,
        image_url: publicUrl,
        moderation_status: 'pending',
        is_nsfw: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    console.error('Erro no postService:', error);
    throw error;
  }
};
export default uploadPost;