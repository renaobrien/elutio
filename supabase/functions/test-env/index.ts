import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const alchemyKey = Deno.env.get('ALCHEMY_API_KEY');
  
  return new Response(
    JSON.stringify({ 
      alchemyKeyExists: !!alchemyKey,
      alchemyKeyLength: alchemyKey?.length || 0,
      alchemyKeyPreview: alchemyKey ? alchemyKey.substring(0, 5) + '...' : 'null'
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
