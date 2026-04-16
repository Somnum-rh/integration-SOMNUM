import { supabase } from './supabase';

export const DEFAULT_LOGO = '/images/somnum-logo.png';
export const LOGO_CACHE_KEY = 'somnum_logo_cache';

/** Récupère le logo depuis Supabase (avec fallback localStorage puis défaut) */
export async function fetchLogo(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'logo')
      .maybeSingle();

    if (error || !data) return localStorage.getItem(LOGO_CACHE_KEY) || DEFAULT_LOGO;

    const src = data.value as string;
    // Mettre en cache local pour affichage instantané au prochain chargement
    localStorage.setItem(LOGO_CACHE_KEY, src);
    return src;
  } catch {
    return localStorage.getItem(LOGO_CACHE_KEY) || DEFAULT_LOGO;
  }
}

/** Sauvegarde le logo dans Supabase (visible par tous) */
export async function saveLogo(base64: string): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: 'logo', value: base64, updated_at: new Date().toISOString() });

  if (error) throw new Error(error.message);

  // Mise à jour cache local + signal aux composants
  localStorage.setItem(LOGO_CACHE_KEY, base64);
  window.dispatchEvent(new CustomEvent('somnum_logo_changed', { detail: base64 }));
}

/** Réinitialise le logo par défaut dans Supabase */
export async function resetLogo(): Promise<void> {
  await supabase.from('app_settings').delete().eq('key', 'logo');
  localStorage.removeItem(LOGO_CACHE_KEY);
  window.dispatchEvent(new CustomEvent('somnum_logo_changed', { detail: DEFAULT_LOGO }));
}

/** Retourne immédiatement le logo en cache (pour l'affichage initial) */
export function getCachedLogo(): string {
  return localStorage.getItem(LOGO_CACHE_KEY) || DEFAULT_LOGO;
}
