import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  User,
  HeartPulse,
  Coffee,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Copy,
  Moon,
  Sun,
} from 'lucide-react';
import {
  formatPhone,
  formatTimeInput,
  calculateAge,
  calculateIMC,
} from '@/lib/formatters';
import { createPaciente, Paciente } from '@/services/patientsService';

interface PatientFormProps {
  onCancel: () => void;
  onSuccess: (newPatient: Paciente) => void;
}

type TabType = 'pessoal' | 'clinico' | 'habitos';

const OBJETIVOS_OPCOES = [
  'Emagrecer',
  'Ganhar massa',
  'Controlar diabetes',
  'Saúde geral',
  'Performance esportiva',
  'Reeducação alimentar',
];

const NIVEIS_ATIVIDADE = [
  { id: 'Sedentário', label: 'Sedentário', desc: 'Pouco ou nenhum exercício' },
  { id: 'Levemente ativo', label: 'Levemente ativo', desc: 'Exercício leve 1-3 dias/semana' },
  { id: 'Moderadamente ativo', label: 'Moderadamente ativo', desc: 'Exercício moderado 3-5 dias/semana' },
  { id: 'Muito ativo', label: 'Muito ativo', desc: 'Exercício pesado 6-7 dias/semana' },
  { id: 'Extremamente ativo', label: 'Extremamente ativo', desc: 'Treino muito pesado ou trabalho físico' },
];

const PATOLOGIAS_PADRAO = [
  'Diabetes',
  'Hipertensão',
  'Hipotireoidismo',
  'Hipertireoidismo',
  'Síndrome do ovário policístico',
  'Doença celíaca',
  'Colesterol alto',
];

const RESTRICOES_PADRAO = [
  'Lactose',
  'Glúten',
  'Açúcar',
  'Carne vermelha',
  'Frutos do mar',
];

const ALERGIAS_PADRAO = [
  'Amendoim',
  'Leite',
  'Ovo',
  'Soja',
  'Trigo',
  'Frutos do mar',
];

