'use client';

import { type ReactNode } from 'react';

interface PreviewFrameProps {
  children: ReactNode;
  /** Tailwind bg class for the frame chrome */
  frameBg?: string;
  /** Screen size simulation */
  variant?: 'desktop' | 'mobile';
  className?: string;
}

/** Scaled preview container — renders children at reduced scale inside a device frame */
export function PreviewFrame({ children, frameBg = 'bg-psl-midnight', variant = 'desktop', className = '' }: PreviewFrameProps) {
  const isDesktop = variant === 'desktop';
  return (
    <div
      className={`relative overflow-hidden rounded-card-sm ${frameBg} ${className}`}
      aria-hidden="true"
    >
      {/* Browser/device chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10">
        <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
        {isDesktop && (
          <span className="ml-2 flex-1 h-4 rounded-sm bg-white/10 max-w-[120px]" />
        )}
      </div>
      {/* Scaled content */}
      <div className="overflow-hidden" style={{ height: isDesktop ? '140px' : '160px' }}>
        <div
          style={{
            transform: isDesktop ? 'scale(0.36)' : 'scale(0.38)',
            transformOrigin: 'top left',
            width: isDesktop ? 'calc(100% / 0.36)' : 'calc(100% / 0.38)',
            height: isDesktop ? 'calc(140px / 0.36)' : 'calc(160px / 0.38)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Standalone mini-UIs for the showcase index ─────────────────── */

export function LeagueMatchdayPreview() {
  return (
    <div className="bg-psl-surface min-h-full font-sans">
      {/* Nav strip */}
      <div className="bg-psl-midnight px-6 py-3 flex items-center gap-4">
        <div className="w-6 h-6 rounded-full bg-psl-gold flex-shrink-0" />
        <div className="text-white font-black text-sm">FIFA World Cup 2026</div>
        <div className="ml-auto flex gap-4 text-white/50 text-xs">
          {['Matches','Table','Fantasy','Predict'].map(t => (
            <span key={t} className={t==='Matches' ? 'text-psl-gold border-b border-psl-gold pb-0.5' : ''}>{t}</span>
          ))}
        </div>
      </div>
      {/* Fixture rail */}
      <div className="px-6 py-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-psl-muted mb-3">Matchday 3 · Today</div>
        <div className="flex gap-3 overflow-hidden">
          {[
            { h: 'BRA', a: 'ARG', hs: 2, as: 1, live: true },
            { h: 'ENG', a: 'FRA', hs: null, as: null, live: false },
            { h: 'GER', a: 'ESP', hs: null, as: null, live: false },
          ].map((f, i) => (
            <div key={i} className={`flex-shrink-0 w-40 rounded-card-sm border p-3 ${f.live ? 'border-psl-live/30 bg-psl-live/5' : 'border-psl-border bg-white'}`}>
              {f.live && (
                <div className="flex items-center gap-1 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-psl-live" />
                  <span className="text-[10px] font-bold text-psl-live uppercase tracking-wide">Live · 67'</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-psl-navy">{f.h}</span>
                <span className="text-base font-black text-psl-navy">{f.hs !== null ? `${f.hs}–${f.as}` : 'vs'}</span>
                <span className="text-sm font-black text-psl-navy">{f.a}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Table snapshot */}
        <div className="mt-4 rounded-card-sm border border-psl-border bg-white overflow-hidden">
          <div className="px-4 py-2 bg-psl-navy">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">Group A</span>
          </div>
          {['BRA','FRA','ENG','ARG'].map((t, i) => (
            <div key={t} className={`flex items-center px-4 py-1.5 text-xs border-b border-gray-50 last:border-0 ${i===0?'bg-psl-green/5':''}`}>
              <span className="w-4 text-psl-muted font-mono">{i+1}</span>
              <span className="flex-1 font-semibold text-psl-navy ml-2">{t}</span>
              <span className="font-black text-psl-navy">{9-i*2}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PredictPreview() {
  return (
    <div className="bg-psl-surface min-h-full font-sans px-6 py-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-psl-muted mb-3">Matchday 3 · 3 of 8</div>
      {/* Main card */}
      <div className="rounded-card border border-psl-border bg-white shadow-card-md overflow-hidden">
        <div className="bg-psl-midnight p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-3">Group A · Lusail Stadium</div>
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-xl font-black text-white">Brazil</div>
              <div className="text-xs text-white/40">BRA</div>
            </div>
            <div className="text-center px-4">
              <div className="text-3xl font-black text-white/30">vs</div>
              <div className="text-[10px] text-psl-gold font-bold mt-1">Locks in 2h 14m</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-xl font-black text-white">Argentina</div>
              <div className="text-xs text-white/40">ARG</div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex gap-2 mb-3">
            <button className="flex-1 py-2 rounded-lg border-2 border-psl-navy bg-psl-navy text-white text-xs font-bold">Brazil</button>
            <button className="flex-1 py-2 rounded-lg border-2 border-gray-200 text-gray-500 text-xs font-bold">Draw</button>
            <button className="flex-1 py-2 rounded-lg border-2 border-gray-200 text-gray-500 text-xs font-bold">Argentina</button>
          </div>
          {/* Community bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-psl-muted">
              <span className="font-bold text-psl-navy">52%</span>
              <span>Draw 21%</span>
              <span className="font-bold text-psl-green">27%</span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden">
              <div className="bg-psl-navy" style={{width:'52%'}} />
              <div className="bg-psl-gold" style={{width:'21%'}} />
              <div className="bg-psl-green" style={{width:'27%'}} />
            </div>
            <div className="text-[10px] text-psl-muted text-center">4,218 fan predictions</div>
          </div>
        </div>
      </div>
      {/* Pagination dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {Array.from({length:8}).map((_,i)=>(
          <span key={i} className={`rounded-full transition-all ${i===2?'w-5 h-1.5 bg-psl-navy':'w-1.5 h-1.5 bg-gray-200'}`} />
        ))}
      </div>
    </div>
  );
}

export function FantasyPreview() {
  const pos = [
    { x: '50%', y: '12%', name: 'TBO', cap: false },
    { x: '20%', y: '32%', name: 'VVD', cap: false },
    { x: '50%', y: '32%', name: 'SLB', cap: false },
    { x: '80%', y: '32%', name: 'TAA', cap: false },
    { x: '25%', y: '54%', name: 'KDB', cap: true  },
    { x: '50%', y: '54%', name: 'GRZ', cap: false },
    { x: '75%', y: '54%', name: 'SLH', cap: false },
    { x: '35%', y: '76%', name: 'HKN', cap: false },
    { x: '65%', y: '76%', name: 'MBP', cap: false },
  ];
  return (
    <div className="bg-[#0f1117] min-h-full font-sans">
      {/* Header */}
      <div className="bg-[#141929] px-5 py-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Fantasy Command Centre</div>
          <div className="text-base font-black text-white">The Galacticos</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-psl-gold">847</div>
          <div className="text-[10px] text-white/40">total pts</div>
        </div>
      </div>
      {/* Pitch */}
      <div className="relative mx-4 mt-3 rounded-card-sm overflow-hidden" style={{height:'160px', background:'repeating-linear-gradient(180deg,#1a7a3e 0px,#1a7a3e 26px,#16703a 26px,#16703a 52px)'}}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-white/15" />
          <div className="absolute w-full h-px bg-white/15" />
        </div>
        {pos.map(p => (
          <div
            key={p.name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: p.x, top: p.y }}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-md relative ${p.cap ? 'bg-psl-navy' : 'bg-[#1b3a6b]/90'}`}>
              {p.name.slice(0,3)}
              {p.cap && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-psl-gold text-psl-navy text-[7px] font-black flex items-center justify-center">C</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccountPreview() {
  return (
    <div className="min-h-full font-sans flex">
      {/* Left dark panel */}
      <div className="bg-psl-midnight flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-4">My PSL One</div>
          <div className="text-lg font-black text-white leading-tight mb-1">Join the<br/>Fan Nation</div>
          <div className="text-[11px] text-white/50 leading-relaxed">Build your identity. Earn fan value. Follow your team.</div>
        </div>
        <div className="space-y-2">
          <div className="w-full h-8 rounded-lg bg-psl-gold/20 border border-psl-gold/30 flex items-center justify-center">
            <span className="text-[11px] font-bold text-psl-gold">Join Beta</span>
          </div>
          <div className="w-full h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-[11px] text-white/60">Sign In</span>
          </div>
        </div>
      </div>
      {/* Right light panel */}
      <div className="bg-psl-surface flex-1 p-5">
        {/* Fan identity card */}
        <div className="rounded-card-sm bg-gradient-to-br from-psl-navy to-[#163060] p-4 text-white mb-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Fan Identity</div>
          <div className="font-black text-sm mb-1">@super_bafana</div>
          <div className="text-[10px] text-white/50">Cape Town · South Africa</div>
          <div className="mt-3 flex items-center gap-3">
            <div className="text-right">
              <div className="text-xl font-black text-psl-gold">3,240</div>
              <div className="text-[9px] text-white/40">Fan Value</div>
            </div>
            <div className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-psl-gold rounded-full" style={{width:'67%'}} />
            </div>
          </div>
        </div>
        {/* Club */}
        <div className="text-[10px] font-bold uppercase tracking-wider text-psl-muted mb-2">Favourite Club</div>
        <div className="grid grid-cols-4 gap-1.5">
          {['MAN','CHE','ARS','LIV','TOT','MCI','NEW','BHA'].map((t,i) => (
            <div key={t} className={`rounded-lg p-1.5 flex flex-col items-center border ${i===0?'border-psl-navy bg-psl-navy/5':'border-transparent hover:border-gray-200'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-black ${i===0?'bg-psl-navy text-white':'bg-gray-100 text-gray-400'}`}>{t.slice(0,2)}</div>
              <span className="text-[8px] text-gray-400 mt-0.5 truncate w-full text-center">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
