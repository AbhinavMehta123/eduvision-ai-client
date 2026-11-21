'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SquarePen,
  MessageSquare,
  Trash2,
  Pencil,
  Check,
  BarChart3,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  BookOpen,
  Search,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { EduVisionLogo } from './eduvision-logo';

export interface ChatSession {
  _id: string;
  title: string;
  subject?: string;
  updatedAt: string;
}

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession?: (id: string, newTitle: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const isTeacherView = pathname.includes('/teacher');
  const isAdminOrTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const handleSelectSession = (id: string) => {
    onSelectSession(id);
    if (onCloseMobile) onCloseMobile();
  };

  const handleNewChatClick = () => {
    onNewChat();
    if (onCloseMobile) onCloseMobile();
  };

  const handleStartEdit = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingSessionId(session._id);
    setEditTitle(session.title || '');
  };

  const handleSaveEdit = (e: React.FormEvent | React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (editTitle.trim() && onRenameSession) {
      onRenameSession(sessionId, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

  const filteredSessions = sessions.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.title || '').toLowerCase().includes(q) ||
      (s.subject || '').toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 bg-[#f7f7f8] border-r border-[#e5e7eb] flex flex-col transition-all duration-300 z-50 ${
          isMobileOpen
            ? 'translate-x-0 w-72 sm:w-80 shadow-2xl'
            : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-16 overflow-hidden' : 'md:w-72'}`}
      >
        {/* Top Header / Brand */}
        <div className="p-3.5 flex items-center justify-between border-b border-[#e5e7eb] bg-white shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <EduVisionLogo size={32} />
              <div className="truncate">
                <h1 className="text-sm font-bold tracking-tight text-neutral-900 flex items-center gap-1.5">
                  EduVision <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full border border-emerald-300 font-semibold">AI</span>
                </h1>
                <p className="text-[10px] text-neutral-500 truncate">Universal Academic Tutor</p>
              </div>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className={`hidden md:flex p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors ${
              isCollapsed ? 'mx-auto' : 'ml-auto'
            }`}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action: New Chat Button */}
        <div className="p-2.5 pb-1.5 shrink-0">
          <button
            onClick={handleNewChatClick}
            title="Start New Academic Chat (Ctrl + K)"
            className={`w-full flex items-center rounded-xl border border-neutral-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 text-neutral-800 text-xs font-semibold transition-all shadow-xs ${
              isCollapsed
                ? 'justify-center p-2.5 w-10 h-10 mx-auto'
                : 'justify-between px-3 py-2.5'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <SquarePen className="w-4 h-4 text-emerald-600 shrink-0" />
              {!isCollapsed && <span className="truncate">New Chat</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] text-neutral-400 bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded shrink-0 font-mono">
                Ctrl K
              </span>
            )}
          </button>
        </div>

        {/* Collapsed Search Icon Button */}
        {isCollapsed && (
          <div className="px-2 pb-2 shrink-0 flex justify-center">
            <button
              onClick={onToggleCollapse}
              title="Search Chats"
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-500 hover:text-emerald-600 transition-colors shadow-xs"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Expanded Search Bar for Chat Sessions */}
        {!isCollapsed && (
          <div className="px-3 pb-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-neutral-800 placeholder-neutral-400 shadow-xs overflow-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                  className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Admin/Teacher Portal Option - ONLY DISPLAY TO ADMINS/TEACHERS */}
        {!isCollapsed && isAdminOrTeacher && (
          <div className="px-3 pb-2 shrink-0">
            <div className="p-1 bg-neutral-200/70 rounded-xl flex border border-neutral-300/80">
              <Link
                href="/"
                onClick={onCloseMobile}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  !isTeacherView
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Student Chat</span>
              </Link>
              <Link
                href="/teacher"
                onClick={onCloseMobile}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isTeacherView
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Teacher Portal</span>
              </Link>
            </div>
          </div>
        )}

        {/* Sessions List with Centered Icons in Collapsed Mode & Inline Rename */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 min-w-0">
          {!isCollapsed && (
            <div className="px-2 pt-2 pb-1 text-[11px] font-bold tracking-wider text-neutral-500 uppercase flex items-center justify-between">
              <span>Recent Sessions</span>
              {filteredSessions.length > 0 && (
                <span className="text-[10px] text-neutral-400 font-normal">
                  {filteredSessions.length}
                </span>
              )}
            </div>
          )}

          {filteredSessions.length === 0 ? (
            !isCollapsed && (
              <div className="px-3 py-6 text-center text-xs text-neutral-500">
                {searchQuery ? 'No chats match your search.' : 'No sessions yet. Ask a question to begin!'}
              </div>
            )
          ) : (
            filteredSessions.map(s => {
              const isActive = s._id === activeSessionId;
              const isEditing = editingSessionId === s._id;

              return (
                <div
                  key={s._id}
                  title={s.title || 'Academic Discussion'}
                  className={`group relative flex items-center rounded-xl text-xs transition-all cursor-pointer min-w-0 ${
                    isCollapsed
                      ? 'justify-center p-2.5 w-10 h-10 mx-auto'
                      : 'px-3 py-2.5 justify-start'
                  } ${
                    isActive
                      ? 'bg-white text-neutral-900 font-semibold shadow-xs border border-emerald-300 ring-1 ring-emerald-500/10'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                  }`}
                  onClick={() => !isEditing && handleSelectSession(s._id)}
                >
                  {/* Perfectly Centered Message Icon */}
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isCollapsed ? 'mx-auto' : 'mr-2.5'
                    } ${isActive ? 'text-emerald-600' : 'text-neutral-400'}`}
                  />

                  {/* Expanded View: Title & Edit/Delete Actions */}
                  {!isCollapsed && (
                    <>
                      {isEditing ? (
                        <div
                          className="flex-1 flex items-center gap-1 min-w-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(e, s._id);
                              if (e.key === 'Escape') handleCancelEdit(e as any);
                            }}
                            autoFocus
                            className="flex-1 px-1.5 py-0.5 text-xs bg-white border border-emerald-500 rounded-md focus:outline-none text-neutral-900 shadow-xs"
                          />
                          <button
                            onClick={(e) => handleSaveEdit(e, s._id)}
                            title="Save Title"
                            className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            title="Cancel"
                            className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0 pr-12">
                            <p className="truncate text-xs font-medium text-neutral-900">
                              {s.title || 'Academic Discussion'}
                            </p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 absolute right-2 transition-opacity">
                            <button
                              onClick={(e) => handleStartEdit(e, s)}
                              title="Edit Chat Title"
                              className="p-1 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(s._id);
                              }}
                              title="Delete Chat"
                              className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* User Profile Pill at Bottom - Clean & Role-Specific */}
        <div className="p-3 border-t border-[#e5e7eb] bg-white shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="truncate text-left min-w-0">
                  <p className="text-xs font-bold text-neutral-900 truncate">
                    {user?.name || 'Student Account'}
                  </p>
                  <span
                    className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      isAdminOrTeacher
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isAdminOrTeacher ? 'Teacher / Admin' : 'Student'}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
