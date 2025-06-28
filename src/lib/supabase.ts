import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente Supabase para uso no frontend (com chave anônima)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente Supabase para uso no backend (com chave de serviço)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Tipos para as tabelas do banco de dados
export interface AnalysisSession {
  id: string;
  user_id: string;
  created_at: string;
  final_synthesis?: string;
}

export interface UserResponse {
  id: string;
  session_id: string;
  question_index: number;
  question_text?: string;
  transcript_text?: string;
  audio_file_drive_id: string;
  created_at: string;
}

