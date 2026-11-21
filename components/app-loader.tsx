'use client';

import React from 'react';
import { EduVisionLogo } from './eduvision-logo';

interface AppLoaderProps {
  title?: string;
  subtitle?: string;
  statusMessage?: string;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  title = 'EduVision AI',
  subtitle = 'Universal Academic Learning Platform',
  statusMessage = 'Initializing learning workspace...'
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f8f9fa] overflow-hidden select-none animate-in fade-in duration-300">
      {/* Soft Ambient Radial Background Glow */}
      <div className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-teal-300/10 to-transparent blur-3xl pointer-events-none" />

      {/* Centerpiece Card */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 py-8 text-center">
        {/* Emblem with Breathing Ambient Aura */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-md animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-white border border-neutral-200/90 shadow-md flex items-center justify-center p-2.5 transition-transform">
            <EduVisionLogo size={40} />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-600 border-2 border-white" />
          </span>
        </div>

        {/* Brand Typography */}
        <h1 className="text-lg font-extrabold tracking-tight text-neutral-900 mb-1">
          {title}
        </h1>
        <p className="text-xs text-neutral-500 font-medium mb-5">
          {subtitle}
        </p>

        {/* Sleek Gradient Shimmer Progress Bar */}
        <div className="w-48 h-1.5 bg-neutral-200/80 rounded-full overflow-hidden relative shadow-inner mb-3">
          <div className="absolute inset-y-0 w-2/5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-full animate-progress-slide" />
        </div>

        {/* Status Message */}
        <p className="text-[11px] text-neutral-400 font-mono tracking-wide">
          {statusMessage}
        </p>
      </div>

      {/* Subtle Bottom System Badge */}
      <div className="absolute bottom-6 text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Multilingual NLP &bull; Vector Diagrams &bull; Speech &bull; Quizzes</span>
      </div>
    </div>
  );
};
