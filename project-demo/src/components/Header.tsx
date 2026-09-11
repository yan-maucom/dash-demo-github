import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import logo from '../assets/logo.jpeg';
import { MonthSelector } from './MonthSelector';
import { AuthModal } from './AuthModal';
import { SupabaseModal } from './SupabaseModal';
import { UserManagementModal } from './UserManagementModal';
import { storageService } from '../services/storageService';
import {
  Menu,
  Shield,
  User,
  Users,
  Database,
  RotateCcw,
  ChevronDown,

} from 'lucide-react';

interface HeaderProps {
  onGoHome: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onGoHome, onToggleSidebar }) => {
  const { user, isChefe, logout } = useAuth();
  const { resetAllData } = useInventory();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const supabaseConfig = storageService.getSupabaseConfig();

  const handleReset = () => {
    if (window.confirm('Deseja restaurar os dados de exemplo padrão da CAF?')) {
      resetAllData();
      window.location.reload();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E1E9E4] transition-colors">
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
            {/* Left Hamburger & Title */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {/* Hamburger Button for Mobile & Tablet */}
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-xl text-[#2D5A47] hover:bg-[#EBF1EE] lg:hidden cursor-pointer transition"
                title="Abrir Menu de Tópicos"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div
                onClick={onGoHome}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <img src={logo} alt="Painel e Indicadores Hospitalar" className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain shadow-xs bg-white" />
                <div>
                  <h1 className="font-heading font-extrabold text-sm sm:text-base text-[#2D3A35] tracking-tight leading-tight flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      DEMO
                    </span>
                  </h1>
                  <p className="text-[10px] sm:text-[11px] text-[#527365] font-medium hidden sm:block">
                    Gestão de Estoque, Limpeza & Inventário
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Month Selector */}
            <div className="hidden md:flex items-center">
              <MonthSelector />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Supabase Status Button */}
              <button
                onClick={() => setIsSupabaseModalOpen(true)}
                title="Configurações do Banco Supabase"
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  supabaseConfig.connected
                    ? 'bg-[#EBF1EE] text-[#2D5A47] border-[#CBDED5] hover:bg-[#CBDED5]/60'
                    : 'bg-[#F8FAF9] text-[#527365] border-[#E1E9E4] hover:bg-[#EBF1EE]'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">
                  {supabaseConfig.connected ? 'Supabase Conectado' : 'Supabase'}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    supabaseConfig.connected ? 'bg-[#2D5A47] animate-pulse' : 'bg-slate-400'
                  }`}
                />
              </button>

              {/* User Profile Button / Dropdown */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-2.5 sm:py-1.5 bg-[#F8FAF9] hover:bg-[#EBF1EE] border border-[#E1E9E4] rounded-xl transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#2D5A47] text-white flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-bold text-[#2D3A35] leading-none truncate max-w-[120px]">
                        {user.name.split(' ')[0]}
                      </p>
                      <span className="text-[10px] font-semibold text-[#2D5A47]">
                        {isChefe ? 'Chefia da Unidade' : `${user.roomId?.toUpperCase()}`}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#527365]" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E1E9E4] rounded-2xl shadow-lg p-2 z-50 animate-fade-in">
                      <div className="p-2 border-b border-[#E1E9E4]">
                        <p className="text-xs font-bold text-[#2D3A35]">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-[#527365]">
                          {isChefe
                            ? 'Acesso total administrativo'
                            : `Responsável técnico: ${user.roomId}`}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setIsAuthModalOpen(true);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-[#2D3A35] hover:bg-[#EBF1EE] rounded-lg flex items-center gap-2 cursor-pointer transition"
                        >
                          <Shield className="w-3.5 h-3.5 text-[#2D5A47]" />
                          Trocar Usuário / Permissões
                        </button>
                        {isChefe && (
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              setIsUserManagementOpen(true);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-[#2D3A35] hover:bg-[#EBF1EE] rounded-lg flex items-center gap-2 cursor-pointer transition"
                          >
                            <Users className="w-3.5 h-3.5 text-[#2D5A47]" />
                            Gerenciar Usuários e Senhas
                          </button>
                        )}
                        {isChefe && (
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              handleReset();
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-[#2D3A35] hover:bg-[#EBF1EE] rounded-lg flex items-center gap-2 cursor-pointer transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                            Restaurar Dados Padrão
                          </button>
                        )}
                      </div>

                      <div className="pt-1 border-t border-[#E1E9E4]">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          Sair da Sessão
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1.5 bg-[#2D5A47] hover:bg-[#234737] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Entrar</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Month Selector */}
          <div className="flex md:hidden items-center justify-between pb-2.5 pt-1 border-t border-[#E1E9E4]">
            <MonthSelector />
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <SupabaseModal isOpen={isSupabaseModalOpen} onClose={() => setIsSupabaseModalOpen(false)} />
      <UserManagementModal isOpen={isUserManagementOpen} onClose={() => setIsUserManagementOpen(false)} />
    </>
  );
};

