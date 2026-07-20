import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface PushPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

serve(async (req) => {
  try {
    const body: PushPayload = await req.json();
    const { userId, title, body: messageBody, data } = body;

    if (!userId || !title || !messageBody) {
      return new Response(
        JSON.stringify({ error: "userId, title e body são obrigatórios" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { db: { schema: "laravel" } }
    );

    const { data: tokens, error: tokenError } = await supabaseClient
      .from("push_tokens")
      .select("token")
      .eq("user_id", userId);

    if (tokenError) {
      console.error("Erro ao buscar tokens:", tokenError.message);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar tokens" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: "Usuário sem push tokens registrados" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const messages = tokens.map((t: { token: string }) => ({
      to: t.token,
      sound: "default",
      title,
      body: messageBody,
      data: data || {},
    }));

    const pushResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const pushResult = await pushResponse.json();

    return new Response(
      JSON.stringify({ success: true, pushResult }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Erro no push-notify:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
