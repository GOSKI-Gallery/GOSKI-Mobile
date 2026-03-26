import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

export const useLike = (postId: number, initialLiked: boolean, userId: string) => {
  const [isLiked, setIsLiked] = useState(initialLiked);

  const toggleLike = async () => {
    const previousState = isLiked;
    setIsLiked(!previousState);

    try {
      if (previousState) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ user_id: userId, post_id: postId });

        if (error) throw error;
      } 
      
      else {
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: userId, post_id: postId });

        if (error) throw error;
      }
    } 
    
    catch (error: any) {
      setIsLiked(previousState);
      Alert.alert("Erro", "Não foi possível processar o seu like.");
      console.error(error.message);
    }
  };

  return { isLiked, toggleLike };
};