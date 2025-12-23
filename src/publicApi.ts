// src/publicApi.ts
export type ThemeArea = 'public' | 'admin';
export type ThemeMode = 'light' | 'dark';

export interface ThemeOptions {
  area: ThemeArea;
  mode?: ThemeMode;
  palette?: string; // only used for public (e.g. "blue-tones", "earth-tones")
}

type Stored = { mode: ThemeMode; palette?: string };
const STORAGE_KEY = (area: ThemeArea) => `theme:${area}`;

/** Detect system preference for dark mode. */
function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches === true
  );
}

/** Global defaults, aligned with your loader / palette file naming. */
const DEFAULT_PUBLIC_PALETTE: string = 'blue-tones';
const DEFAULT_MODE: ThemeMode = prefersDark() ? 'dark' : 'light';

function getStored(area: ThemeArea): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(area));
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

function store(area: ThemeArea, value: Stored): void {
  try {
    localStorage.setItem(STORAGE_KEY(area), JSON.stringify(value));
  } catch {
    /* ignore storage failures */
  }
}

function ensureLinkEl(): HTMLLinkElement | null {
  if (typeof document === 'undefined') return null;
  let link = document.getElementById('theme-loader') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = 'theme-loader';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  return link;
}

function getLoaderHref(args: {
  area: ThemeArea;
  mode: ThemeMode;
  palette: string;
}): string {
  const { area, mode, palette } = args;
  if (area === 'admin') {
    // matches: /themes/admin/loaders/{light|dark}-theme.loader.css
    return `/themes/admin/loaders/${mode}-theme.loader.css`;
  }
  // matches: /themes/public/loaders/{palette}-{light|dark}.loader.css
  return `/themes/public/loaders/${palette}-${mode}.loader.css`;
}

/** Read the currently effective theme (area, mode, palette) with sane defaults. */
export function getTheme(): Required<
  Pick<ThemeOptions, 'area' | 'mode'>
> & { palette?: string } {
  // Determine current area from <html data-theme-area>, else default 'public'
  const attrArea =
    (typeof document !== 'undefined' &&
      (document.documentElement.getAttribute(
        'data-theme-area',
      ) as ThemeArea | null)) || null;

  const area: ThemeArea = attrArea === 'admin' ? 'admin' : 'public';
  const stored = getStored(area);

  const mode: ThemeMode = stored?.mode ?? DEFAULT_MODE;

  const palette =
    area === 'public'
      ? stored?.palette ?? DEFAULT_PUBLIC_PALETTE
      : undefined;

  return { area, mode, palette };
}

/** Apply a theme (updates storage, sets data-* attrs, and swaps the loader <link>). */
export function setTheme(opts: ThemeOptions): void {
  if (typeof document === 'undefined') return;

  const current = getTheme();
  const area: ThemeArea = opts.area;

  // Merge with stored/current + defaults
  const mode: ThemeMode = opts.mode ?? current.mode ?? DEFAULT_MODE;

  const palette: string =
    area === 'public'
      ? opts.palette ?? current.palette ?? DEFAULT_PUBLIC_PALETTE
      : 'admin'; // dummy for href builder; not stored for admin

  // Persist (admin does not store a palette)
  if (area === 'public') store(area, { mode, palette });
  else store(area, { mode });

  // Swap loader href
  const href = getLoaderHref({ area, mode, palette });
  const link = ensureLinkEl();
  if (link) {
    const absolute = new URL(href, location.origin).href;
    if (link.href !== absolute) link.href = href;
  }

  // Expose for CSS hooks
  const root = document.documentElement;
  root.setAttribute('data-theme-area', area);
  root.setAttribute('data-theme-mode', mode);
  if (area === 'public') root.setAttribute('data-theme-palette', palette);
  else root.removeAttribute('data-theme-palette');
}

/* Auto-apply on startup from storage or system preference */
(function init() {
  if (typeof document === 'undefined') return;
  // If the page already marked an area on <html>, respect it; otherwise default public
  const htmlArea =
    (document.documentElement.getAttribute(
      'data-theme-area',
    ) as ThemeArea | null) || 'public';
  const stored = getStored(htmlArea);

  const initial: ThemeOptions =
    htmlArea === 'public'
      ? {
          area: 'public',
          mode: stored?.mode ?? DEFAULT_MODE,
          palette: stored?.palette ?? DEFAULT_PUBLIC_PALETTE,
        }
      : {
          area: 'admin',
          mode: stored?.mode ?? DEFAULT_MODE,
        };

  setTheme(initial);
})();
