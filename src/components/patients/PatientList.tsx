import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  UserPlus,
  Search,
  Calendar,
  Target,
  ChevronRight,
} from 'lucide-react';
import { Paciente } from '@/services/patientsService';
import { formatDate } from '@/lib/formatters';

interface PatientListProps {
  pacientes: Paciente[];
  loading: boolean;
  onNewPatient: () => void;
  onSelectPatient: (patientId: string) => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  pacientes,
  loading,
  onNewPatient,
  onSelectPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtro por nome no topo da listagem
  const filtered = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const getObjetivoDisplay = (paciente: Paciente) => {
    if (paciente.objetivos && paciente.objetivos.length > 0) {
      return paciente.objetivos.join(', ');
    }
    if (paciente.objetivo_texto) {
      return paciente.objetivo_texto;
    }
    return 'Objetivo não informado';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & New Patient Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            Prontuários e Acompanhamento
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pacientes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Consulte a lista completa de pacientes cadastrados sob sua gestão clínica.
          </p>
        </div>

        <Button
          onClick={onNewPatient}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      {/* Campo de busca por nome no topo da listagem */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar paciente por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm bg-white"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {pacientes.length} {pacientes.length === 1 ? 'paciente cadastrado' : 'pacientes cadastrados'}
        </div>
      </div>

      {/* Listagem de pacientes */}
      <Card className="border-slate-200/80 shadow-xs bg-white overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Carregando pacientes cadastrados no Neon...
              </p>
            </div>
          ) : pacientes.length === 0 ? (
            /* Regra explícita: Se não houver pacientes cadastrados, exibir a mensagem "Nenhum paciente cadastrado ainda" */
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 ring-8 ring-emerald-50/50">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Nenhum paciente cadastrado ainda
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1 mb-6 leading-relaxed">
                Você ainda não possui pacientes vinculados ao seu perfil. Clique no botão abaixo para preencher o formulário de cadastro em 3 etapas.
              </p>
              <Button
                onClick={onNewPatient}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Cadastrar Primeiro Paciente
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            /* Busca sem resultados */
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-800">
                Nenhum paciente encontrado com "{searchTerm}"
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Verifique a ortografia do nome digitado ou limpe a busca.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSearchTerm('')}
                className="text-xs border-slate-200"
              >
                Limpar busca
              </Button>
            </div>
          ) : (
            /* Lista de pacientes: Cada paciente exibe: nome, objetivo e data da última consulta */
            <div className="divide-y divide-slate-100">
              {filtered.map((paciente) => {
                const objetivoDisplay = getObjetivoDisplay(paciente);
                const temConsulta = Boolean(paciente.ultima_consulta);

                return (
                  <div
                    key={paciente.id}
                    onClick={() => onSelectPatient(paciente.id)}
                    className="p-4 sm:p-5 flex items-center justify-between hover:bg-emerald-50/35 cursor-pointer transition-all duration-150 group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Avatar com iniciais */}
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200 group-hover:scale-105 group-hover:border-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
                        {paciente.nome
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>

                      {/* Informações: Nome, Objetivo e Data da Última Consulta */}
                      <div className="min-w-0">
                        {/* 1. Nome do paciente */}
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                          {paciente.nome}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                          {/* 2. Objetivo */}
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium truncate max-w-xs sm:max-w-md">
                            <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">
                              <span className="text-slate-400 font-normal">Objetivo: </span>
                              {objetivoDisplay}
                            </span>
                          </div>

                          {/* 3. Data da última consulta */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>
                              <span className="text-slate-400 font-normal">Última consulta: </span>
                              {temConsulta ? (
                                <span className="font-semibold text-slate-700">
                                  {formatDate(paciente.ultima_consulta)}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">
                                  Nenhuma consulta realizada
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Seta e link para redirecionamento ao perfil */}
                    <div className="flex items-center gap-2 shrink-0 pl-3">
                      <span className="hidden md:inline-block text-xs font-semibold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver perfil
                      </span>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-100/60 group-hover:translate-x-1 transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
