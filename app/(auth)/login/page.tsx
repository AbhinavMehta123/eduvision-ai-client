'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { EduVisionLogo } from '@/components/eduvision-logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'teacher' || user.role === 'admin') {
        router.push('/teacher');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'student' | 'teacher') => {
    if (role === 'student') {
      setEmail('abhinav.bca@eduvision.edu');
      setPassword('password123');
    } else {
      setEmail('prof.teacher@eduvision.edu');
      setPassword('teacher123');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f8] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-xl animate-in fade-in duration-300">
        <div className="flex flex-col items-center text-center mb-6">
          <EduVisionLogo size={56} className="mb-3" />
          <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-neutral-500 mt-1">Sign in to your EduVision AI account</p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Quick Fill Buttons */}
        <div className="mt-6 pt-5 border-t border-neutral-200">
          <p className="text-[11px] font-bold text-neutral-500 text-center mb-2.5">
            Quick Demo Accounts for Viva Examination:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="py-2 px-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs text-emerald-700 font-bold transition-colors"
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('teacher')}
              className="py-2 px-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs text-indigo-700 font-bold transition-colors"
            >
              Demo Teacher
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-500 mt-6 font-medium">
          Don't have an account?{' '}
          <Link href="/register" className="text-emerald-700 hover:underline font-bold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
