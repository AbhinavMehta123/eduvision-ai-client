'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, User, Lock, Mail, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { EduVisionLogo } from '@/components/eduvision-logo';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [adminPasskey, setAdminPasskey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'teacher' && !adminPasskey.trim()) {
      setError('Admin/Faculty Security Passkey is required to register as a Teacher.');
      return;
    }

    setLoading(true);
    try {
      const user = await register(
        name,
        email,
        password,
        role,
        role === 'teacher' ? adminPasskey.trim() : undefined
      );

      if (user.role === 'teacher' || user.role === 'admin') {
        router.push('/teacher');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Registration failed. Please verify your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f8] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-xl animate-in fade-in duration-300">
        <div className="flex flex-col items-center text-center mb-6">
          <EduVisionLogo size={56} className="mb-3" />
          <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Create Account</h2>
          <p className="text-xs text-neutral-500 mt-1">Join EduVision AI Multilingual Visual Platform</p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

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
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Account Role Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">Account Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  role === 'student'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-neutral-50 border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  role === 'teacher'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-xs'
                    : 'bg-neutral-50 border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Teacher / Admin
              </button>
            </div>
          </div>

          {/* Conditional Admin/Teacher Security Passkey Field */}
          {role === 'teacher' && (
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl animate-in fade-in space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Faculty Authorization Required</span>
              </div>
              <p className="text-[11px] text-indigo-700 leading-snug">
                To prevent unauthorized student access to class analytics, enter the institutional passkey:
              </p>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-indigo-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={adminPasskey}
                  onChange={e => setAdminPasskey(e.target.value)}
                  placeholder="Security Passkey (e.g. admin2026)"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-indigo-300 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[10px] text-indigo-600 italic">
                Viva Testing Passkey: <code className="font-mono font-bold bg-white px-1 rounded">admin2026</code>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500 mt-6 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-700 hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
