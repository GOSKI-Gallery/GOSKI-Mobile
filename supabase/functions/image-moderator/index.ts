import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ImageAnnotatorClient } from "npm:@google-cloud/vision"

serve(async (req) => {
  try {
    const body = await req.json()
    const record = body.record
    
    if (!record) throw new Error("Nenhum registro encontrado no webhook")

    const postId = record.id
    const imageUrl = record.image_url

    const googleCredentials = JSON.parse(Deno.env.get('GOOGLE_APPLICATION_CREDENTIALS') || '{}')
    const privateKey = googleCredentials.private_key.replace(/\\n/g, '\n')

    const visionClient = new ImageAnnotatorClient({
      credentials: {
        client_email: googleCredentials.client_email,
        private_key: privateKey,
      },
      projectId: googleCredentials.project_id,
      fallback: true, 
    });

    console.log(`Analisando Post ${postId}: ${imageUrl}`);
    
    const visionPromise = visionClient.annotateImage({
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: 'SAFE_SEARCH_DETECTION' },
        { type: 'LABEL_DETECTION', maxResults: 5 } 
      ],
    });

    const [result] = await Promise.race([
      visionPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout de 20s no Google')), 20000))
    ]) as any;

    const safe = result.safeSearchAnnotation || result.safe_search_annotation
    const labels = result.labelAnnotations || result.label_annotations || []

    if (!safe) throw new Error("Google Vision não retornou dados de SafeSearch.")

    const isUnsafe = 
      safe.adult === 'LIKELY' || safe.adult === 'VERY_LIKELY' ||
      safe.violence === 'LIKELY' || safe.violence === 'VERY_LIKELY';

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const status = isUnsafe ? 'rejected' : 'approved';

    await supabaseAdmin
      .from('posts')
      .update({ 
        moderation_status: status,
        is_nsfw: isUnsafe 
      })
      .eq('id', postId)

    if (!isUnsafe && labels.length > 0) {
      for (const label of labels) {
        const tagName = label.description.toLowerCase().trim();
        const confidence = label.score; 

        const { data: tagData } = await supabaseAdmin
          .from('tags')
          .upsert({ name: tagName }, { onConflict: 'name' })
          .select('id')
          .single();

        if (tagData) {
          await supabaseAdmin
            .from('post_tag')
            .insert({
              post_id: postId,
              tag_id: tagData.id,
              confidence: confidence
            });
        }
      }
    }

    console.log(`Post ${postId} moderado: ${status}`);

    return new Response(JSON.stringify({ status: "success" }), { 
      headers: { "Content-Type": "application/json" } 
    })

  } catch (error: any) {
    console.error("ERRO:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})