// src/app/api/views/route.ts
import { supabase } from '@/lib/supabase';
import { auth } from "@clerk/nextjs";

export async function GET() {
  const { userId } = auth();
  
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const { data, error } = await supabase
      .from('feed_views')
      .select(`
        *,
        feed_sources (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch views" }), {
      status: 500,
    });
  }
}