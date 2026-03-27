import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ImageAnnotatorClient } from "npm:@google-cloud/vision"

serve(async (req) => {
  try {
    const body = await req.json()
    console.log("Recebido via Webhook:", JSON.stringify(body))

    const record = body.record
    if (!record) throw new Error("O 'record' veio vazio. Verifique o Webhook.")

    const postId = record.id
    const imageUrl = record.image_url
    
    const googleCredentials = JSON.parse(Deno.env.get('GOOGLE_APPLICATION_CREDENTIALS') || '{}')

    const visionClient = new ImageAnnotatorClient({
      credentials: {
        client_email: googleCredentials.client_email,
        private_key: googleCredentials.private_key,
      },
      projectId: googleCredentials.project_id,
    })

    console.log(`Analisando imagem: ${imageUrl}`)

    const [result] = await visionClient.annotateImage({
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: 'SAFE_SEARCH_DETECTION' },
        { type: 'LABEL_DETECTION', maxResults: 3 }
      ],
    })

    // Corrigindo o acesso aos dados (SafeSearch pode vir dentro de result)
    const safe = result.safeSearchAnnotation
    if (!safe) throw new Error("Google Vision não retornou SafeSearchAnnotation")

    const isUnsafe = 
      safe.adult === 'LIKELY' || safe.adult === 'VERY_LIKELY' ||
      safe.violence === 'LIKELY' || safe.violence === 'VERY_LIKELY' ||
      safe.racy === 'VERY_LIKELY'

    console.log(`Resultado moderação: ${isUnsafe ? 'REJEITADO' : 'APROVADO'}`)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const status = isUnsafe ? 'rejected' : 'approved'

    // TENTATIVA DE UPDATE COM LOG DE ERRO
    const { error: updateError } = await supabaseAdmin
      .from('posts')
      .update({ moderation_status: status })
      .eq('id', postId)

    if (updateError) {
      console.error("Erro ao atualizar banco:", updateError)
      throw updateError
    }

    console.log(`Post ${postId} atualizado com sucesso para ${status}!`)
    return new Response(JSON.stringify({ status: "success", moderation: status }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    })

  } catch (error) {
    console.error("ERRO CRÍTICO NA FUNCTION:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})