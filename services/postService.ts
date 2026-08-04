import { supabase, ensureProfile } from '../lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

export interface PostLocation {
  latitude: number;
  longitude: number;
  location_name?: string | null;
}

const uploadPost = async (
  userId: string,
  imageUri: string,
  description: string,
  location?: PostLocation
) => {
  try {
    const fileName = `${userId}/${Date.now()}.jpg`;

    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    const { data: storageData, error: storageError } = await supabase.storage
      .from('posts')
      .upload(fileName, decode(base64), {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (storageError) throw storageError;

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(fileName);

    const now = new Date().toISOString();

    await ensureProfile(userId);

    const insertPayload: Record<string, unknown> = {
      user_id: userId,
      description: description,
      image_url: publicUrl,
      created_at: now,
      updated_at: now,
    };

    if (location) {
      insertPayload.latitude = location.latitude;
      insertPayload.longitude = location.longitude;
      if (location.location_name) {
        insertPayload.location_name = location.location_name;
      }
    }

    const { data, error } = await supabase
      .from('posts')
      .insert(insertPayload as any)
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