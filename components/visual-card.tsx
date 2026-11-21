'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Maximize2,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X
} from 'lucide-react';

interface VisualCardProps {
  visualData: {
    type?: string;
    title?: string;
    caption?: string;
    svg?: string;
  };
}

export const VisualCard: React.FC<VisualCardProps> = ({ visualData }) => {
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  if (!visualData || !visualData.svg) return null;

  const getCleanSvgString = () => {
    let cleanSvg = visualData.svg || '';
    // Normalize any uppercase XML entities
    cleanSvg = cleanSvg.replace(/&AMP;/g, '&amp;');
    cleanSvg = cleanSvg.replace(/&LT;/g, '&lt;');
    cleanSvg = cleanSvg.replace(/&GT;/g, '&gt;');
    cleanSvg = cleanSvg.replace(/&QUOT;/g, '&quot;');
    cleanSvg = cleanSvg.replace(/&APOS;/g, '&apos;');
    // Replace any remaining bare ampersands not in XML entities
    cleanSvg = cleanSvg.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
    // Prepend XML declaration if not present
    if (!cleanSvg.trim().startsWith('<?xml')) {
      cleanSvg = '<?xml version="1.0" encoding="UTF-8"?>\n' + cleanSvg;
    }
    return cleanSvg;
  };

  const downloadSvg = () => {
    try {
      const cleanSvg = getCleanSvgString();
      const blob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const sanitizedTitle = (visualData.title || 'eduvision-diagram')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .toLowerCase();
      a.download = `${sanitizedTitle}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download SVG:', err);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZoomModalOpen) {
        setIsZoomModalOpen(false);
      }
    };
    if (isZoomModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomModalOpen]);

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomScale(1);

  return (
    <>
      <div className="my-4 border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-xs transition-all hover:border-emerald-400">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-neutral-100/80 border-b border-neutral-200">
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 truncate">
              {visualData.title || 'Concept Illustration'}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                setZoomScale(1);
                setIsZoomModalOpen(true);
              }}
              title="Open Interactive Zoom Viewer"
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Zoom</span>
            </button>
            <button
              onClick={downloadSvg}
              title="Download Valid SVG Graphic"
              className="p-1.5 text-neutral-600 hover:text-emerald-700 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">SVG</span>
            </button>
          </div>
        </div>

        {/* Diagram container - zero ugly scrollbars on mobile */}
        <div
          onClick={() => {
            setZoomScale(1);
            setIsZoomModalOpen(true);
          }}
          className="p-2 sm:p-4 bg-neutral-50/50 flex items-center justify-center cursor-zoom-in max-w-full overflow-x-auto min-w-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          title="Click to zoom and inspect diagram"
        >
          <div
            className="w-full max-w-[740px] transition-all flex justify-center"
            dangerouslySetInnerHTML={{ __html: visualData.svg }}
          />
        </div>

        {visualData.caption && (
          <div className="px-3 sm:px-4 py-2 bg-neutral-100/60 border-t border-neutral-200 text-xs text-neutral-600 flex flex-wrap items-center justify-between gap-1">
            <span className="line-clamp-2">{visualData.caption}</span>
            <span className="text-[11px] text-emerald-700 font-semibold shrink-0">
              EduVision Vector Engine
            </span>
          </div>
        )}
      </div>

      {/* Interactive Lightbox / Zoom Modal */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Modal Header Controls */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800 text-white shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold truncate">
                {visualData.title || 'Concept Diagram'}
              </span>
              <span className="hidden sm:inline text-[11px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
                Interactive Viewer
              </span>
            </div>

            {/* Action buttons: Zoom in, out, reset, download, close */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={handleZoomOut}
                disabled={zoomScale <= 0.75}
                title="Zoom Out (-)"
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 disabled:opacity-40 transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-neutral-300 w-12 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoomScale >= 3}
                title="Zoom In (+)"
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 disabled:opacity-40 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                title="Reset Zoom (100%)"
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={downloadSvg}
                title="Download SVG"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors ml-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save SVG</span>
              </button>
              <button
                onClick={() => setIsZoomModalOpen(false)}
                title="Close Viewer (Esc)"
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-600 text-neutral-300 hover:text-white transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Diagram Canvas with Pan & Zoom */}
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsZoomModalOpen(false);
            }}
            className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center cursor-default"
          >
            <div
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease-out'
              }}
              className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl max-w-4xl w-full min-w-[300px]"
              dangerouslySetInnerHTML={{ __html: visualData.svg }}
            />
          </div>

          {/* Modal Footer Caption */}
          {visualData.caption && (
            <div className="px-4 py-2.5 bg-neutral-900 border-t border-neutral-800 text-neutral-300 text-xs text-center shrink-0">
              {visualData.caption}
            </div>
          )}
        </div>
      )}
    </>
  );
};
