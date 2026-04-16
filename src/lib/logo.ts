export const LOGO_STORAGE_KEY = 'somnum_logo_custom';
export const DEFAULT_LOGO = '/images/somnum-logo.png';

export function getLogoSrc(): string {
  return localStorage.getItem(LOGO_STORAGE_KEY) || DEFAULT_LOGO;
}

export function setLogoSrc(src: string): void {
  localStorage.setItem(LOGO_STORAGE_KEY, src);
  window.dispatchEvent(new Event('somnum_logo_changed'));
}

export function resetLogo(): void {
  localStorage.removeItem(LOGO_STORAGE_KEY);
  window.dispatchEvent(new Event('somnum_logo_changed'));
}
