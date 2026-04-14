/**
 * db.ts — Toutes les opérations Supabase pour l'application.
 * Remplace complètement les fonctions localStorage de lib/index.ts.
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

/** Enregistre une nouvelle réponse dans Supabase */
export async function insertReponse(
  r: Omit<Reponse, 'id' | 'createdAt'>
): Promise<Reponse> {
  const { data, error } = await supabase
    .from('reponses')
    .insert({
      nom: r.nom || null,
      prenom: r.prenom || null,
      poste: r.poste,
      questionnaire: r.questionnaire,
      date_prise_de_fonction: r.datePriseDeFonction || null,
      date_completion: r.dateCompletion || null,
      referent: r.referent || null,
      notes: r.notes,
      ouvertes: r.ouvertes,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    nom: data.nom ?? '',
    prenom: data.prenom ?? '',
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

/** Récupère la configuration personnalisée des questionnaires */
export async function fetchConfig(): Promise<QuestionnaireConfig[]> {
  const { data, error } = await supabase
    .from('questionnaire_config')
    .select('config')
    .eq('id', 1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return DEFAULT_QUESTIONNAIRES.map((q) => JSON.parse(JSON.stringify(q)));
  return data.config as QuestionnaireConfig[];
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
