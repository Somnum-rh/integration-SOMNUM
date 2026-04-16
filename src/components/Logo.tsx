/**
 * Logo SomNum — composant SVG inline
 * "som" : Poppins Bold gris foncé (#374151)
 * "Num" : Dancing Script Bold bleu marine (#1e3a5f)
 * Sous-titre optionnel : "Centre de Médecine du Sommeil"
 */
export default function Logo({
  height = 56,
  showSubtitle = false,
  className = '',
}: {
  height?: number;
  showSubtitle?: boolean;
  className?: string;
}) {
  const viewH = showSubtitle ? 90 : 65;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 260 ${viewH}`}
      height={height}
      className={className}
      aria-label="SomNum — Centre de Médecine du Sommeil"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <defs>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Poppins:wght@400;600;700&display=swap');
        `}</style>
      </defs>

      {/* ── Éléments décoratifs ───────────────────────────────── */}
      <circle cx="26" cy="10" r="3" fill="#1e3a5f" opacity="0.4" />
      <circle cx="19" cy="32" r="5" fill="none" stroke="#1e3a5f" strokeWidth="1.5" opacity="0.3" />
      <circle cx="98" cy="40" r="5.5" fill="#1e3a5f" opacity="0.5" />
      <circle cx="30" cy="48" r="2.5" fill="#1e3a5f" opacity="0.4" />

      {/* ── Arc fluide sous "somNum" ──────────────────────────── */}
      <path
        d="M 18 54 C 40 64, 70 58, 98 56 C 126 54, 170 62, 220 52"
        fill="none"
        stroke="#1e3a5f"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.35"
      />

      {/* ── Texte "som" — Poppins Bold, gris foncé ───────────── */}
      <text
        x="30"
        y="44"
        fontFamily="'Poppins', sans-serif"
        fontWeight="700"
        fontSize="30"
        fill="#374151"
        letterSpacing="-0.5"
      >
        som
      </text>

      {/* ── Texte "Num" — Dancing Script Bold, bleu marine ───── */}
      <text
        x="105"
        y="52"
        fontFamily="'Dancing Script', cursive"
        fontWeight="700"
        fontSize="32"
        fill="#1e3a5f"
      >
        Num
      </text>

      {/* ── Sous-titre optionnel ─────────────────────────────── */}
      {showSubtitle && (
        <text
          x="130"
          y="76"
          fontFamily="'Poppins', sans-serif"
          fontWeight="400"
          fontSize="8.5"
          fill="#6B7280"
          textAnchor="middle"
          letterSpacing="0.4"
        >
          Centre de Médecine du Sommeil
        </text>
      )}
    </svg>
  );
}
