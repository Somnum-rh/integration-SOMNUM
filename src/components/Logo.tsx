import { useState, useEffect } from 'react';
import { getCachedLogo, fetchLogo } from '@/lib/logo';

interface LogoProps {
  height?: number;
  className?: string;
}

export default function Logo({ height = 48, className = '' }: LogoProps) {
  const [src, setSrc] = useState<string>(getCachedLogo());

  useEffect(() => {
    // Charger depuis Supabase au montage
    fetchLogo().then(setSrc).catch(() => {});

    // Écouter les changements depuis l'admin
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setSrc(detail);
    };
    window.addEventListener('somnum_logo_changed', handler);
    return () => window.removeEventListener('somnum_logo_changed', handler);
  }, []);

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={src}
        alt="SomNum - Centre de Médecine du Sommeil"
        style={{ height: `${height}px`, width: 'auto', objectFit: 'contain' }}
        onError={(e) => { (e.target as HTMLImageElement).src = '/images/somnum-logo.png'; }}
      />
    </div>
  );
}
