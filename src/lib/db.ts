/**
 * db.ts — Toutes les opérations Supabase pour l'application.
 */
import { supabase } from './supabase';
import { DEFAULT_QUESTIONNAIRES, type QuestionnaireConfig, type Reponse } from './index';

// ─── RÉPONSES ─────────────────────────────────────────────────────────────────

/** Récupère toutes les réponses depuis Supabase, triées par date décroissante */
export async function fetchReponses(): Promise<Reponse[]> {
  const { data, error } = await supabase
    .from('reponses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    nom: row.nom ?? '',
    prenom: row.prenom ?? '',
    poste: row.poste,
    questionnaire: row.questionnaire,
    datePriseDeFonction: row.date_prise_de_fonction ?? '',
    dateCompletion: row.date_completion ?? '',
    referent: row.referent ?? '',
    notes: row.notes ?? [],
    ouvertes: row.ouvertes ?? [],
    createdAt: row.created_at,
  }));
}

/** Enregistre une nouvelle réponse dans Supabase.
 *  Tente d'abord avec nom/prénom. Si la colonne n'existe pas encore,
 *  retente sans pour ne pas bloquer la soumission.
 */
export async function insertReponse(
  r: Omit<Reponse, 'id' | 'createdAt'>
): Promise<Reponse> {
  // Tentative principale avec nom + prenom
  const payload: Record<string, unknown> = {
    poste: r.poste,
    questionnaire: r.questionnaire,
    date_prise_de_fonction: r.datePriseDeFonction || null,
    date_completion: r.dateCompletion || null,
    referent: r.referent || null,
    notes: r.notes,
    ouvertes: r.ouvertes,
    nom: r.nom || null,
    prenom: r.prenom || null,
  };

  let { data, error } = await supabase
    .from('reponses')
    .insert(payload)
    .select()
    .single();

  // Fallback : si la colonne nom/prenom n'existe pas encore, on réessaie sans
  if (error && (error.message.includes('nom') || error.message.includes('prenom') || error.code === '42703')) {
    const fallback: Record<string, unknown> = { ...payload };
    delete fallback.nom;
    delete fallback.prenom;
    const res2 = await supabase.from('reponses').insert(fallback).select().single();
    data = res2.data;
    error = res2.error;
  }

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    nom: data.nom ?? r.nom ?? '',
    prenom: data.prenom ?? r.prenom ?? '',
    poste: data.poste,
    questionnaire: data.questionnaire,
    datePriseDeFonction: data.date_prise_de_fonction ?? '',
    dateCompletion: data.date_completion ?? '',
    referent: data.referent ?? '',
    notes: data.notes ?? [],
    ouvertes: data.ouvertes ?? [],
    createdAt: data.created_at,
  };
}

/** Supprime une réponse par son ID */
export async function removeReponse(id: string): Promise<void> {
  const { error } = await supabase.from('reponses').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Exporte toutes les réponses en CSV */
export async function exportCSVFromDb(): Promise<string> {
  const reponses = await fetchReponses();
  if (reponses.length === 0) return '';

  const configs = await fetchConfig();
  const allNoteIds = configs.flatMap((q) =>
    q.domaines.flatMap((d) => d.questionsNotes.map((n) => n.id))
  );

  const header = [
    'ID', 'Nom', 'Prénom', 'Poste', 'Questionnaire', 'Date prise de fonction',
    'Date complétion', 'Référent', ...allNoteIds, 'Créé le',
  ].join(';');

  const rows = reponses.map((r) => {
    const noteMap = Object.fromEntries(r.notes.map((n) => [n.questionId, n.valeur]));
    return [
      r.id, r.nom, r.prenom, r.poste, r.questionnaire,
      r.datePriseDeFonction, r.dateCompletion, r.referent,
      ...allNoteIds.map((id) => noteMap[id] ?? ''),
      r.createdAt,
    ].join(';');
  });

  return [header, ...rows].join('\n');
}

// ─── CONFIG QUESTIONNAIRES ────────────────────────────────────────────────────

/** Récupère la configuration personnalisée des questionnaires.
 *  Si la config stockée contient les anciens types ('1 mois', '3 mois', '6 mois'),
 *  elle est ignorée et remplacée par la config par défaut actuelle.
 */
export async function fetchConfig(): Promise<QuestionnaireConfig[]> {
  const { data, error } = await supabase
    .from('questionnaire_config')
    .select('config')
    .eq('id', 1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return DEFAULT_QUESTIONNAIRES.map((q) => JSON.parse(JSON.stringify(q)));

  // Vérifier que la config stockée utilise les bons types
  const stored = data.config as QuestionnaireConfig[];
  const VALID_TYPES = DEFAULT_QUESTIONNAIRES.map(q => q.type);
  const isValid = Array.isArray(stored) &&
    stored.length > 0 &&
    stored.every(c => VALID_TYPES.includes(c.type as typeof VALID_TYPES[number]));

  if (!isValid) {
    // Config obsolète → on retourne la config par défaut (sans écraser Supabase pour ne pas bloquer)
    return DEFAULT_QUESTIONNAIRES.map((q) => JSON.parse(JSON.stringify(q)));
  }

  return stored;
}

/** Sauvegarde la configuration personnalisée */
export async function upsertConfig(configs: QuestionnaireConfig[]): Promise<void> {
  const { error } = await supabase
    .from('questionnaire_config')
    .upsert({ id: 1, config: configs, updated_at: new Date().toISOString() });

  if (error) throw new Error(error.message);
}

/** Réinitialise la configuration aux valeurs par défaut */
export async function resetConfig(): Promise<void> {
  const { error } = await supabase
    .from('questionnaire_config')
    .delete()
    .eq('id', 1);
  if (error) throw new Error(error.message);
}
