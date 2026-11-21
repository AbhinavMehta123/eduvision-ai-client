'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, MicOff, Globe } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string, language: string) => void;
  isLoading: boolean;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  draftMessage?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  selectedLanguage,
  onLanguageChange,
  draftMessage = ''
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync draft message when user clicks "Edit" on a prompt
  useEffect(() => {
    if (draftMessage) {
      setInput(draftMessage);
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
      }
    }
  }, [draftMessage]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        if (selectedLanguage === 'hi') {
          recognition.lang = 'hi-IN';
        } else if (selectedLanguage === 'es') {
          recognition.lang = 'es-ES';
        } else {
          recognition.lang = 'en-US';
        }

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          setInput(transcript);
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim(), selectedLanguage);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.overflowY = 'hidden';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      const newHeight = Math.min(scrollH, 140);
      textareaRef.current.style.height = `${newHeight}px`;
      // Strictly prevent scrollbars on mobile unless text is exceptionally long (> 140px)
      textareaRef.current.style.overflowY = scrollH > 140 ? 'auto' : 'hidden';
    }
  };

  const languages = [
    { code: 'en', label: 'English', badge: 'EN' },
    { code: 'hi', label: 'हिन्दी', badge: 'HI' },
    { code: 'hinglish', label: 'Hinglish', badge: 'HING' },
    { code: 'es', label: 'Español', badge: 'ES' }
  ];

  const currentLangObj = languages.find(l => l.code === selectedLanguage) || languages[0];

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 pb-2 sm:pb-3 shrink-0">
      {/* Active Voice Wave Banner */}
      {isListening && (
        <div className="mb-2 p-2 sm:p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 h-5 sm:h-6">
              <span className="w-1 bg-emerald-600 rounded-full animate-wave-1"></span>
              <span className="w-1 bg-emerald-600 rounded-full animate-wave-2"></span>
              <span className="w-1 bg-emerald-600 rounded-full animate-wave-3"></span>
              <span className="w-1 bg-emerald-600 rounded-full animate-wave-2"></span>
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-emerald-800">
              Listening in {currentLangObj.label}... Speak your academic question.
            </span>
          </div>
          <button
            onClick={toggleListening}
            className="text-[11px] sm:text-xs text-neutral-600 hover:text-neutral-900 font-medium underline"
          >
            Stop
          </button>
        </div>
      )}

      {/* Input Box - Zero Scrollbars on Mobile, High Contrast Visible Text */}
      <div className="relative flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-neutral-300 shadow-md transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={`Ask EduVision AI in ${currentLangObj.label} (e.g. 'Photosynthesis diagram')...`}
          rows={1}
          style={{
            overflowY: 'hidden',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          className="w-full pt-2.5 sm:pt-3 pb-1.5 px-3.5 sm:px-5 bg-transparent text-neutral-900 placeholder-neutral-500 text-xs sm:text-sm font-medium focus:outline-none resize-none leading-relaxed max-h-[140px] [&::-webkit-scrollbar]:hidden"
        />

        <div className="flex items-center justify-between px-2.5 sm:px-3 pb-2 pt-0.5">
          {/* Left tools: Language selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLanguages(!showLanguages)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-800 font-medium border border-neutral-200 transition-colors shadow-2xs"
            >
              <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-600 shrink-0" />
              <span className="font-bold text-[9px] sm:text-[10px] bg-white px-1 sm:px-1.5 py-0.2 rounded border border-neutral-300 text-neutral-800">
                {currentLangObj.badge}
              </span>
              <span className="hidden xs:inline text-[11px] sm:text-xs text-neutral-700">
                {currentLangObj.label}
              </span>
            </button>

            {showLanguages && (
              <div className="absolute bottom-10 left-0 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 z-50 min-w-[140px]">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setShowLanguages(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                      selectedLanguage === lang.code
                        ? 'text-emerald-700 font-semibold bg-emerald-50/50'
                        : 'text-neutral-700'
                    }`}
                  >
                    <span>{lang.label}</span>
                    <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-1 rounded">
                      {lang.badge}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right tools: Voice mic & Send button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? 'Stop Listening' : 'Voice Input (Speak question)'}
              className={`p-1.5 sm:p-2 rounded-full transition-all ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              {isListening ? (
                <MicOff className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              ) : (
                <Mic className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-600" />
              )}
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`p-1.5 sm:p-2 rounded-full transition-all ${
                input.trim() && !isLoading
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <ArrowUp className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Clean subtle footer without sparkles */}
      <div className="text-center mt-1.5 text-[10px] sm:text-[11px] text-neutral-500 font-medium">
        EduVision AI — Universal Academic Visual Learning Platform
      </div>
    </div>
  );
};
