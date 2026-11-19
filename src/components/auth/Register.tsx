import React, { useState } from 'react';
import { authClient } from '@/lib/auth';
import { useAuth, UserSession } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onSuccess }) => {
  const { setUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password.length < 9) {
      setErrorMessage('A senha deve ter no mínimo 9 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem. Digite novamente.');
      return;
    }

    setLoading(true);

    try {
      const res = await (authClient as any).signUp.email({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (res?.error) {
        const msg = res.error.message || '';
        if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('duplicate')) {
          setErrorMessage('Já existe uma conta cadastrada com este email.');
        } else {
          setErrorMessage(msg || 'Erro ao realizar o cadastro. Verifique os dados inseridos.');
        }
        setLoading(false);
        return;
      }

      // Automatically store/update session state
      if (res?.data?.user) {
        const u = res.data.user;
        const sessionUser: UserSession = {
          id: u.id,
          name: u.name || fullName.trim(),
          email: u.email || email.trim().toLowerCase(),
          image: u.image,
        };
        setUser(sessionUser);
        localStorage.setItem('nutri_user_session', JSON.stringify(sessionUser));
      } else {
        // In case signup succeeds without immediate user payload, try auto sign in
        try {
          const loginRes = await (authClient as any).signIn.email({
            email: email.trim().toLowerCase(),
            password: password,
          });
          if (loginRes?.data?.user) {
            const u = loginRes.data.user;
            const sessionUser: UserSession = {
              id: u.id,
              name: u.name || fullName.trim(),
              email: u.email || email.trim().toLowerCase(),
              image: u.image,
            };
            setUser(sessionUser);
            localStorage.setItem('nutri_user_session', JSON.stringify(sessionUser));
          }
        } catch (autoLoginErr) {
          console.warn('Auto sign-in check failed:', autoLoginErr);
        }
      }

      onSuccess();
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setErrorMessage(
        err?.message || 'Ocorreu um erro ao conectar com o serviço de autenticação. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-xl shadow-emerald-950/5 border-emerald-100/60 backdrop-blur-sm bg-white/95">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl text-slate-900 font-bold">Crie sua conta</CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Cadastre-se como nutricionista e comece a transformar o atendimento dos seus pacientes
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
                Nome completo
              </label>
              <Input
                type="text"
                placeholder="Dra. Maria Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
                autoComplete="name"
                disabled={loading}
              />
            </div>

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
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Senha (mínimo 9 caracteres)
              </label>
              <Input
                type="password"
                placeholder="Crie uma senha segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
                minLength={9}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Confirmar senha
              </label>
              <Input
                type="password"
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
                minLength={9}
                autoComplete="new-password"
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
                  Criando sua conta...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Criar conta
                </>
              )}
            </Button>

            <div className="pt-4 text-center border-t border-slate-100">
              <p className="text-sm text-slate-600">
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition cursor-pointer"
                >
                  Faça login
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

