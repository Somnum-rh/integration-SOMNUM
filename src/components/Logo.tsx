interface LogoProps {
  height?: number;
  showSubtitle?: boolean;
  className?: string;
}

export default function Logo({ height = 48, showSubtitle = false, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/images/somnum-logo.png"
        alt="SomNum - Centre de Médecine du Sommeil"
        style={{ height: `${height}px`, width: 'auto', objectFit: 'contain' }}
      />
    </div>
  );
}
