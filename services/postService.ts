import { supabase, ensureProfile } from '../lib/supabase';
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

    const now = new Date().toISOString();

    await ensureProfile(userId);

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        description: description,
        image_url: publicUrl,
        moderation_status: 'POSSIBLE',
        is_nsfw: false,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger the image-moderator edge function so the post gets classified
    // and moderated. This guarantees moderation runs for mobile-created posts
    // even when the database webhook is not configured to fire for them.
    try {
      await supabase.functions.invoke('image-moderator', {
        body: { record: { id: data.id, image_url: data.image_url } },
      });
    } catch (modErr) {
      console.warn('[uploadPost] Falha ao acionar image-moderator:', modErr);
    }

    return data;

  } catch (error) {
    console.error('Erro no postService:', error);
    throw error;
  }
};
export default uploadPost;