import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Login } from '@/components/auth/Login';
import { Register } from '@/components/auth/Register';
import { Dashboard } from '@/components/Dashboard';
import { Leaf, ShieldCheck, HeartPulse, Sparkles, Loader2 } from 'lucide-react';

export function App() {
  const { user, loading, signOut } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 mb-4 animate-bounce">
          <Leaf className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          Carregando sessão...
        </div>
      </div>
    );
  }

  // Regra: Se já estiver logado, redirecionar direto para o dashboard
  if (user) {
    return <Dashboard onLogout={signOut} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/60 via-slate-50 to-teal-50/50 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* Background soft glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-200/20 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:px-6">
        {/* Brand Header */}
        <header className="flex flex-col items-center mb-8 text-center animate-in fade-in duration-300">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-600/25 ring-4 ring-emerald-500/10">
              <Leaf className="w-9 h-9" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Gimenes Nutrição
          </h1>
          <p className="mt-1 text-sm font-medium text-emerald-700 bg-emerald-50/80 px-3 py-1 rounded-full border border-emerald-100">
            Plataforma Clínica de Gestão e Acompanhamento Nutricional
          </p>
        </header>

        {/* Auth Cards */}
        <div className="w-full max-w-md transition-all duration-300">
          {authView === 'login' ? (
            <Login
              onSwitchToRegister={() => setAuthView('register')}
              onSuccess={() => {}}
            />
          ) : (
            <Register
              onSwitchToLogin={() => setAuthView('login')}
              onSuccess={() => setAuthView('login')}
            />
          )}
        </div>

        {/* Clinical trust badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5 hover:text-slate-600 transition">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Autenticação segura via Neon Auth
          </span>
          <span className="flex items-center gap-1.5 hover:text-slate-600 transition">
            <HeartPulse className="w-4 h-4 text-emerald-600" />
            Em conformidade com a prática clínica
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/50">
        © {new Date().getFullYear()} Gimenes Nutrição. Todos os direitos reservados.
      </footer>
    </div>
  );
}

export default App;
