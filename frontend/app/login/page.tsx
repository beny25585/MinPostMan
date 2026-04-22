'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      router.push('/');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string; detail?: string } } };
      setError(axiosError.response?.data?.error || axiosError.response?.data?.detail || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex auth-login-bg">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative">
        <div className="relative z-10 max-w-md auth-slide-up">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Mini Postman
            </h1>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Test APIs with<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              confidence
            </span>
          </h2>
          
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            A lightweight, powerful API testing tool. Send requests, inspect responses, and organize your workflow.
          </p>

          <div className="space-y-4">
            {[
              'Lightning-fast request proxying',
              'Organize requests in collections',
              'Full request history tracking',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-zinc-300">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md auth-fade-in">
          <div className="auth-card-dark rounded-xl p-8">
            {/* Mobile logo */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">Mini Postman</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-zinc-400 text-sm mb-6">Enter your credentials to continue</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 auth-slide-up">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-zinc-300 text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="auth-input-dark h-11 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300 text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="auth-input-dark h-11 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="auth-btn-login w-full h-11 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-zinc-500">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
