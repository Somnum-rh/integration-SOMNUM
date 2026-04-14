import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types base de données ────────────────────────────────────────────────────
export interface DbReponse {
  id: string;
  poste: string;
  questionnaire: string;
  date_prise_de_fonction: string | null;
  date_completion: string | null;
  referent: string | null;
  notes: Array<{ questionId: string; valeur: number }>;
  ouvertes: Array<{ questionId: string; texte: string }>;
  created_at: string;
}

export interface DbConfig {
  id: number;
  config: unknown;
  updated_at: string;
}
