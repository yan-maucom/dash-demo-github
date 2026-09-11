import React, { useState, useEffect } from 'react';
import { RoomId } from '../types';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { HYGIENE_CHECKLIST_ITEMS } from '../data/mockData';
import {
  CheckCircle2,
  XCircle,
  Save,
  X,
  ClipboardCheck,
  Lock,
} from 'lucide-react';

interface HygieneEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: RoomId;
  roomName: string;
}

export const HygieneEvaluationModal: React.FC<HygieneEvaluationModalProps> = ({
  isOpen,
  onClose,
  roomId,
  roomName,
}) => {
  const { getRoomHygiene, saveHygieneEvaluation, activeMonth } = useInventory();
  const { user, isChefe } = useAuth();

  const currentEval = getRoomHygiene(roomId, activeMonth);
  const totalItems = HYGIENE_CHECKLIST_ITEMS.length;

  const buildDefaultChecklist = (): Record<string, boolean> =>
    Object.fromEntries(HYGIENE_CHECKLIST_ITEMS.map((item) => [item.id, true]));

  const [checklist, setChecklist] = useState<Record<string, boolean>>(buildDefaultChecklist);
  const [observations, setObservations] = useState('');
  const [correctiveActions, setCorrectiveActions] = useState('');

  useEffect(() => {
    if (currentEval) {
      const merged = buildDefaultChecklist();
      HYGIENE_CHECKLIST_ITEMS.forEach((item) => {
        if (item.id in currentEval.checklist) {
          merged[item.id] = currentEval.checklist[item.id];
        }
      });
      setChecklist(merged);
      setObservations(currentEval.observations || '');
      setCorrectiveActions(currentEval.correctiveActions || '');
    } else {
      setChecklist(buildDefaultChecklist());
      setObservations('');
      setCorrectiveActions('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEval, isOpen]);

  if (!isOpen) return null;

  const trueCount = Object.values(checklist).filter(Boolean).length;
  const computedScore = totalItems > 0 ? Math.round((trueCount / totalItems) * 100) : 0;
  // O resultado (Conforme / Não Conforme) é definido pela própria lista:
  // só é "Conforme" quando TODOS os itens do checklist estão marcados.
  // Não existe mais um botão manual desconectado da avaliação.
  const status: 'conforme' | 'nao_conforme' = trueCount === totalItems ? 'conforme' : 'nao_conforme';

  const toggleItem = (id: string) => {
    if (!isChefe) return;
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isChefe) return;
    saveHygieneEvaluation({
      roomId,
      monthYear: activeMonth,
      status,
      score: computedScore,
      evaluatorName: user?.name || 'Chefia da Unidade',
      checklist,
      observations: observations.trim() || undefined,
      correctiveActions: correctiveActions.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E1E9E4] rounded-2xl shadow-xl max-w-xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E9E4] bg-[#F8FAF9] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#EBF1EE] text-[#2D5A47] rounded-xl">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[#23332B] text-base">
                Avaliação de Limpeza & Organização
              </h3>
              <p className="text-xs text-[#527365]">
                {roomName} • Mês de Referência: <span className="font-bold text-[#23332B]">{activeMonth}</span>
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

        {!isChefe && (
          <div className="px-6 pt-4 shrink-0">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Somente a chefia pode realizar ou alterar este checklist. Você está em modo de visualização.</span>
            </div>
          </div>
        )}

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Resultado calculado automaticamente a partir do checklist */}
          <div className="space-y-2">
            <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider">
              Resultado da Avaliação (calculado pela lista abaixo)
            </label>
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 font-bold text-xs ${
                status === 'conforme'
                  ? 'bg-[#2D5A47] text-white border-[#2D5A47] shadow-xs'
                  : 'bg-[#D32F2F] text-white border-[#D32F2F] shadow-xs'
              }`}
            >
              {status === 'conforme' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CONFORME — {computedScore}% dos itens atendidos</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>NÃO CONFORME — {computedScore}% dos itens atendidos ({trueCount}/{totalItems})</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-[#527365] italic">
              Só fica "Conforme" quando todos os {totalItems} itens do checklist estiverem marcados. Desmarque abaixo o que não está sendo cumprido.
            </p>
          </div>

          {/* Checklist items */}
          <div className="p-4 rounded-xl bg-[#EBF1EE] border border-[#CBDED5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#2D5A47] uppercase tracking-wider">
                Checklist de Armazenamento e Boas Práticas
              </span>
              <span className="text-xs font-bold text-[#2D5A47]">
                {computedScore}% Conforme ({trueCount}/{totalItems})
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-[#23332B]">
              {HYGIENE_CHECKLIST_ITEMS.map((item, idx) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-2.5 p-1.5 rounded-lg transition ${
                    isChefe ? 'cursor-pointer hover:bg-white' : 'cursor-default opacity-90'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.id] ?? false}
                    disabled={!isChefe}
                    onChange={() => toggleItem(item.id)}
                    className="w-4 h-4 mt-0.5 text-[#2D5A47] rounded cursor-pointer accent-[#2D5A47] disabled:cursor-not-allowed shrink-0"
                  />
                  <span>
                    {idx + 1}. {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1">
              Observações e Pontos de Destaque
            </label>
            <textarea
              rows={2}
              value={observations}
              disabled={!isChefe}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Descreva observações gerais sobre a conservação e organização da sala..."
              className="w-full px-3.5 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs font-medium text-[#23332B] focus:outline-none focus:border-[#2D5A47] disabled:opacity-70"
            />
          </div>

          {/* Corrective actions if not conforme */}
          {status === 'nao_conforme' && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
              <label className="block text-[10px] font-bold text-[#D32F2F] uppercase tracking-wider">
                Ações Corretivas Solicitadas *
              </label>
              <textarea
                rows={2}
                value={correctiveActions}
                disabled={!isChefe}
                onChange={(e) => setCorrectiveActions(e.target.value)}
                placeholder="Especifique as medidas que o responsável da sala deve executar para adequação..."
                className="w-full px-3.5 py-2 bg-white border border-rose-300 rounded-xl text-xs font-medium text-[#23332B] focus:outline-none focus:border-[#D32F2F] disabled:opacity-70"
                required={isChefe}
              />
            </div>
          )}

          {/* Footer note */}
          <p className="text-[11px] text-[#527365] italic">
            {currentEval
              ? `Última avaliação por: ${currentEval.evaluatorName}`
              : 'Ainda não há avaliação registrada para este mês.'}
          </p>

          <div className="pt-2 border-t border-[#E1E9E4] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#527365] hover:bg-[#EBF1EE] rounded-xl transition cursor-pointer"
            >
              {isChefe ? 'Cancelar' : 'Fechar'}
            </button>
            {isChefe && (
              <button
                type="submit"
                className="px-5 py-2 bg-[#2D5A47] hover:bg-[#244b3b] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Avaliação da Sala</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
