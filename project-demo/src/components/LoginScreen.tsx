import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, UserCheck, KeyRound, AlertCircle, Info } from 'lucide-react';
import logo from '../assets/logo.jpeg';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = login(username, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Credenciais inválidas.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F3F7F5] p-4">
      <div className="bg-white border border-[#E1E9E4] rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Logo */}
        <div className="flex flex-col items-center px-6 pt-10 pb-4">
          <img src={logo} alt="Dash Indicadores Hospitalar" className="w-72 h-auto object-contain" />
          <p className="text-xs text-[#527365] mt-2">
            Faça login para acessar o painel de controle
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#EBF1EE] border border-[#CBDED5] text-[#2D5A47]">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <p className="font-bold">Modo Demonstração</p>
              <p>
                Este é um projeto de portfólio com dados fictícios, sem conexão com nenhum banco real.
                Use <strong>adm</strong> / <strong>adm</strong> (acesso total) ou{' '}
                <strong>rafael.andrade</strong> / <strong>demo123</strong> (uma sala) para explorar.
              </p>
            </div>
          </div>

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
                  placeholder="Digite seu usuário"
                  autoFocus
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
                  placeholder="Digite sua senha"
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
