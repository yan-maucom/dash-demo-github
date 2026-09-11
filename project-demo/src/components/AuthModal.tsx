import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, UserCheck, Shield, KeyRound, AlertCircle, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, login, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = login(username, password);
    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Credenciais inválidas.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E1E9E4] rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E9E4] bg-[#F8FAF9]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#EBF1EE] text-[#2D5A47] rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[#23332B] text-base">
                Controle de Acesso - CAF
              </h3>
              <p className="text-xs text-[#527365]">
                Hospitalar & Farmácia Central
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#527365] hover:text-[#23332B] rounded-xl hover:bg-[#EBF1EE] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current user badge */}
          {user && (
            <div className="p-3.5 rounded-xl bg-[#EBF1EE] border border-[#CBDED5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2D5A47] text-white flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#527365] font-medium">
                    Usuário Conectado:
                  </p>
                  <p className="text-sm font-bold text-[#23332B]">
                    {user.name}
                  </p>
                  <span className="inline-block mt-0.5 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-[#2D5A47] text-white">
                    {user.role === 'chefe' ? 'Chefia da Unidade' : `Resp. ${user.roomId?.toUpperCase()}`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="text-xs text-[#D32F2F] hover:underline font-semibold px-2 py-1 cursor-pointer"
              >
                Desconectar
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1.5">
                Usuário / Login da Sala
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-[#527365] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: chefe, unitarizacao, controlados..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs font-medium text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#527365] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha (padrão: 1234)"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs font-medium text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 text-[#D32F2F] border border-rose-200 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#2D5A47] hover:bg-[#244b3b] text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
