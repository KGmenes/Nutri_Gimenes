import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar, NavItem } from '@/components/layout/Sidebar';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { PatientsView } from '@/components/patients/PatientsView';
import { Menu, Leaf } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const [currentNav, setCurrentNav] = useState<NavItem>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redireciona para o perfil do paciente
  const handleSelectPatientFromDashboard = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentNav('pacientes');
  };

  const handleNavigate = (nav: NavItem) => {
    setCurrentNav(nav);
    if (nav !== 'pacientes') {
      setSelectedPatientId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Menu lateral fixo com logotipo "Nutri Gimenes" no topo */}
      <Sidebar
        currentNav={currentNav}
        onNavigate={handleNavigate}
        onLogout={onLogout}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Area (deslocada para a direita da sidebar fixa) */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-base">Nutri Gimenes</span>
            </div>
          </div>

          <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {user?.name?.split(' ')[0] || 'Nutricionista'}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentNav === 'dashboard' ? (
            <DashboardOverview
              onNavigateToPatients={() => handleNavigate('pacientes')}
              onSelectPatient={handleSelectPatientFromDashboard}
            />
          ) : (
            <PatientsView
              initialSelectedPatientId={selectedPatientId}
              onClearSelectedPatient={() => setSelectedPatientId(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
};
