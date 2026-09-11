import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import logo from '../assets/logo.jpeg';
import { ROOMS_CONFIG } from '../data/mockData';
import { RoomId, NavigationTab } from '../types';
import {
  LayoutDashboard,
  Sparkles,
  Trophy,

  Database,
  FileSpreadsheet,
  ShieldCheck,
  ChevronRight,
  X,
  User,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Lock,
  Flame,
  Droplets,
  Syringe,
  Boxes,
} from 'lucide-react';

interface SidebarProps {
  currentView: NavigationTab;
  selectedRoomId: RoomId | null;
  onSelectView: (view: NavigationTab) => void;
  onSelectRoom: (roomId: RoomId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenSupabaseModal: () => void;
  onOpenAuthModal: () => void;
  onOpenImportModal: () => void;
}

const getRoomIcon = (roomId: RoomId) => {
  switch (roomId) {
    case 'unitarizacao':
      return <Sparkles className="w-4 h-4" />;
    case 'controlados':
      return <Lock className="w-4 h-4" />;
    case 'quimioterapicos':
      return <Flame className="w-4 h-4" />;
    case 'mavs':
      return <AlertTriangle className="w-4 h-4" />;
    case 'injetaveis':
      return <Syringe className="w-4 h-4" />;
    case 'soros':
      return <Droplets className="w-4 h-4" />;
    case 'multidoses':
      return <Boxes className="w-4 h-4" />;
    default:
      return <Layers className="w-4 h-4" />;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  selectedRoomId,
  onSelectView,
  onSelectRoom,
  isOpenMobile,
  onCloseMobile,
  onOpenSupabaseModal,
  onOpenAuthModal,
  onOpenImportModal,
}) => {
  const { user, isChefe, canAccessRoom } = useAuth();
  const { getRoomSummary, getGlobalSummary, activeMonth } = useInventory();
  const globalSummary = getGlobalSummary(activeMonth);

  const handleNavClick = (view: NavigationTab) => {
    onSelectView(view);
    onCloseMobile();
  };

  const handleRoomClick = (roomId: RoomId) => {
    if (canAccessRoom(roomId)) {
      onSelectRoom(roomId);
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#16382a]/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-[#E1E9E4] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh)] lg:sticky lg:top-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div className="p-4 sm:p-5 border-b border-[#E1E9E4] flex items-center justify-between shrink-0 bg-[#F8FAF9]">
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <img src={logo} alt="Painel e Indicadores Hospitalar" className="w-12 h-12 rounded-xl object-contain shadow-xs bg-white" />
            <div>
              <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 mb-0.5">
                DEMO
              </span>
              <p className="text-[10px] text-[#527365] font-medium">
                Farmácia Hospitalar & Estoque
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[#527365] hover:text-[#2D3A35] hover:bg-[#EBF1EE] lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global KPI Quick Badge */}
        <div className="px-4 py-3 bg-[#EBF1EE]/70 border-b border-[#E1E9E4] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2D5A47] animate-pulse" />
            <span className="font-bold text-[#2D5A47] text-[11px]">
              Mês: {activeMonth}
            </span>
          </div>
          <span className="font-mono font-bold text-xs text-[#2D5A47] bg-white px-2 py-0.5 rounded-md border border-[#CBDED5]">
            {globalSummary.overallAccuracy}% Acurácia
          </span>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">
          {/* Main Navigation Topics */}
          <div>
            <span className="px-3 text-[10px] font-bold tracking-widest text-[#527365] uppercase block mb-1.5">
              PAINEL GERAL
            </span>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-[#2D5A47] text-white shadow-xs'
                    : 'text-[#2D3A35] hover:bg-[#EBF1EE] hover:text-[#2D5A47]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Visão Geral Executiva</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${currentView === 'dashboard' ? 'text-white' : ''}`} />
              </button>

              <button
                onClick={() => handleNavClick('hygiene')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentView === 'hygiene'
                    ? 'bg-[#2D5A47] text-white shadow-xs'
                    : 'text-[#2D3A35] hover:bg-[#EBF1EE] hover:text-[#2D5A47]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Limpeza & Organização</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  currentView === 'hygiene'
                    ? 'bg-[#244b3b] text-emerald-100'
                    : 'bg-[#EBF1EE] text-[#2D5A47] border border-[#CBDED5]'
                }`}>
                  {globalSummary.hygieneAccuracy}%
                </span>
              </button>

              <button
                onClick={() => handleNavClick('ranking')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentView === 'ranking'
                    ? 'bg-[#2D5A47] text-white shadow-xs'
                    : 'text-[#2D3A35] hover:bg-[#EBF1EE] hover:text-[#2D5A47]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Ranking & Desempenho</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${currentView === 'ranking' ? 'text-white' : ''}`} />
              </button>

              <button
                onClick={() => handleNavClick('production')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentView === 'production'
                    ? 'bg-[#2D5A47] text-white shadow-xs'
                    : 'text-[#2D3A35] hover:bg-[#EBF1EE] hover:text-[#2D5A47]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Unitarização de Doses</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  currentView === 'production'
                    ? 'bg-[#244b3b] text-emerald-100'
                    : 'bg-[#EBF1EE] text-[#2D5A47]'
                }`}>
                  Produção
                </span>
              </button>
            </div>
          </div>

          {/* Individual Rooms Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1.5">
              <span className="text-[10px] font-bold tracking-widest text-[#527365] uppercase">
                SALAS DA CAF (TÓPICOS)
              </span>
              <span className="text-[10px] text-[#527365] font-mono font-bold">
                6 salas
              </span>
            </div>

            <div className="space-y-1">
              {ROOMS_CONFIG.map((room) => {
                const summary = getRoomSummary(room.id, activeMonth);
                const isSelected = currentView === 'room' && selectedRoomId === room.id;
                const canAccess = canAccessRoom(room.id);

                return (
                  <button
                    key={room.id}
                    onClick={() => handleRoomClick(room.id)}
                    disabled={!canAccess}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition text-left cursor-pointer group ${
                      isSelected
                        ? 'bg-[#2D5A47] text-white shadow-xs font-bold'
                        : canAccess
                        ? 'text-[#2D3A35] hover:bg-[#EBF1EE] hover:text-[#2D5A47] font-medium'
                        : 'text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      <div className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-[#244b3b] text-white'
                          : 'bg-[#EBF1EE] text-[#2D5A47] group-hover:bg-white'
                      }`}>
                        {getRoomIcon(room.id)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold leading-tight">
                          {room.shortName}
                        </p>
                        <p className={`text-[10px] truncate ${
                          isSelected ? 'text-[#CBDED5]' : 'text-[#527365]'
                        }`}>
                          {summary.totalItems} itens
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {summary.hygieneStatus === 'conforme' && (
                        <CheckCircle2 className={`w-3.5 h-3.5 ${
                          isSelected ? 'text-emerald-300' : 'text-[#2D5A47]'
                        }`} />
                      )}
                      <span className={`font-mono text-xs font-black ${
                        isSelected
                          ? 'text-white'
                          : summary.accuracyPercentage >= 95
                          ? 'text-[#2D5A47]'
                          : summary.accuracyPercentage >= 85
                          ? 'text-[#E67E22]'
                          : 'text-[#D32F2F]'
                      }`}>
                        {summary.accuracyPercentage}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Tools & Integration — apenas para a chefia */}
          {isChefe && (
            <div>
              <span className="px-3 text-[10px] font-bold tracking-widest text-[#527365] uppercase block mb-1.5">
                FERRAMENTAS & DADOS
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onOpenImportModal();
                    onCloseMobile();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#2D3A35] hover:bg-[#EBF1EE] hover:text-[#2D5A47] transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#2D5A47]" />
                  <span>Importar Planilha (Excel)</span>
                </button>

                <button
                  onClick={() => {
                    onOpenSupabaseModal();
                    onCloseMobile();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#2D3A35] hover:bg-[#EBF1EE] hover:text-[#2D5A47] transition cursor-pointer"
                >
                  <Database className="w-4 h-4 text-[#2D5A47]" />
                  <span>Sincronização Supabase</span>
                </button>

                <button
                  onClick={() => {
                    onOpenAuthModal();
                    onCloseMobile();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#2D3A35] hover:bg-[#EBF1EE] hover:text-[#2D5A47] transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#2D5A47]" />
                  <span>Controle de Acesso / Login</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Card Footer */}
        <div className="p-3 border-t border-[#E1E9E4] bg-[#F8FAF9] shrink-0">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#E1E9E4]">
            <div className="w-8 h-8 rounded-full bg-[#2D5A47] text-white flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#2D3A35] truncate leading-none">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-[10px] text-[#2D5A47] font-semibold truncate mt-0.5">
                {isChefe ? 'Chefia da Unidade' : `Resp. ${user?.roomId?.toUpperCase()}`}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
