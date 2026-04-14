/**
 * Logo SomNum — reproduction SVG haute fidélité
 * "som" : Montserrat Bold #5D4288
 * "Num" : Dancing Script Bold #944988
 * Sous-titre : Montserrat Regular #BDB0B8
 * Cercles + arc : #C391B3
 */
export default function SomNumLogo({
  className = '',
  height = 56,
  showSubtitle = true,
}: {
  className?: string;
  height?: number;
  showSubtitle?: boolean;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={showSubtitle ? '0 0 260 90' : '0 0 260 65'}
      height={height}
      className={className}
      aria-label="SomNum — Centre de Médecine du Sommeil"
      style={{ fontFamily: "'Poppins', 'Montserrat', sans-serif" }}
    >
      <defs>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Montserrat:wght@400;700&display=swap');
        `}</style>
      </defs>

      {/* ── Cercles décoratifs ───────────────────────────────── */}
      {/* Très petit cercle, haut gauche au-dessus du "s" */}
      <circle cx="26" cy="10" r="3" fill="#C391B3" />
      {/* Petit cercle creux sous le "s" */}
      <circle cx="19" cy="32" r="5" fill="none" stroke="#D8C9D3" strokeWidth="1.5" />
      {/* Grand cercle plein entre "som" et "Num" */}
      <circle cx="98" cy="40" r="5.5" fill="#C391B3" />
      {/* Petit cercle plein, bas gauche */}
      <circle cx="30" cy="48" r="2.5" fill="#C391B3" />

      {/* ── Arc fluide sous "som Num" ─────────────────────────── */}
      {/* Courbe de Bézier douce traversant le logo */}
      <path
        d="M 18 54 C 40 64, 70 58, 98 56 C 126 54, 170 62, 220 52"
        fill="none"
        stroke="#C391B3"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* ── Texte "som" — Montserrat Bold, violet foncé ─────── */}
      <text
        x="30"
        y="44"
        fontFamily="'Montserrat', 'Poppins', sans-serif"
        fontWeight="700"
        fontSize="30"
        fill="#5D4288"
        letterSpacing="-0.5"
      >
        som
      </text>

      {/* ── Texte "Num" — Dancing Script Bold, violet rosé ──── */}
      {/* Décalé vers le bas et la droite par rapport à "som" */}
      <text
        x="105"
        y="52"
        fontFamily="'Dancing Script', cursive"
        fontWeight="700"
        fontSize="32"
        fill="#944988"
      >
        Num
      </text>

      {/* ── Sous-titre — uniquement si showSubtitle ───────────── */}
      {showSubtitle && (
        <text
          x="130"
          y="76"
          fontFamily="'Montserrat', 'Poppins', sans-serif"
          fontWeight="400"
          fontSize="8.5"
          fill="#BDB0B8"
          textAnchor="middle"
          letterSpacing="0.3"
        >
          Centre de Médecine du Sommeil
        </text>
      )}
    </svg>
  );
}
