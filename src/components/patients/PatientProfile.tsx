import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  User,
  HeartPulse,
  Coffee,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  MessageCircle,
} from 'lucide-react';
import { Paciente, Consulta, createConsulta } from '@/services/patientsService';
import { formatDate, calculateAge, calculateIMC } from '@/lib/formatters';

interface PatientProfileProps {
  paciente: Paciente;
  consultas: Consulta[];
  onBack: () => void;
  onRefresh: () => Promise<void>;
  successMessage?: string | null;
}

export const PatientProfile: React.FC<PatientProfileProps> = ({
  paciente,
  consultas,
  onBack,
  onRefresh,
  successMessage,
}) => {
  const [isNewConsultaModalOpen, setIsNewConsultaModalOpen] = useState(false);
  const [consultaData, setConsultaData] = useState(() => new Date().toISOString().split('T')[0]);
  const [consultaPeso, setConsultaPeso] = useState('');
  const [consultaCintura, setConsultaCintura] = useState('');
  const [consultaQuadril, setConsultaQuadril] = useState('');
  const [consultaGordura, setConsultaGordura] = useState('');
  const [consultaRetorno, setConsultaRetorno] = useState('');
  const [consultaObs, setConsultaObs] = useState('');
  const [salvandoConsulta, setSalvandoConsulta] = useState(false);
  const [erroConsulta, setErroConsulta] = useState<string | null>(null);

  // Cálculos do perfil
  const idade = calculateAge(paciente.data_nascimento);
  const pesoMaisRecente =
    consultas[0]?.peso || paciente.peso_inicial || null;
  const imcInfo = calculateIMC(pesoMaisRecente, paciente.altura || null);

  const handleSalvarConsulta = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvandoConsulta(true);
    setErroConsulta(null);

    try {
      await createConsulta({
        paciente_id: paciente.id,
        data_consulta: consultaData,
        peso: consultaPeso ? parseFloat(consultaPeso) : null,
        cintura: consultaCintura ? parseFloat(consultaCintura) : null,
        quadril: consultaQuadril ? parseFloat(consultaQuadril) : null,
        percentual_gordura: consultaGordura ? parseFloat(consultaGordura) : null,
        proximo_retorno: consultaRetorno || null,
        observacoes: consultaObs.trim() || null,
      });

      await onRefresh();
      setIsNewConsultaModalOpen(false);

      // Limpar campos
      setConsultaPeso('');
      setConsultaCintura('');
      setConsultaQuadril('');
      setConsultaGordura('');
      setConsultaRetorno('');
      setConsultaObs('');
    } catch (err: any) {
      console.error('Erro ao registrar consulta:', err);
      setErroConsulta('Falha ao salvar consulta no banco Neon. Tente novamente.');
    } finally {
      setSalvandoConsulta(false);
    }
  };

  const whatsappClean = paciente.whatsapp ? paciente.whatsapp.replace(/\D/g, '') : '';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Success banner if redirected from form */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex items-center gap-3 text-emerald-900 shadow-xs animate-in slide-in-from-top-2 duration-300">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">{successMessage}</p>
            <p className="text-xs text-emerald-700">
              O prontuário já está ativo no Neon e vinculado à sua conta de nutricionista.
            </p>
          </div>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 self-start"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Voltar para lista de pacientes
        </Button>

        <Button
          size="sm"
          onClick={() => setIsNewConsultaModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Registrar Consulta
        </Button>
      </div>

      {/* Profile Overview Card */}
      <Card className="border-slate-200/80 shadow-xs bg-white overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400" />
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-emerald-600/25 shrink-0 ring-4 ring-emerald-500/10">
                {paciente.nome
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {paciente.nome}
                  </h1>
                  {paciente.sexo && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {paciente.sexo}
                    </span>
                  )}
                  {idade !== null && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {idade} anos
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                  {paciente.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {paciente.email}
                    </span>
                  )}
                  {paciente.telefone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {paciente.telefone}
                    </span>
                  )}
                  {paciente.whatsapp && (
                    <a
                      href={`https://wa.me/55${whatsappClean}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      {paciente.whatsapp}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex-1 sm:flex-initial text-center px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl min-w-[90px]">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Peso Atual
                </span>
                <span className="text-base font-extrabold text-slate-900">
                  {pesoMaisRecente ? `${pesoMaisRecente} kg` : '-'}
                </span>
              </div>

              <div className="flex-1 sm:flex-initial text-center px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl min-w-[90px]">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Altura
                </span>
                <span className="text-base font-extrabold text-slate-900">
                  {paciente.altura
                    ? `${paciente.altura > 3 ? (paciente.altura / 100).toFixed(2) : paciente.altura} m`
                    : '-'}
                </span>
              </div>

              {imcInfo && (
                <div className={`flex-1 sm:flex-initial text-center px-4 py-2.5 border rounded-xl min-w-[120px] ${imcInfo.badgeClass}`}>
                  <span className="text-[10px] uppercase tracking-wider font-bold block opacity-80">
                    IMC • {imcInfo.imc}
                  </span>
                  <span className="text-xs font-bold block mt-0.5">
                    {imcInfo.classificacao}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Informações Clínicas, Hábitos e Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Dados Clínicos e Hábitos */}
        <div className="space-y-6 lg:col-span-1">
          {/* Card: Dados Clínicos */}
          <Card className="border-slate-200/80 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-emerald-600" />
                Avaliação Clínica
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {/* Objetivos */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Objetivos
                </span>
                {paciente.objetivos && paciente.objetivos.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {paciente.objetivos.map((obj) => (
                      <span
                        key={obj}
                        className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-[11px]"
                      >
                        {obj}
                      </span>
                    ))}
                  </div>
                ) : null}
                {paciente.objetivo_texto && (
                  <p className="text-slate-700 italic mt-1 font-medium">
                    "{paciente.objetivo_texto}"
                  </p>
                )}
                {!paciente.objetivos?.length && !paciente.objetivo_texto && (
                  <span className="text-slate-400">Não informado</span>
                )}
              </div>

              {/* Nível de atividade */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Nível de Atividade Física
                </span>
                <span className="font-semibold text-slate-800">
                  {paciente.nivel_atividade || 'Não informado'}
                </span>
              </div>

              {/* Patologias */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Patologias / Condições
                </span>
                {paciente.patologias && paciente.patologias.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {paciente.patologias.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 font-medium border border-rose-200 text-[11px]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400">Nenhuma patologia registrada</span>
                )}
              </div>

              {/* Restrições */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Restrições Alimentares
                </span>
                {paciente.restricoes_alimentares && paciente.restricoes_alimentares.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {paciente.restricoes_alimentares.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-medium border border-amber-200 text-[11px]"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400">Nenhuma restrição registrada</span>
                )}
              </div>

              {/* Alergias */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Alergias Alimentares
                </span>
                {paciente.alergias && paciente.alergias.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {paciente.alergias.map((a) => (
                      <span
                        key={a}
                        className="px-2 py-0.5 rounded-md bg-red-50 text-red-800 font-medium border border-red-200 text-[11px]"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400">Nenhuma alergia registrada</span>
                )}
              </div>

              {/* Medicamentos e Suplementos */}
              {(paciente.medicamentos || paciente.suplementos) && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {paciente.medicamentos && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Medicamentos Contínuos
                      </span>
                      <p className="text-slate-700">{paciente.medicamentos}</p>
                    </div>
                  )}
                  {paciente.suplementos && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Suplementos
                      </span>
                      <p className="text-slate-700">{paciente.suplementos}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card: Hábitos e Rotina */}
          <Card className="border-slate-200/80 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-emerald-600" />
                Hábitos e Rotina Diária
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Refeições/dia
                  </span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {paciente.refeicoes_por_dia ? `${paciente.refeicoes_por_dia}` : '-'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Água / dia
                  </span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {paciente.litros_agua ? `${paciente.litros_agua} L` : '-'}
                  </span>
                </div>
              </div>

              {(paciente.horario_acorda || paciente.horario_dorme) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100/80">
                    <span className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-500" /> Acorda
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {paciente.horario_acorda || '-'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100/80">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase flex items-center gap-1">
                      <Moon className="w-3 h-3 text-indigo-500" /> Dorme
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {paciente.horario_dorme || '-'}
                    </span>
                  </div>
                </div>
              )}

              {/* Atividade física */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Atividade Física
                </span>
                <span className="font-semibold text-slate-800">
                  {paciente.atividade_fisica ? 'Sim' : 'Não'}
                </span>
                {paciente.atividade_fisica && paciente.atividade_fisica_descricao && (
                  <p className="text-slate-600 mt-1 italic">
                    {paciente.atividade_fisica_descricao}
                  </p>
                )}
              </div>

              {/* Observações gerais */}
              {paciente.observacoes && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Observações Gerais
                  </span>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {paciente.observacoes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna 2 e 3: Histórico de Consultas */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200/80 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Histórico de Consultas ({consultas.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Acompanhamento de medidas, evoluções e agendamentos de retorno
                </CardDescription>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsNewConsultaModalOpen(true)}
                className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Nova Consulta
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              {consultas.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">
                    Nenhuma consulta registrada ainda
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
                    Registre a primeira consulta com as medidas do paciente e data de retorno.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setIsNewConsultaModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Registrar Primeira Consulta
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {consultas.map((consulta, index) => (
                    <div
                      key={consulta.id}
                      className="p-5 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                            #{consultas.length - index}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            Consulta em {formatDate(consulta.data_consulta)}
                          </span>
                        </div>

                        {consulta.proximo_retorno && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                            Retorno agendado: {formatDate(consulta.proximo_retorno)}
                          </span>
                        )}
                      </div>

                      {/* Medidas da consulta */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3.5 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            Peso
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {consulta.peso ? `${consulta.peso} kg` : '-'}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            Cintura
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {consulta.cintura ? `${consulta.cintura} cm` : '-'}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            Quadril
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {consulta.quadril ? `${consulta.quadril} cm` : '-'}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            % Gordura
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {consulta.percentual_gordura
                              ? `${consulta.percentual_gordura}%`
                              : '-'}
                          </span>
                        </div>
                      </div>

                      {consulta.observacoes && (
                        <p className="mt-3 text-xs text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-100 leading-relaxed">
                          <span className="font-bold text-slate-800 block mb-0.5">
                            Conduta e Observações:
                          </span>
                          {consulta.observacoes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal: Nova Consulta */}
      {isNewConsultaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Registrar Nova Consulta
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Paciente: <span className="font-bold text-slate-800">{paciente.nome}</span>
            </p>

            {erroConsulta && (
              <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {erroConsulta}
              </div>
            )}

            <form onSubmit={handleSalvarConsulta} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Data da Consulta *
                  </label>
                  <Input
                    type="date"
                    value={consultaData}
                    onChange={(e) => setConsultaData(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Próximo Retorno
                  </label>
                  <Input
                    type="date"
                    value={consultaRetorno}
                    onChange={(e) => setConsultaRetorno(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Peso (kg)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 70.5"
                    value={consultaPeso}
                    onChange={(e) => setConsultaPeso(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Cintura (cm)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 80"
                    value={consultaCintura}
                    onChange={(e) => setConsultaCintura(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Quadril (cm)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 95"
                    value={consultaQuadril}
                    onChange={(e) => setConsultaQuadril(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    % Gordura
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 22.4"
                    value={consultaGordura}
                    onChange={(e) => setConsultaGordura(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Observações e Conduta
                </label>
                <textarea
                  rows={3}
                  value={consultaObs}
                  onChange={(e) => setConsultaObs(e.target.value)}
                  placeholder="Evolução, ajustes dietéticos, queixas..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewConsultaModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={salvandoConsulta}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {salvandoConsulta ? 'Salvando no Neon...' : 'Salvar Consulta'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