export const PatientForm: React.FC<PatientFormProps> = ({ onCancel, onSuccess }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('pessoal');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ABA 1 — PESSOAL
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState<'Feminino' | 'Masculino' | 'Outro'>('Feminino');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // ABA 2 — CLÍNICO
  const [pesoKg, setPesoKg] = useState<string>('');
  const [alturaCm, setAlturaCm] = useState<string>('');
  const [objetivosSelecionados, setObjetivosSelecionados] = useState<string[]>([]);
  const [objetivoTextoLivre, setObjetivoTextoLivre] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('Sedentário');

  // Patologias
  const [patologiasSelecionadas, setPatologiasSelecionadas] = useState<string[]>([]);
  const [novaPatologia, setNovaPatologia] = useState('');

  // Restrições alimentares
  const [restricoesSelecionadas, setRestricoesSelecionadas] = useState<string[]>([]);
  const [novaRestricao, setNovaRestricao] = useState('');

  // Alergias alimentares
  const [alergiasSelecionadas, setAlergiasSelecionadas] = useState<string[]>([]);
  const [novaAlergia, setNovaAlergia] = useState('');

  const [medicamentos, setMedicamentos] = useState('');
  const [suplementos, setSuplementos] = useState('');

  // ABA 3 — HÁBITOS
  const [refeicoesPorDia, setRefeicoesPorDia] = useState<string>('3');
  const [horarioAcorda, setHorarioAcorda] = useState('');
  const [horarioDorme, setHorarioDorme] = useState('');
  const [litrosAgua, setLitrosAgua] = useState<string>('2');
  const [praticaAtividadeFisica, setPraticaAtividadeFisica] = useState<boolean>(false);
  const [atividadeFisicaDescricao, setAtividadeFisicaDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Cálculos automáticos
  const idade = calculateAge(dataNascimento);
  const pesoNum = pesoKg ? parseFloat(pesoKg) : null;
  const alturaNum = alturaCm ? parseFloat(alturaCm) : null;
  const imcCalculado = calculateIMC(pesoNum, alturaNum);

  // Handlers para formatações e interações
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatPhone(e.target.value));
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatPhone(e.target.value));
  };

  const copiarTelefoneParaWhatsapp = () => {
    if (telefone) {
      setWhatsapp(telefone);
    }
  };

  const handleHorarioAcordaBlur = () => {
    setHorarioAcorda(formatTimeInput(horarioAcorda));
  };

  const handleHorarioDormeBlur = () => {
    setHorarioDorme(formatTimeInput(horarioDorme));
  };

  // Toggle helpers com suporte a "Nenhum"
  const toggleArrayItem = (
    item: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (item === 'Nenhum') {
      if (list.includes('Nenhum')) {
        setList([]);
      } else {
        setList(['Nenhum']);
      }
      return;
    }

    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list.filter((i) => i !== 'Nenhum'), item]);
    }
  };

  const addCustomItem = (
    val: string,
    setVal: (v: string) => void,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const trimmed = val.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list.filter((i) => i !== 'Nenhum'), trimmed]);
      setVal('');
    }
  };

  const removeCustomItem = (
    item: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(list.filter((i) => i !== item));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    // Regra: O único campo obrigatório é o nome completo
    if (!nome.trim()) {
      setActiveTab('pessoal');
      setErrorMessage('Por favor, informe o nome completo do paciente.');
      return;
    }

    if (!user?.id) {
      setErrorMessage('Sessão expirada. Faça login novamente para cadastrar.');
      return;
    }

    setSaving(true);

    try {
      // Normaliza horários caso ainda não tenham sofrido onBlur
      const acordaFormatado = formatTimeInput(horarioAcorda);
      const dormeFormatado = formatTimeInput(horarioDorme);

      const novoPaciente = await createPaciente({
        nutricionista_id: user.id,
        nome: nome.trim(),
        data_nascimento: dataNascimento || null,
        sexo: sexo || null,
        telefone: telefone || null,
        whatsapp: whatsapp || null,
        email: email.trim().toLowerCase() || null,
        peso_inicial: pesoNum,
        altura: alturaNum,
        objetivos: objetivosSelecionados.length > 0 ? objetivosSelecionados : null,
        objetivo_texto: objetivoTextoLivre.trim() || null,
        nivel_atividade: nivelAtividade || null,
        patologias: patologiasSelecionadas.length > 0 ? patologiasSelecionadas : null,
        restricoes_alimentares: restricoesSelecionadas.length > 0 ? restricoesSelecionadas : null,
        alergias: alergiasSelecionadas.length > 0 ? alergiasSelecionadas : null,
        medicamentos: medicamentos.trim() || null,
        suplementos: suplementos.trim() || null,
        refeicoes_por_dia: refeicoesPorDia ? parseInt(refeicoesPorDia, 10) : null,
        horario_acorda: acordaFormatado || null,
        horario_dorme: dormeFormatado || null,
        litros_agua: litrosAgua ? parseFloat(litrosAgua) : null,
        atividade_fisica: praticaAtividadeFisica,
        atividade_fisica_descricao: praticaAtividadeFisica
          ? atividadeFisicaDescricao.trim() || null
          : null,
        observacoes: observacoes.trim() || null,
      });

      onSuccess(novoPaciente);
    } catch (err: any) {
      console.error('Erro ao salvar paciente no Neon:', err);
      setErrorMessage(
        err?.message || 'Falha ao salvar paciente no banco Neon. Verifique os dados inseridos e tente novamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Cancel Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Novo Prontuário Clínico
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Cadastro de Paciente
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Preencha os dados organizados em 3 etapas. Apenas o nome completo é obrigatório.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Cancelar
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleSubmit()}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold"
          >
            {saving ? (
              'Salvando no Neon...'
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Salvar Paciente
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-900 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Atenção</p>
            <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 3 Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('pessoal')}
          className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'pessoal'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>1. Pessoal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clinico')}
          className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'clinico'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>2. Clínico</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('habitos')}
          className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'habitos'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>3. Hábitos</span>
        </button>
      </div>

      {/* Main Tab Content Card */}
      <Card className="border-slate-200/80 shadow-xs bg-white">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            {/* ======================================================== */}
            {/* ABA 1 — PESSOAL                                          */}
            {/* ======================================================== */}
            {activeTab === 'pessoal' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    Informações Pessoais de Contato
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dados básicos de identificação e canais de comunicação com o paciente.
                  </p>
                </div>

                {/* Nome completo (obrigatório) */}
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    Nome Completo <span className="text-emerald-600">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Mariana Silveira Mendes"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="text-sm font-medium"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Este é o único campo obrigatório para o cadastro.
                  </span>
                </div>

                {/* Data de nascimento + Cálculo automático de Idade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Data de Nascimento
                    </label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Idade (calculada automaticamente)
                    </label>
                    <div className="h-10 px-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-sm">
                      <span className="text-slate-700 font-semibold">
                        {idade !== null ? `${idade} anos` : 'Aguardando data de nascimento'}
                      </span>
                      {idade !== null && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium">
                          Calculado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sexo (seleção única) */}
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-2">
                    Sexo
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Feminino', 'Masculino', 'Outro'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSexo(s)}
                        className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                          sexo === s
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Telefones (Telefone + WhatsApp com formatação) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Telefone
                    </label>
                    <Input
                      type="text"
                      placeholder="(11) 98765-4321"
                      value={telefone}
                      onChange={handleTelefoneChange}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-800">
                        WhatsApp
                      </label>
                      {telefone && (
                        <button
                          type="button"
                          onClick={copiarTelefoneParaWhatsapp}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Mesmo do telefone
                        </button>
                      )}
                    </div>
                    <Input
                      type="text"
                      placeholder="(11) 98765-4321"
                      value={whatsapp}
                      onChange={handleWhatsappChange}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="mariana@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-sm"
                  />
                </div>

                {/* Botão de avançar aba */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setActiveTab('clinico')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    Próximo: Dados Clínicos
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* ABA 2 — CLÍNICO                                          */}
            {/* ======================================================== */}
            {activeTab === 'clinico' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-emerald-600" />
                    Avaliação Antropométrica e Clínica
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Métricas corporais, objetivos nutricionais e histórico patológico.
                  </p>
                </div>

                {/* Peso, Altura e IMC (calculado automaticamente, somente leitura) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                  {/* Peso atual */}
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Peso atual
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 68.5"
                        value={pesoKg}
                        onChange={(e) => setPesoKg(e.target.value)}
                        className="pr-10 text-sm font-semibold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        kg
                      </span>
                    </div>
                  </div>

                  {/* Altura em cm */}
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Altura
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="1"
                        placeholder="Ex: 168"
                        value={alturaCm}
                        onChange={(e) => setAlturaCm(e.target.value)}
                        className="pr-10 text-sm font-semibold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        cm
                      </span>
                    </div>
                  </div>

                  {/* IMC (somente leitura) */}
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      IMC (calculado automaticamente)
                    </label>
                    <div className="h-10 px-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                      {imcCalculado ? (
                        <>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {imcCalculado.imc} <span className="text-[10px] text-slate-400 font-normal">kg/m²</span>
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${imcCalculado.badgeClass}`}>
                            {imcCalculado.classificacao}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Preencha peso e altura
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Objetivo (Múltipla escolha + campo livre adicional) */}
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-2">
                    Objetivo Principal (múltipla escolha)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {OBJETIVOS_OPCOES.map((obj) => {
                      const isSelected = objetivosSelecionados.includes(obj);
                      return (
                        <button
                          key={obj}
                          type="button"
                          onClick={() =>
                            toggleArrayItem(obj, objetivosSelecionados, setObjetivosSelecionados)
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {obj}
                        </button>
                      );
                    })}
                  </div>

                  <Input
                    type="text"
                    placeholder="Objetivo complementar ou observações sobre metas (campo livre)..."
                    value={objetivoTextoLivre}
                    onChange={(e) => setObjetivoTextoLivre(e.target.value)}
                    className="text-xs"
                  />
                </div>

                {/* Nível de atividade física (seleção única) */}
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-2">
                    Nível de atividade física
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {NIVEIS_ATIVIDADE.map((item) => {
                      const isSelected = nivelAtividade === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setNivelAtividade(item.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-semibold text-xs text-slate-900 leading-tight">
                            {item.label}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {item.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Patologias ou condições de saúde */}
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-2">
                    Patologias ou condições de saúde
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        toggleArrayItem('Nenhum', patologiasSelecionadas, setPatologiasSelecionadas)
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        patologiasSelecionadas.includes('Nenhum')
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {patologiasSelecionadas.includes('Nenhum') && '✓ '}
                      Nenhum
                    </button>

                    {PATOLOGIAS_PADRAO.map((p) => {
                      const isSelected = patologiasSelecionadas.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() =>
                            toggleArrayItem(p, patologiasSelecionadas, setPatologiasSelecionadas)
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {p}
                        </button>
                      );
                    })}

                    {/* Exibe patologias customizadas adicionadas */}
                    {patologiasSelecionadas
                      .filter((p) => p !== 'Nenhum' && !PATOLOGIAS_PADRAO.includes(p))
                      .map((custom) => (
                        <span
                          key={custom}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 text-white flex items-center gap-1.5 shadow-xs"
                        >
                          {custom}
                          <button
                            type="button"
                            onClick={() =>
                              removeCustomItem(
                                custom,
                                patologiasSelecionadas,
                                setPatologiasSelecionadas
                              )
                            }
                            className="hover:text-red-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                  </div>

                  {/* Campo para adicionar patologia livremente */}
                  <div className="flex gap-2 max-w-md">
                    <Input
                      type="text"
                      placeholder="Outra patologia ou condição..."
                      value={novaPatologia}
                      onChange={(e) => setNovaPatologia(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomItem(
                            novaPatologia,
                            setNovaPatologia,
                            patologiasSelecionadas,
                            setPatologiasSelecionadas
                          );
                        }
                      }}
                      className="text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addCustomItem(
                          novaPatologia,
                          setNovaPatologia,
                          patologiasSelecionadas,
                          setPatologiasSelecionadas
                        )
                      }
                      className="border-slate-200 text-slate-700 text-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Restrições alimentares */}
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-2">
                    Restrições alimentares
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        toggleArrayItem('Nenhum', restricoesSelecionadas, setRestricoesSelecionadas)
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        restricoesSelecionadas.includes('Nenhum')
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {restricoesSelecionadas.includes('Nenhum') && '✓ '}
                      Nenhum
                    </button>

                    {RESTRICOES_PADRAO.map((r) => {
                      const isSelected = restricoesSelecionadas.includes(r);
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() =>
                            toggleArrayItem(r, restricoesSelecionadas, setRestricoesSelecionadas)
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {r}
                        </button>
                      );
                    })}

                    {restricoesSelecionadas
                      .filter((r) => r !== 'Nenhum' && !RESTRICOES_PADRAO.includes(r))
                      .map((custom) => (
                        <span
                          key={custom}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 text-white flex items-center gap-1.5 shadow-xs"
                        >
                          {custom}
                          <button
                            type="button"
                            onClick={() =>
                              removeCustomItem(
                                custom,
                                restricoesSelecionadas,
                                setRestricoesSelecionadas
                              )
                            }
                            className="hover:text-red-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                  </div>

                  <div className="flex gap-2 max-w-md">
                    <Input
                      type="text"
                      placeholder="Outra restrição alimentar..."
                      value={novaRestricao}
                      onChange={(e) => setNovaRestricao(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomItem(
                            novaRestricao,
                            setNovaRestricao,
                            restricoesSelecionadas,
                            setRestricoesSelecionadas
                          );
                        }
                      }}
                      className="text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addCustomItem(
                          novaRestricao,
                          setNovaRestricao,
                          restricoesSelecionadas,
                          setRestricoesSelecionadas
                        )
                      }
                      className="border-slate-200 text-slate-700 text-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Alergias alimentares */}
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-2">
                    Alergias alimentares
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        toggleArrayItem('Nenhum', alergiasSelecionadas, setAlergiasSelecionadas)
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        alergiasSelecionadas.includes('Nenhum')
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {alergiasSelecionadas.includes('Nenhum') && '✓ '}
                      Nenhum
                    </button>

                    {ALERGIAS_PADRAO.map((a) => {
                      const isSelected = alergiasSelecionadas.includes(a);
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() =>
                            toggleArrayItem(a, alergiasSelecionadas, setAlergiasSelecionadas)
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {a}
                        </button>
                      );
                    })}

                    {alergiasSelecionadas
                      .filter((a) => a !== 'Nenhum' && !ALERGIAS_PADRAO.includes(a))
                      .map((custom) => (
                        <span
                          key={custom}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 text-white flex items-center gap-1.5 shadow-xs"
                        >
                          {custom}
                          <button
                            type="button"
                            onClick={() =>
                              removeCustomItem(
                                custom,
                                alergiasSelecionadas,
                                setAlergiasSelecionadas
                              )
                            }
                            className="hover:text-red-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                  </div>

                  <div className="flex gap-2 max-w-md">
                    <Input
                      type="text"
                      placeholder="Outra alergia alimentar..."
                      value={novaAlergia}
                      onChange={(e) => setNovaAlergia(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomItem(
                            novaAlergia,
                            setNovaAlergia,
                            alergiasSelecionadas,
                            setAlergiasSelecionadas
                          );
                        }
                      }}
                      className="text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addCustomItem(
                          novaAlergia,
                          setNovaAlergia,
                          alergiasSelecionadas,
                          setAlergiasSelecionadas
                        )
                      }
                      className="border-slate-200 text-slate-700 text-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Medicamentos e Suplementos (texto livre) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Medicamentos contínuos (texto livre)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ex: Levotiroxina 50mcg em jejum..."
                      value={medicamentos}
                      onChange={(e) => setMedicamentos(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Suplementos em uso (texto livre)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ex: Whey protein, Creatina 5g, Vitamina D..."
                      value={suplementos}
                      onChange={(e) => setSuplementos(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Botões de navegação */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('pessoal')}
                    className="border-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Voltar: Pessoal
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setActiveTab('habitos')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    Próximo: Hábitos
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* ABA 3 — HÁBITOS                                          */}
            {/* ======================================================== */}
            {activeTab === 'habitos' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-emerald-600" />
                    Rotina Diária e Hábitos de Vida
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Horários, ingestão hídrica, atividade física e observações de conduta.
                  </p>
                </div>

                {/* Quantas refeições por dia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Quantas refeições faz por dia
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="Ex: 4"
                        value={refeicoesPorDia}
                        onChange={(e) => setRefeicoesPorDia(e.target.value)}
                        className="text-sm font-semibold pr-20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                        refeições/dia
                      </span>
                    </div>
                  </div>

                  {/* Quantidade de água por dia */}
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Quantidade de água por dia
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 2.5"
                        value={litrosAgua}
                        onChange={(e) => setLitrosAgua(e.target.value)}
                        className="text-sm font-semibold pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        litros
                      </span>
                    </div>
                  </div>
                </div>

                {/* Horários: Acorda e Dorme (conversão automática) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1 flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      Horário que acorda
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: 6 → 06:00 ou 630 → 06:30"
                      value={horarioAcorda}
                      onChange={(e) => setHorarioAcorda(e.target.value)}
                      onBlur={handleHorarioAcordaBlur}
                      className="text-sm bg-white"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Digite ex: 6 (converte para 06:00) ou 630 (06:30)
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1 flex items-center gap-1.5">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      Horário que dorme
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: 23 → 23:00 ou 2230 → 22:30"
                      value={horarioDorme}
                      onChange={(e) => setHorarioDorme(e.target.value)}
                      onBlur={handleHorarioDormeBlur}
                      className="text-sm bg-white"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Digite ex: 23 (converte para 23:00) ou 2230 (22:30)
                    </span>
                  </div>
                </div>

                {/* Pratica atividade física (sim/não) */}
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-2">
                    Pratica atividade física?
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPraticaAtividadeFisica(true)}
                      className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                        praticaAtividadeFisica
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => setPraticaAtividadeFisica(false)}
                      className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                        !praticaAtividadeFisica
                          ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      Não
                    </button>
                  </div>

                  {/* Se sim, abre campo de texto: qual atividade e frequência semanal */}
                  {praticaAtividadeFisica && (
                    <div className="mt-3 animate-in fade-in duration-200">
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Qual atividade física e frequência semanal?
                      </label>
                      <Input
                        type="text"
                        placeholder="Ex: Musculação 4x na semana, corrida aos sábados..."
                        value={atividadeFisicaDescricao}
                        onChange={(e) => setAtividadeFisicaDescricao(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Observações gerais */}
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    Observações gerais
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Histórico alimentar pregresso, rotina familiar, preferências ou outras anotações importantes..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Botões finais */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('clinico')}
                    className="border-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Voltar: Clínico
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6 shadow-md shadow-emerald-600/20"
                  >
                    {saving ? (
                      'Salvando no Neon...'
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Finalizar e Cadastrar Paciente
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
