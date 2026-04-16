import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fsapkxbizettyqvkmafl.supabase.co';
const supabaseAnonKey = 'sb_publishable_e5NS3uSwe_xYB0RUgeSSHQ_H9J6_Kfz';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types base de données ────────────────────────────────────────────────────
export interface DbReponse {
  id: string;
  poste: string;
  questionnaire: string;
  date_prise_de_fonction: string | null;
  date_completion: string | null;
  referent: string | null;
  nom: string | null;
  prenom: string | null;
  notes: Array<{ questionId: string; valeur: number }>;
  ouvertes: Array<{ questionId: string; texte: string }>;
  created_at: string;
}

export interface DbConfig {
  id: number;
  config: unknown;
  updated_at: string;
}
