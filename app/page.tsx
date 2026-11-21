'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, ChatSession } from '@/components/sidebar';
import { ChatArea, Message } from '@/components/chat-area';
import { ChatInput } from '@/components/chat-input';
import { QuizModal } from '@/components/quiz-modal';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { GraduationCap, Menu } from 'lucide-react';
import { EduVisionLogo } from '@/components/eduvision-logo';
import { AppLoader } from '@/components/app-loader';

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hinglish');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState('');

  // Quiz Modal State
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizTopic, setQuizTopic] = useState('Computer Architecture');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  // Strict Authentication Guard
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Load chat sessions on mount if authenticated
  useEffect(() => {
    if (!isAuthLoading && user) {
      loadSessions();
      if (user.preferredLanguage) {
        setSelectedLanguage(user.preferredLanguage);
      }
    }
  }, [user, isAuthLoading]);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K for New Chat
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedLanguage]);

  const loadSessions = async () => {
    try {
      const res = await api.get('/chat/sessions');
      if (res.data?.success && res.data.sessions) {
        setSessions(res.data.sessions);
        if (res.data.sessions.length > 0 && !activeSessionId) {
          loadSessionMessages(res.data.sessions[0]._id);
        }
      }
    } catch (err) {
      console.warn('Could not load sessions:', err);
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    try {
      const res = await api.get(`/chat/sessions/${sessionId}`);
      if (res.data?.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.warn('Could not load session messages:', err);
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await api.post('/chat/sessions', {
        title: 'New Learning Session',
        subject: 'General Academic',
        language: selectedLanguage
      });
      if (res.data?.success) {
        const newSession = res.data.session;
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession._id);
        setMessages([]);
      }
    } catch (err) {
      console.warn('Could not create new session:', err);
      const localId = 'ses_' + Date.now();
      const localSession: ChatSession = {
        _id: localId,
        title: 'New Learning Session',
        updatedAt: new Date().toISOString()
      };
      setSessions(prev => [localSession, ...prev]);
      setActiveSessionId(localId);
      setMessages([]);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      if (activeSessionId === sessionId) {
        const remaining = sessions.filter(s => s._id !== sessionId);
        if (remaining.length > 0) {
          loadSessionMessages(remaining[0]._id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.warn('Delete session error:', err);
    }
  };

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      await api.patch(`/chat/sessions/${sessionId}`, { title: newTitle });
      setSessions(prev =>
        prev.map(s => (s._id === sessionId ? { ...s, title: newTitle } : s))
      );
    } catch (err) {
      console.warn('Could not rename session in API:', err);
      setSessions(prev =>
        prev.map(s => (s._id === sessionId ? { ...s, title: newTitle } : s))
      );
    }
  };

  const handleSendMessage = async (content: string, language: string) => {
    let currentSessionId = activeSessionId;

    if (!currentSessionId) {
      try {
        const res = await api.post('/chat/sessions', {
          title: content.slice(0, 30),
          language
        });
        currentSessionId = res.data.session._id;
        setActiveSessionId(currentSessionId);
        setSessions(prev => [res.data.session, ...prev]);
      } catch (err) {
        currentSessionId = 'ses_' + Date.now();
        setActiveSessionId(currentSessionId);
      }
    }

    const userMsg: Message = {
      sender: 'user',
      content,
      language,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.post(`/chat/sessions/${currentSessionId}/messages`, {
        content,
        language,
        includeAudio: true
      });

      if (res.data?.success && res.data.assistantMessage) {
        setMessages(prev => [...prev, res.data.assistantMessage]);
        loadSessions();
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      const errorAssistantMsg: Message = {
        sender: 'assistant',
        content: `### Academic Explanation Notice\n\nWe received your question: **"${content}"**.\n\nPlease verify that the Python Flask microservice (port 8000) and Node.js gateway (port 5000) are running.`,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorAssistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerQuiz = async (topic: string) => {
    setQuizTopic(topic);
    setIsQuizLoading(true);
    try {
      const res = await api.post('/quiz/generate', {
        topic,
        count: 4,
        sessionId: activeSessionId
      });
      if (res.data?.success && res.data.quiz) {
        setQuizQuestions(res.data.quiz.questions);
        setIsQuizOpen(true);
      }
    } catch (err) {
      console.warn('Quiz generation error:', err);
      setQuizQuestions([
        {
          questionText: `What is the primary governing principle of ${topic}?`,
          options: [
            `Standard scientific and logical laws of ${topic}`,
            `${topic} operates without any rules or structure`,
            `${topic} has no practical significance`,
            'None of the above'
          ],
          correctOptionIndex: 0,
          explanation: `Systematic comprehension of ${topic} strengthens conceptual retention.`
        },
        {
          questionText: `Which approach is most effective when studying ${topic}?`,
          options: [
            'Blind memorization',
            'Interactive concept diagrams and structured quizzes',
            'Skipping all practice questions',
            'Ignoring real-world examples'
          ],
          correctOptionIndex: 1,
          explanation: 'Multimodal visual learning with immediate practice yields the highest academic retention.'
        }
      ]);
      setIsQuizOpen(true);
    } finally {
      setIsQuizLoading(false);
    }
  };

  // Professional Natural Auth Loading State
  if (isAuthLoading) {
    return (
      <AppLoader
        title="EduVision AI"
        subtitle="Universal Academic Learning Platform"
        statusMessage="Connecting to academic intelligence..."
      />
    );
  }

  // If unauthenticated, redirecting to /login
  if (!user) {
    return (
      <AppLoader
        title="EduVision AI"
        subtitle="Universal Academic Learning Platform"
        statusMessage="Redirecting to student sign in..."
      />
    );
  }

  const currentSession = sessions.find(s => s._id === activeSessionId);

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-[#f7f7f8]">
      {/* Sidebar with Mobile Drawer support */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={loadSessionMessages}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Window */}
      <main className="flex-1 flex flex-col h-full min-w-0 max-w-full overflow-hidden relative bg-[#f7f7f8]">
        {/* Top Header Horizontal Bar — Theme-matched (#f7f7f8) with clean borders */}
        <header className="h-14 border-b border-[#e5e7eb] px-3 sm:px-6 flex items-center justify-between bg-white shrink-0 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors shrink-0"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0 truncate">
              <h2 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                {currentSession?.title || 'New Learning Session'}
              </h2>
              <span className="hidden sm:inline-flex items-center text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-200 font-semibold whitespace-nowrap shrink-0">
                Multilingual Visual Mode
              </span>
            </div>
          </div>

          {/* Clean Take Quiz Button — NO Question Mark icon */}
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              onClick={() =>
                handleTriggerQuiz(currentSession?.title || 'Computer Science')
              }
              disabled={isQuizLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{isQuizLoading ? 'Generating...' : 'Take Quiz'}</span>
            </button>
          </div>
        </header>

        {/* Message Feed Area */}
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          onSelectPrompt={(query, lang) => {
            setSelectedLanguage(lang);
            handleSendMessage(query, lang);
          }}
          onTriggerQuiz={handleTriggerQuiz}
          onEditPrompt={(text) => setDraftPrompt(text)}
        />

        {/* Anchored Bottom Input Container — Always 100% visible on mobile viewports */}
        <div className="shrink-0 w-full bg-[#f7f7f8] z-20">
          <ChatInput
            onSendMessage={(content, lang) => {
              setDraftPrompt('');
              handleSendMessage(content, lang);
            }}
            isLoading={isLoading}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            draftMessage={draftPrompt}
          />
        </div>

        {/* Interactive Practice Quiz Modal */}
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          topic={quizTopic}
          questions={quizQuestions}
          sessionId={activeSessionId || undefined}
        />
      </main>
    </div>
  );
}
