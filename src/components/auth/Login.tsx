import React, { useState } from 'react';
import { authClient } from '@/lib/auth';
import { useAuth, UserSession } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface LoginProps {
  onSwitchToRegister: () => void;
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onSuccess }) => {
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 9) {
      setErrorMessage('A senha deve ter no mínimo 9 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const res = await (authClient as any).signIn.email({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (res?.error) {
        const msg = res.error.message || '';
        if (msg.toLowerCase().includes('credential') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('password')) {
          setErrorMessage('Email ou senha incorretos. Verifique seus dados e tente novamente.');
        } else if (msg.toLowerCase().includes('user not found')) {
          setErrorMessage('Não encontramos uma conta associada a este email.');
        } else {
          setErrorMessage(msg || 'Falha ao autenticar. Verifique seus dados.');
        }
        setLoading(false);
        return;
      }

      if (res?.data?.user) {
        const u = res.data.user;
        const sessionUser: UserSession = {
          id: u.id,
          name: u.name || 'Nutricionista',
          email: u.email || email,
          image: u.image,
        };
        setUser(sessionUser);
        localStorage.setItem('nutri_user_session', JSON.stringify(sessionUser));
      }

      onSuccess();
    } catch (err: any) {
      console.error('Erro no login:', err);
      setErrorMessage(
        err?.message || 'Ocorreu um erro inesperado ao conectar com o servidor. Tente novamente mais tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-xl shadow-emerald-950/5 border-emerald-100/60 backdrop-blur-sm bg-white/95">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl text-slate-900 font-bold">Acesse sua conta</CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Entre com suas credenciais para gerenciar seus pacientes e dietas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Email
              </label>
              <Input
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Senha
                </label>
              </div>
              <Input
                type="password"
                placeholder="Mínimo 9 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
                minLength={9}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2 font-semibold shadow-md shadow-emerald-600/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando no sistema...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <div className="pt-4 text-center border-t border-slate-100">
              <p className="text-sm text-slate-600">
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition cursor-pointer"
                >
                  Cadastre-se
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

