'use client';

import { ReactNode, useEffect, useState } from 'react';

export const ClientShell = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_55%),radial-gradient(circle_at_30%_70%,_rgba(248,113,113,0.35),_transparent_55%),radial-gradient(circle_at_75%_40%,_rgba(125,211,252,0.25),_transparent_55%)]" />
      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 py-16 transition-opacity duration-300">
        <div className="transform-gpu rounded-3xl border border-slate-800/60 bg-slate-900/70 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
          <div
            className={`rounded-3xl border border-slate-800/50 bg-slate-950/40 p-10 ${
              mounted ? 'opacity-100' : 'opacity-0'
            } transition-opacity duration-500`}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
