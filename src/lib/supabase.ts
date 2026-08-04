import { createClient } from "@supabase/supabase-js";

// 服务端 Supabase 客户端（使用 service_role，绕过 RLS，仅用于后台/上传）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
