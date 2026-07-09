const SUPABASE_URL = "여기에_Project_URL_입력";
const SUPABASE_KEY = "여기에_Publishable_Key_입력";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
