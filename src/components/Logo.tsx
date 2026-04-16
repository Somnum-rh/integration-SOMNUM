import { useState, useEffect } from 'react';
import { getLogoSrc, LOGO_STORAGE_KEY } from '@/lib/logo';

interface LogoProps {
  height?: number;
  className?: string;
}

export default function Logo({ height = 48, className = '' }: LogoProps) {
  const [src, setSrc] = useState<string>(getLogoSrc());

  useEffect(() => {
    const handler = () => setSrc(getLogoSrc());
    window.addEventListener('somnum_logo_changed', handler);
    window.addEventListener('storage', (e) => {
      if (e.key === LOGO_STORAGE_KEY) handler();
    });
    return () => {
      window.removeEventListener('somnum_logo_changed', handler);
    };
  }, []);

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={src}
        alt="SomNum - Centre de Médecine du Sommeil"
        style={{ height: `${height}px`, width: 'auto', objectFit: 'contain' }}
      />
    </div>
  );
}
