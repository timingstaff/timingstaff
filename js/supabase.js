// js/supabase.js

const SUPABASE_URL = "https://maffoogeihehrcdshxpf.supabase.co
";
const SUPABASE_KEY = "sb_publishable_MSOOTOXpdoaGgmaisPi-BQ_to1b9qh6
";

// 전역에서 사용할 Supabase 클라이언트 생성
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 다른 파일(js/attendance.js 등)에서 이 클라이언트를 불러와 쓸 수 있도록 내보냅니다.
export { supabaseClient };
