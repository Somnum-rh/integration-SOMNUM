/**
 * Logo SomNum — reproduction SVG fidèle
 * Couleurs : violet foncé #4D3A74 / violet vif #8D4A92 / lilas #C6A4D0
 */
export default function SomNumLogo({ className = '', height = 48 }: { className?: string; height?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 70"
      height={height}
      className={className}
      aria-label="SomNum"
    >
      {/* ── Cercles décoratifs (bulles) ── */}
      {/* Grand cercle plein en bas-gauche */}
      <circle cx="14" cy="50" r="10" fill="#C6A4D0" opacity="0.7" />
      {/* Cercle moyen contour */}
      <circle cx="22" cy="28" r="7" fill="none" stroke="#C6A4D0" strokeWidth="2" />
      {/* Petit cercle plein en haut */}
      <circle cx="10" cy="16" r="4" fill="#C6A4D0" />

      {/* ── Arc / ligne fluide sous le texte ── */}
      <path
        d="M 8 58 Q 60 72 148 54"
        fill="none"
        stroke="#C6A4D0"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* ── Texte "som" (sans-serif arrondi, violet foncé) ── */}
      <text
        x="34"
        y="36"
        fontFamily="'Poppins', 'Nunito', 'Segoe UI', sans-serif"
        fontWeight="600"
        fontSize="24"
        fill="#4D3A74"
        letterSpacing="0.5"
      >
        som
      </text>

      {/* ── Texte "Num" (script/italic, violet vif) ── */}
      <text
        x="46"
        y="57"
        fontFamily="'Dancing Script', 'Pacifico', cursive"
        fontWeight="700"
        fontSize="26"
        fill="#8D4A92"
        fontStyle="italic"
        letterSpacing="0.5"
      >
        Num
      </text>
    </svg>
  );
}
