import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  UserCheck,
  CalendarCheck2,
  Clock,
  ChevronRight,
  Phone,
  Mail,
} from 'lucide-react';
import { fetchDashboardData, DashboardStats, PacienteSemRetorno } from '@/services/dashboardService';

interface DashboardOverviewProps {
  onNavigateToPatients: () => void;
  onSelectPatient: (patientId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateToPatients,
  onSelectPatient,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 0,
    consultasSemana: 0,
    pacientesSemRetorno: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchDashboardData(user.id);
      setStats(data);
    } catch (err: any) {
      console.error('Falha ao carregar métricas do dashboard:', err);
      setError('Não foi possível carregar os dados em tempo real do banco Neon. Verifique sua conexão.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Formatter for consultation date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    // Format YYYY-MM-DD or ISO to pt-BR
    try {
      const [year, month, day] = dateStr.split('T')[0].split('-');
      if (year && month && day) {
        return `${day}/${month}/${year}`;
      }
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Real-Time Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Olá, {user?.name ? user.name.split(' ')[0] : 'Nutricionista'}! 👋
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Aqui está o panorama em tempo real da sua clínica e pacientes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Neon Database Online
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            className="border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`}
            />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>

      {/* Error state if query fails */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Aviso de sincronização</p>
            <p className="text-xs text-amber-800 mt-0.5">{error}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadData()}
            className="border-amber-300 text-amber-900 hover:bg-amber-100 text-xs"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* 3 Main Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CARD 1 — Total de pacientes ativos */}
        <Card className="border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all duration-200 group relative overflow-hidden bg-gradient-to-b from-white to-slate-50/30">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                Card 1 • Pacientes
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <CardTitle className="text-base font-bold text-slate-800 mt-2">
              Total de pacientes ativos
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Pacientes cadastrados sob seu acompanhamento
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            {loading ? (
              <div className="h-10 w-20 bg-slate-200 animate-pulse rounded-md" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  {stats.totalPacientes}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {stats.totalPacientes === 1 ? 'paciente ativo' : 'pacientes ativos'}
                </span>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={onNavigateToPatients}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group-hover:gap-1.5 transition-all"
              >
                Gerenciar pacientes
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        {/* CARD 2 — Consultas da semana */}
        <Card className="border-slate-200/80 shadow-xs hover:border-teal-300 transition-all duration-200 group relative overflow-hidden bg-gradient-to-b from-white to-slate-50/30">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                Card 2 • Agenda
              </span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <CardTitle className="text-base font-bold text-slate-800 mt-2">
              Consultas da semana
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Consultas registradas na semana atual
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            {loading ? (
              <div className="h-10 w-20 bg-slate-200 animate-pulse rounded-md" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  {stats.consultasSemana}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {stats.consultasSemana === 1 ? 'consulta nesta semana' : 'consultas nesta semana'}
                </span>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-500" />
                Segunda a Domingo
              </span>
              <CalendarCheck2 className="w-4 h-4 text-teal-400" />
            </div>
          </CardContent>
        </Card>

        {/* Status rápido complementar para harmonia do grid */}
        <Card className="border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all duration-200 group relative overflow-hidden bg-gradient-to-b from-white to-slate-50/30">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-green-500" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                Atenção Clínica
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-700 group-hover:text-white transition-all shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <CardTitle className="text-base font-bold text-slate-800 mt-2">
              Retornos pendentes
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Pacientes com mais de 30 dias sem retorno
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            {loading ? (
              <div className="h-10 w-20 bg-slate-200 animate-pulse rounded-md" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  {stats.pacientesSemRetorno.length}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {stats.pacientesSemRetorno.length === 1 ? 'paciente requer contato' : 'pacientes requerem contato'}
                </span>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              {stats.pacientesSemRetorno.length === 0 ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Todos os retornos em dia
                </span>
              ) : (
                <span className="text-amber-700 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Veja a lista detalhada abaixo
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CARD 3 — Pacientes sem retorno (Área detalhada com lista completa e clicável) */}
      <Card className="border-slate-200/80 shadow-md">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Card 3 — Pacientes sem retorno
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado
                  </CardDescription>
                </div>
              </div>
            </div>

            {stats.pacientesSemRetorno.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
                {stats.pacientesSemRetorno.length}{' '}
                {stats.pacientesSemRetorno.length === 1 ? 'paciente' : 'pacientes'}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Carregando pacientes sem retorno do Neon...
              </p>
            </div>
          ) : stats.pacientesSemRetorno.length === 0 ? (
            /* Regra expressa do Prompt 3: Se não houver pacientes sem retorno, exibir a mensagem "Nenhum paciente sem retorno no momento" */
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 ring-8 ring-emerald-50/50">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                Nenhum paciente sem retorno no momento
              </h4>
              <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
                Excelente! Todos os seus pacientes tiveram consultas nos últimos 30 dias ou já possuem uma data de próximo retorno agendada no sistema.
              </p>
            </div>
          ) : (
            /* Lista dos pacientes sem retorno — cada nome clicável redirecionando para o perfil */
            <div className="divide-y divide-slate-100">
              {stats.pacientesSemRetorno.map((paciente: PacienteSemRetorno) => (
                <div
                  key={paciente.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                      {paciente.nome
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>

                    <div>
                      {/* Nome clicável com redirecionamento para o perfil */}
                      <button
                        onClick={() => onSelectPatient(paciente.id)}
                        className="text-base font-semibold text-slate-900 hover:text-emerald-700 hover:underline text-left flex items-center gap-1.5 transition-colors group"
                        title="Ver perfil completo do paciente"
                      >
                        <span>{paciente.nome}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                      </button>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Última consulta: {formatDate(paciente.ultima_consulta)}
                        </span>

                        {paciente.telefone && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {paciente.telefone}
                          </span>
                        )}

                        {paciente.email && (
                          <span className="hidden md:flex items-center gap-1 text-slate-500">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {paciente.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                      Há {paciente.dias_desde_consulta} dias sem consulta
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectPatient(paciente.id)}
                      className="border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 text-xs font-medium"
                    >
                      Ver perfil
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
