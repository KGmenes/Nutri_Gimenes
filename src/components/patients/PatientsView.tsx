import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchPacientes,
  fetchPacienteDetalhes,
  Paciente,
  Consulta,
} from '@/services/patientsService';
import { PatientList } from './PatientList';
import { PatientForm } from './PatientForm';
import { PatientProfile } from './PatientProfile';

interface PatientsViewProps {
  initialSelectedPatientId?: string | null;
  onClearSelectedPatient?: () => void;
  initialMode?: 'list' | 'new';
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  initialSelectedPatientId,
  onClearSelectedPatient,
  initialMode = 'list',
}) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'list' | 'new' | 'profile'>(() => {
    if (initialSelectedPatientId) return 'profile';
    return initialMode;
  });

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    initialSelectedPatientId || null
  );
  const [selectedPatientData, setSelectedPatientData] = useState<{
    paciente: Paciente;
    consultas: Consulta[];
  } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Mensagem de sucesso ao cadastrar
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const carregarLista = useCallback(async () => {
    if (!user?.id) return;
    setLoadingList(true);
    try {
      const data = await fetchPacientes(user.id);
      setPacientes(data);
    } catch (err) {
      console.error('Erro ao listar pacientes do Neon:', err);
    } finally {
      setLoadingList(false);
    }
  }, [user?.id]);

  useEffect(() => {
    carregarLista();
  }, [carregarLista]);

  const carregarDetalhes = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      setLoadingProfile(true);
      try {
        const data = await fetchPacienteDetalhes(id, user.id);
        setSelectedPatientData(data);
      } catch (err) {
        console.error('Erro ao carregar prontuário do paciente:', err);
      } finally {
        setLoadingProfile(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (selectedPatientId) {
      carregarDetalhes(selectedPatientId);
      setMode('profile');
    }
  }, [selectedPatientId, carregarDetalhes]);

  useEffect(() => {
    if (initialSelectedPatientId) {
      setSelectedPatientId(initialSelectedPatientId);
      setMode('profile');
    }
  }, [initialSelectedPatientId]);

  // Handler ao clicar em um paciente na lista
  const handleSelectPatient = (id: string) => {
    setSuccessBanner(null);
    setSelectedPatientId(id);
    setMode('profile');
  };

  // Handler para ir à tela de novo paciente
  const handleOpenNewPatientForm = () => {
    setSuccessBanner(null);
    setSelectedPatientId(null);
    setMode('new');
  };

  // Handler ao cancelar formulário
  const handleCancelForm = () => {
    setMode('list');
    setSelectedPatientId(null);
    if (onClearSelectedPatient) onClearSelectedPatient();
  };

  // Handler ao salvar novo paciente com sucesso
  const handleSuccessForm = async (newPatient: Paciente) => {
    await carregarLista();
    setSelectedPatientId(newPatient.id);
    setSuccessBanner(`Paciente "${newPatient.nome}" cadastrado com sucesso!`);
    setMode('profile');
  };

  // Handler ao voltar do perfil para a lista
  const handleBackToList = () => {
    setMode('list');
    setSelectedPatientId(null);
    setSelectedPatientData(null);
    setSuccessBanner(null);
    if (onClearSelectedPatient) onClearSelectedPatient();
  };

  // 1. TELA DE FORMULÁRIO DE CADASTRO (Página nova em 3 abas)
  if (mode === 'new') {
    return (
      <PatientForm
        onCancel={handleCancelForm}
        onSuccess={handleSuccessForm}
      />
    );
  }

  // 2. TELA DE PERFIL DO PACIENTE
  if (mode === 'profile' && selectedPatientId) {
    if (loadingProfile || !selectedPatientData) {
      return (
        <div className="p-12 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">
            Carregando prontuário do paciente...
          </p>
        </div>
      );
    }

    return (
      <PatientProfile
        paciente={selectedPatientData.paciente}
        consultas={selectedPatientData.consultas}
        onBack={handleBackToList}
        onRefresh={() => carregarDetalhes(selectedPatientId)}
        successMessage={successBanner}
      />
    );
  }

  // 3. TELA DE LISTAGEM DE PACIENTES
  return (
    <PatientList
      pacientes={pacientes}
      loading={loadingList}
      onNewPatient={handleOpenNewPatientForm}
      onSelectPatient={handleSelectPatient}
    />
  );
};
