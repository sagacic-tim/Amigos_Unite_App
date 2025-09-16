// src/components/ThemeSwitcher.tsx
import { useEffect, useState } from 'react';
import { getTheme, setTheme } from '../publicApi';

type Props = { area?: 'public' | 'admin' };

export function ThemeSwitcher({ area }: Props) {
  const initial = getTheme();
  const [currentArea, setCurrentArea] = useState<'public' | 'admin'>(area ?? initial.area);
  const [palette, setPalette] = useState(initial.palette);
  const [mode, setMode] = useState<'light' | 'dark'>(initial.mode);

  useEffect(() => {
    setTheme({ area: currentArea, palette, mode });
  }, [currentArea, palette, mode]);

  return (
    <div className="theme-switcher" style={{ display: 'inline-flex', gap: 8 }}>
      {!area && (
        <select
          className="user-menu__select"
          aria-label="Area"
          value={currentArea}
          onChange={(e) => setCurrentArea(e.target.value as 'public' | 'admin')}
        >
          <option value="public">Public</option>
          <option value="admin">Admin</option>
        </select>
      )}

      {currentArea === 'public' && (
        <select
          aria-label="Palette"
          value={palette}
          onChange={(e) => setPalette(e.target.value)}
        >
          <option value="blue">Blue</option>
          <option value="earth-tones">Earth Tones</option>
        </select>
      )}

      <button className="button__secondary" type="button" aria-pressed={mode === 'light'} onClick={() => setMode('light')}>
        Light
      </button>
      <button className="button__secondary" type="button" aria-pressed={mode === 'dark'} onClick={() => setMode('dark')}>
        Dark
      </button>
    </div>
  );
}
