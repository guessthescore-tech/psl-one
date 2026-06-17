'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { type SeasonPresentationMode, ALL_MODES, MODE_LABELS } from '@/lib/season-presentation-state';

export type ViewportPreview = 'desktop' | 'tablet' | 'mobile';
export type DataState = 'real' | 'loading' | 'empty' | 'error';
export type ThemeMode = 'light' | 'dark';

export interface DesignLabContext {
  seasonMode: SeasonPresentationMode;
  setSeasonMode: (m: SeasonPresentationMode) => void;
  viewport: ViewportPreview;
  setViewport: (v: ViewportPreview) => void;
  dataState: DataState;
  setDataState: (s: DataState) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
}

const Ctx = createContext<DesignLabContext | null>(null);

export function useDesignLab(): DesignLabContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDesignLab must be used inside DesignLabProvider');
  return ctx;
}

const VIEWPORT_WIDTHS: Record<ViewportPreview, string> = {
  desktop: 'max-w-[1440px]',
  tablet:  'max-w-[1024px]',
  mobile:  'max-w-[390px]',
};

export function DesignLabProvider({
  children,
  defaultMode = 'IN_SEASON',
}: {
  children: ReactNode;
  defaultMode?: SeasonPresentationMode;
}) {
  const [seasonMode, setSeasonMode] = useState<SeasonPresentationMode>(defaultMode);
  const [viewport, setViewport]     = useState<ViewportPreview>('desktop');
  const [dataState, setDataState]   = useState<DataState>('real');
  const [theme, setTheme]           = useState<ThemeMode>('light');

  return (
    <Ctx.Provider value={{ seasonMode, setSeasonMode, viewport, setViewport, dataState, setDataState, theme, setTheme }}>
      {/* Toolbar */}
      <div className="sticky top-0 z-[100] bg-psl-dark border-b border-white/10 text-white text-xs">
        <div className="mx-auto max-w-7xl px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* Brand */}
          <Link href="/design-lab" className="font-black text-psl-gold shrink-0 text-sm">
            PSL One Design Lab
          </Link>

          <span className="text-white/20">|</span>

          {/* Viewport */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-white/50 mr-1">View</span>
            {(['desktop', 'tablet', 'mobile'] as ViewportPreview[]).map(v => (
              <button
                key={v}
                onClick={() => setViewport(v)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  viewport === v
                    ? 'bg-psl-gold text-psl-navy'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          <span className="text-white/20">|</span>

          {/* Season mode */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-white/50 mr-1">Mode</span>
            <select
              value={seasonMode}
              onChange={e => setSeasonMode(e.target.value as SeasonPresentationMode)}
              className="bg-white/10 text-white text-xs px-2 py-0.5 rounded border border-white/20 focus:outline-none"
            >
              {ALL_MODES.map(m => (
                <option key={m} value={m}>{MODE_LABELS[m]}</option>
              ))}
            </select>
          </div>

          <span className="text-white/20">|</span>

          {/* Theme */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-white/50 mr-1">Theme</span>
            {(['light', 'dark'] as ThemeMode[]).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  theme === t ? 'bg-psl-gold text-psl-navy' : 'text-white/60 hover:text-white'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <span className="text-white/20">|</span>

          {/* Data state */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-white/50 mr-1">Data</span>
            {(['real', 'loading', 'empty', 'error'] as DataState[]).map(s => (
              <button
                key={s}
                onClick={() => setDataState(s)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  dataState === s ? 'bg-psl-gold text-psl-navy' : 'text-white/60 hover:text-white'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <span className="ml-auto text-white/30 text-[10px] shrink-0">
            DESIGN_LAB · {new Date().getFullYear()}
          </span>
        </div>
      </div>

      {/* Content wrapper with viewport constraint */}
      <div className={`${VIEWPORT_WIDTHS[viewport]} mx-auto transition-all duration-200`}>
        {children}
      </div>
    </Ctx.Provider>
  );
}
