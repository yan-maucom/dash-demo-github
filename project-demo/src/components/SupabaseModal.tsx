import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { Database, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState(() => storageService.getSupabaseConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await storageService.testSupabaseConnection();
    setIsTesting(false);
    setTestResult(res);
    setConfig(storageService.getSupabaseConfig());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E1E9E4] rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E9E4] bg-[#F8FAF9]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#EBF1EE] text-[#2D5A47] rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[#23332B] text-base">
                Banco de Dados Supabase
              </h3>
              <p className="text-xs text-[#527365]">
                Conexão automática — não é preciso configurar nada aqui
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

        <div className="p-6 space-y-5">
          {/* Status info box */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              config.connected
                ? 'bg-[#EBF1EE] border-[#CBDED5] text-[#2D5A47]'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {config.connected ? (
              <CheckCircle2 className="w-5 h-5 text-[#2D5A47] shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <p className="font-bold text-xs">
                {config.connected ? 'Supabase conectado' : 'Supabase não configurado'}
              </p>
              <p className="mt-0.5 opacity-90">
                {config.connected
                  ? 'As credenciais foram carregadas automaticamente das variáveis de ambiente do projeto. Todos os dados de inventário, produção e avaliações são lidos e salvos direto no seu banco Supabase.'
                  : 'Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente (arquivo .env local, ou nos Secrets do Google AI Studio / da hospedagem) e reinicie o app. A conexão passa a ser automática, sem precisar colar nada aqui.'}
              </p>
            </div>
          </div>

          {config.connected && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#E1E9E4]">
                <p className="text-[10px] font-semibold text-[#527365] uppercase tracking-wider">Projeto</p>
                <p className="font-mono text-[#23332B] mt-1 truncate">{config.url}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#E1E9E4]">
                <p className="text-[10px] font-semibold text-[#527365] uppercase tracking-wider">Última sincronização</p>
                <p className="text-[#23332B] mt-1">
                  {config.lastSync ? new Date(config.lastSync).toLocaleString('pt-BR') : '—'}
                </p>
              </div>
            </div>
          )}

          {/* Test feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                testResult.success
                  ? 'bg-[#EBF1EE] text-[#2D5A47] border-[#CBDED5]'
                  : 'bg-rose-50 text-[#D32F2F] border border-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className="px-4 py-2 bg-[#EBF1EE] hover:bg-[#dce6e1] text-[#2D5A47] text-xs font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testando...' : 'Testar Conexão'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#2D5A47] hover:bg-[#244b3b] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
