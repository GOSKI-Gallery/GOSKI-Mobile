import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// A biblioteca da Google Cloud para Deno
import { ImageAnnotatorClient } from "npm:@google-cloud/vision"

serve(async (req) => {
  try {
    const { record } = await req.json() // O Webhook do banco envia o dado aqui
    
    // pegar a URL da imagem 
    // mandar pro Vision AI
    // tabela de posts
    
    return new Response(JSON.stringify({ message: "Processado com sucesso!" }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})