'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, ArrowRight, FolderOpen, Clock, Shield } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(username, password, firstName, lastName);
      router.push('/');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string; detail?: string } } };
      setError(axiosError.response?.data?.error || axiosError.response?.data?.detail || 'Registration failed. Username may already be taken.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center auth-register-bg p-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8 auth-fade-in">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
          Mini Postman
        </h1>
      </div>

      <div className="w-full max-w-md auth-slide-up">
        <div className="auth-card-light rounded-xl p-8">
          <h2 className="text-2xl font-bold text-zinc-900 mb-1">Create your account</h2>
          <p className="text-zinc-500 text-sm mb-6">Get started for free — no credit card required</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600 auth-slide-up">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-700 text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                className="auth-input-light h-11 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-zinc-700 text-sm font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Optional"
                  className="auth-input-light h-11 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-zinc-700 text-sm font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Optional"
                  className="auth-input-light h-11 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-700 text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                className="auth-input-light h-11 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="auth-btn-register w-full h-11 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500">
              Already have an account?{' '}
              <Link href="/mini_postman/frontend/login" className="text-emerald-600 hover:text-emerald-700 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Feature highlights below the card */}
        <div className="mt-8 grid grid-cols-3 gap-4 auth-fade-in" style={{ animationDelay: '0.2s' }}>
          {[
            { icon: FolderOpen, label: 'Collections', desc: 'Organize requests' },
            { icon: Clock, label: 'History', desc: 'Track everything' },
            { icon: Shield, label: 'Secure', desc: 'Token-based auth' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <Icon className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs font-semibold text-zinc-800">{label}</p>
              <p className="text-[11px] text-zinc-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
