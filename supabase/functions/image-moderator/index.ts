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
    const filePath = imageUrl.split('/posts/')[1];

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
        { type: 'LABEL_DETECTION', maxResults: 10 }
      ],
    });

    const [result] = await Promise.race([
      visionPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout de 20s no Google')), 20000))
    ]) as any;

    const safe = result.safeSearchAnnotation || result.safe_search_annotation
    const labels = result.labelAnnotations || result.label_annotations || []

    if (!safe) throw new Error("Google Vision não retornou dados de SafeSearch.")

    const severityScore: Record<string, number> = {
      'VERY_UNLIKELY': 1,
      'UNLIKELY': 2,
      'POSSIBLE': 3,
      'LIKELY': 4,
      'VERY_LIKELY': 5,
    };

    const categories = ['adult', 'violence', 'racy', 'medical'];
    let maxScore = 0;
    let moderationStatus = 'UNKNOWN';

    for (const category of categories) {
      const value = safe[category];
      if (value && severityScore[value] !== undefined) {
        const score = severityScore[value];
        if (score > maxScore) {
          maxScore = score;
          moderationStatus = value;
        }
      }
    }

    const isExplicit = maxScore >= 4;

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { db: { schema: 'laravel' } }
    )

    if (labels.length > 0) {
      const now = new Date().toISOString();

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
            .upsert(
              {
                post_id: postId,
                tag_id: tagData.id,
                confidence: confidence,
                created_at: now,
                updated_at: now,
              },
              { onConflict: 'post_id,tag_id' }
            );
        }
      }
    }

    await supabaseAdmin
      .from('posts')
      .update({ moderation_status: moderationStatus, is_nsfw: isExplicit })
      .eq('id', postId)

    if (isExplicit) {
      console.log(`[!] Conteúdo explícito detectado no Post ${postId} (${moderationStatus}). Removendo imagem...`);

      if (filePath) {
        const { error: storageError } = await supabaseAdmin
          .storage
          .from('posts')
          .remove([filePath]);
        
        if (storageError) console.error("Erro ao deletar arquivo do Storage:", storageError.message);
      }

      return new Response(JSON.stringify({ status: "rejected", moderation_status: moderationStatus }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (moderationStatus === 'POSSIBLE') {
      console.log(`[?] Conteúdo POSSIBLE no Post ${postId}. Encaminhando para revisão manual.`);

      return new Response(JSON.stringify({ status: "pending_review", moderation_status: moderationStatus }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log(`Post ${postId} moderado: ${moderationStatus}`);

    return new Response(JSON.stringify({ status: "success", moderation_status: moderationStatus }), { 
      headers: { "Content-Type": "application/json" } 
    })

  } catch (error: any) {
    console.error("ERRO:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
