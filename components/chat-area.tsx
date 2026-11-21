'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  GraduationCap,
  ArrowRight,
  Pencil,
  Sparkles,
  Layers
} from 'lucide-react';
import { VisualCard } from './visual-card';
import { EduVisionLogo } from './eduvision-logo';

export interface Message {
  _id?: string;
  sender: 'user' | 'assistant';
  content: string;
  visualData?: any;
  audioData?: string;
  language?: string;
  createdAt?: string;
}

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSelectPrompt: (prompt: string, lang: string) => void;
  onTriggerQuiz: (topic: string) => void;
  onEditPrompt?: (text: string) => void;
}

const THINKING_PHASES = [
  'Analyzing academic query & identifying core axioms...',
  'Structuring pedagogical steps & real-world analogies...',
  'Formulating multilingual explanation & vector diagram...',
  'Verifying curriculum rigor & scientific accuracy...'
];

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSelectPrompt,
  onTriggerQuiz,
  onEditPrompt
}) => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [thinkingPhaseIdx, setThinkingPhaseIdx] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isSpeakingCancelledRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Rotate thought phases and track timer when loading
  useEffect(() => {
    if (!isLoading) {
      setThinkingPhaseIdx(0);
      setElapsedSeconds(0);
      return;
    }

    const phaseInterval = setInterval(() => {
      setThinkingPhaseIdx(prev => (prev + 1) % THINKING_PHASES.length);
    }, 2400);

    const timerInterval = setInterval(() => {
      setElapsedSeconds(prev => +(prev + 0.1).toFixed(1));
    }, 100);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(timerInterval);
    };
  }, [isLoading]);

  // Clean Markdown & format text for full natural speech
  const cleanMarkdownForSpeech = (rawText: string): string => {
    let clean = rawText || '';
    // Strip code blocks and inline code
    clean = clean.replace(/```[\s\S]*?```/g, ' Code block omitted. ');
    clean = clean.replace(/`[^`]+`/g, ' ');
    // Strip LaTeX math blocks and inline formulas
    clean = clean.replace(/\$\$[\s\S]*?\$\$/g, ' Formula omitted. ');
    clean = clean.replace(/\$[^\$]*?\$/g, ' ');
    // Strip markdown formatting symbols (#, *, _, [, ], (, ), >, <, ~)
    clean = clean.replace(/[#\*_\`\[\]\(\)\-\>\<\:\~]/g, ' ');
    // Normalize extra whitespace
    clean = clean.replace(/\s+/g, ' ').trim();
    return clean;
  };

  // Full-Text Audio Playback: Never cuts off info
  const handlePlayTTS = (msgIndex: number, audioData?: string, rawText?: string) => {
    const id = `audio_${msgIndex}`;

    // If currently playing, stop completely
    if (playingAudioId === id) {
      isSpeakingCancelledRef.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingAudioId(null);
      return;
    }

    // Stop any existing speech
    isSpeakingCancelledRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const cleanText = cleanMarkdownForSpeech(rawText || '');

    // Priority 1: If browser SpeechSynthesis is available, use sentence-chunked sequential player
    // This guarantees Chrome never stops after 15 seconds and reads 100% of the explanation!
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && cleanText) {
      setPlayingAudioId(id);

      // Split into sentence chunks
      const sentences = cleanText.match(/[^.!?\n]+[.!?\n]+/g) || [cleanText];
      let currentSentenceIdx = 0;

      const speakNextSentence = () => {
        if (isSpeakingCancelledRef.current) {
          setPlayingAudioId(null);
          return;
        }

        if (currentSentenceIdx >= sentences.length) {
          setPlayingAudioId(null);
          return;
        }

        const sentence = sentences[currentSentenceIdx].trim();
        if (!sentence) {
          currentSentenceIdx++;
          speakNextSentence();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          if (!isSpeakingCancelledRef.current) {
            currentSentenceIdx++;
            speakNextSentence();
          }
        };

        utterance.onerror = (e) => {
          console.warn('SpeechSynthesis sentence error:', e);
          if (!isSpeakingCancelledRef.current) {
            currentSentenceIdx++;
            speakNextSentence();
          }
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNextSentence();
    } else if (audioData) {
      // Fallback: If browser speech is unavailable, play backend audio file
      const audio = new Audio(audioData);
      audioRef.current = audio;
      audio.onended = () => setPlayingAudioId(null);
      audio.onerror = () => setPlayingAudioId(null);
      audio.play().catch(e => {
        console.warn('Audio play failed:', e);
        setPlayingAudioId(null);
      });
      setPlayingAudioId(id);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const extractTopic = (content: string): string => {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('###')) {
        return line.replace(/###/g, '').replace(/[:?]/g, '').trim() || 'Academic Topic';
      }
    }
    return 'Academic Topic';
  };

  const starterPrompts = [
    {
      title: 'Computer Architecture',
      desc: 'Von Neumann model: CPU (ALU/CU), RAM & IPOS cycle',
      query: 'Explain Computer Architecture and the Von Neumann model with diagram',
      lang: 'en'
    },
    {
      title: 'Neural Networks & Deep Learning',
      desc: 'Perceptron, weights, biases, ReLU & backpropagation',
      query: 'Explain Neural Networks and Backpropagation with diagram',
      lang: 'en'
    },
    {
      title: 'Calculus & Derivatives',
      desc: 'Rate of change, tangent slopes, limit definition & power rule',
      query: 'Explain Calculus Derivatives with formula and diagram in simple words',
      lang: 'en'
    },
    {
      title: 'Photosynthesis Solar Cycle',
      desc: 'Leaf chloroplast light reactions & Calvin cycle',
      query: 'Explain Photosynthesis with a diagram in Hinglish',
      lang: 'hinglish'
    }
  ];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-2.5 sm:px-4 md:px-8 py-3 sm:py-5 bg-[#f7f7f8] min-w-0 max-w-full">
      {/* Empty State / Welcome Screen */}
      {messages.length === 0 ? (
        <div className="min-h-[70vh] flex flex-col items-center justify-center max-w-2xl mx-auto text-center py-4 sm:py-8 animate-in fade-in duration-300 px-2 min-w-0 w-full">
          {/* Logo with Zero Sparkles */}
          <EduVisionLogo size={56} className="mb-4" />

          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-neutral-900 mb-2 tracking-tight">
            What would you like to learn today?
          </h2>
          <p className="text-neutral-600 text-xs sm:text-sm mb-6 sm:mb-8 max-w-md px-2">
            Ask any academic concept across computer science, mathematics, physics, biology, or engineering. Get visual diagrams, audio explanations, and instant quizzes.
          </p>

          {/* Clean Starter Prompt Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full text-left min-w-0">
            {starterPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPrompt(p.query, p.lang)}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-emerald-400 hover:shadow-xs transition-all flex items-center justify-between group min-w-0 shadow-2xs"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors truncate">
                    {p.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-500 line-clamp-1 mt-0.5">
                    {p.desc}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Message Stream */
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-6 min-w-0 w-full">
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            const msgId = msg._id || `msg_${index}`;

            return (
              <div
                key={msgId}
                className={`group flex gap-2 sm:gap-3 md:gap-4 animate-in fade-in duration-200 w-full min-w-0 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 border border-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <EduVisionLogo size={18} />
                  </div>
                )}

                <div
                  className={`flex flex-col min-w-0 max-w-[94%] sm:max-w-[88%] md:max-w-[85%] rounded-2xl shadow-xs overflow-hidden ${
                    isUser
                      ? 'bg-emerald-600 text-white px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-tr-xs'
                      : 'bg-white text-neutral-900 p-3.5 sm:p-5 md:p-6 border border-neutral-200'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-neutral-100 min-w-0">
                      <span className="text-xs font-bold text-emerald-700 truncate">
                        EduVision Academic Tutor
                      </span>
                      {msg.language && (
                        <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-200 font-semibold uppercase shrink-0">
                          {msg.language}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Markdown Content - High Contrast & Fully Responsive */}
                  <div
                    className={`leading-relaxed break-words [overflow-wrap:anywhere] min-w-0 max-w-full ${
                      isUser
                        ? 'text-white text-xs sm:text-sm font-medium'
                        : 'prose prose-neutral prose-sm max-w-none text-neutral-800 prose-headings:font-bold prose-headings:text-neutral-900 prose-h3:text-sm sm:prose-h3:text-base prose-h3:mb-2 prose-h4:text-xs sm:prose-h4:text-sm prose-h4:text-neutral-800 prose-p:text-neutral-700 prose-p:leading-relaxed text-xs sm:text-sm'
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        pre: ({ node, ...props }) => (
                          <div className="my-2.5 max-w-full overflow-x-auto rounded-xl bg-neutral-900 p-3 text-neutral-100 text-xs font-mono border border-neutral-800 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            <pre {...props} />
                          </div>
                        ),
                        code: ({ node, inline, ...props }: any) =>
                          inline ? (
                            <code
                              className="bg-neutral-100 text-emerald-800 px-1.5 py-0.5 rounded text-[11px] font-mono border border-neutral-200 font-semibold"
                              {...props}
                            />
                          ) : (
                            <code {...props} />
                          ),
                        table: ({ node, ...props }) => (
                          <div className="my-2.5 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            <table
                              className="min-w-full border-collapse border border-neutral-200 text-xs"
                              {...props}
                            />
                          </div>
                        )
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Render Visual Concept Diagram Card */}
                  {!isUser && msg.visualData && (
                    <div className="min-w-0 max-w-full overflow-hidden">
                      <VisualCard visualData={msg.visualData} />
                    </div>
                  )}

                  {/* User message edit prompt button */}
                  {isUser && onEditPrompt && (
                    <div className="flex justify-end mt-1.5 pt-1 border-t border-emerald-500/30">
                      <button
                        onClick={() => onEditPrompt(msg.content)}
                        title="Edit question in search bar"
                        className="flex items-center gap-1 text-[11px] text-emerald-100 hover:text-white transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  )}

                  {/* Assistant Footer Action Buttons — Reads Full Info */}
                  {!isUser && (
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 pt-2.5 border-t border-neutral-100">
                      <button
                        onClick={() => handlePlayTTS(index, msg.audioData, msg.content)}
                        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs transition-all font-medium ${
                          playingAudioId === `audio_${index}`
                            ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/40'
                            : 'bg-neutral-100 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200 border border-neutral-200'
                        }`}
                        title={
                          playingAudioId === `audio_${index}`
                            ? 'Stop Reading Full Information'
                            : 'Listen to Full Explanation (Speech Synthesis)'
                        }
                      >
                        {playingAudioId === `audio_${index}` ? (
                          <>
                            <div className="flex items-center gap-0.5 h-3">
                              <span className="w-0.5 bg-white rounded-full animate-wave-1"></span>
                              <span className="w-0.5 bg-white rounded-full animate-wave-2"></span>
                              <span className="w-0.5 bg-white rounded-full animate-wave-3"></span>
                            </div>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Listen (TTS)</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(msgId, msg.content)}
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs bg-neutral-100 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200 border border-neutral-200 transition-colors font-medium"
                        title="Copy to clipboard"
                      >
                        {copiedId === msgId ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          const detected = extractTopic(msg.content);
                          onTriggerQuiz(detected);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors font-bold sm:ml-auto shadow-xs"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Practice Quiz</span>
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* ULTRA-PROFESSIONAL ACADEMIC REASONING LOADER */}
          {isLoading && (
            <div className="flex gap-2.5 sm:gap-3.5 animate-in fade-in duration-300 min-w-0 w-full max-w-[94%] sm:max-w-[88%]">
              {/* Glowing Orbital Avatar */}
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm animate-glow">
                <EduVisionLogo size={18} />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>

              {/* Shimmering Cognitive Canvas Card */}
              <div className="bg-white/95 backdrop-blur-xs border border-emerald-500/25 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 flex-1 min-w-0">
                {/* Status Bar with Neural Wave Equalizer & Timer */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Animated Neural Wave Equalizer */}
                    <div className="flex items-center gap-0.5 h-3.5 px-1 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                      <span className="w-0.5 bg-emerald-600 rounded-full animate-wave-1"></span>
                      <span className="w-0.5 bg-emerald-600 rounded-full animate-wave-2"></span>
                      <span className="w-0.5 bg-emerald-600 rounded-full animate-wave-3"></span>
                      <span className="w-0.5 bg-emerald-600 rounded-full animate-wave-2"></span>
                    </div>
                    <span className="text-xs font-semibold text-neutral-800 truncate transition-all duration-300">
                      {THINKING_PHASES[thinkingPhaseIdx]}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full shrink-0 border border-emerald-200/60">
                    {elapsedSeconds}s
                  </span>
                </div>

                {/* Multi-tier Structured Shimmer Skeleton */}
                <div className="space-y-2.5">
                  {/* Title Bar Skeleton with continuous fluid shimmer */}
                  <div className="h-3.5 bg-neutral-200/80 rounded-full w-2/5 animate-shimmer"></div>
                  {/* Paragraph Lines with staggered widths */}
                  <div className="h-2.5 bg-neutral-100 rounded-full w-full animate-shimmer"></div>
                  <div className="h-2.5 bg-neutral-100 rounded-full w-11/12 animate-shimmer"></div>
                  <div className="h-2.5 bg-neutral-100 rounded-full w-4/5 animate-shimmer"></div>
                </div>

                {/* Laser-scanned Vector Blueprint Wireframe */}
                <div className="relative mt-2 h-16 rounded-xl border border-dashed border-emerald-300/80 bg-gradient-to-r from-emerald-50/40 via-teal-50/20 to-emerald-50/40 flex items-center justify-between px-4 overflow-hidden">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 z-10">
                    <Layers className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Synthesizing interactive concept diagram blueprint...</span>
                  </div>
                  <div className="text-[10px] text-emerald-700/80 font-mono font-bold bg-white/80 px-2 py-0.5 rounded border border-emerald-200 z-10">
                    SVG Vector Engine
                  </div>

                  {/* Scanning Laser Line */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-scan-line pointer-events-none"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};
