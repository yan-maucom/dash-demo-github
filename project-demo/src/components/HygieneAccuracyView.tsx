import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { ROOMS_CONFIG } from '../data/mockData';
import { RoomId } from '../types';
import { HygieneEvaluationModal } from './HygieneEvaluationModal';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ClipboardCheck,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface HygieneAccuracyViewProps {
  onSelectRoom: (roomId: RoomId) => void;
}

export const HygieneAccuracyView: React.FC<HygieneAccuracyViewProps> = ({ onSelectRoom }) => {
  const { getRoomHygiene, getGlobalSummary, activeMonth } = useInventory();
  const { isChefe, canAccessRoom } = useAuth();
  const globalSummary = getGlobalSummary(activeMonth);

  const [selectedRoomForEval, setSelectedRoomForEval] = useState<RoomId | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenEval = (roomId: RoomId) => {
    setSelectedRoomForEval(roomId);
    setIsModalOpen(true);
  };

  const activeRoomObj = ROOMS_CONFIG.find((r) => r.id === selectedRoomForEval) || ROOMS_CONFIG[0];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner - Acurácia de Limpeza & Organização */}
      <div className="rounded-2xl overflow-hidden bg-[#2D5A47] text-white p-6 sm:p-7 shadow-sm border border-[#244b3b] relative">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3D7860] text-emerald-100 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Auditoria de Boas Práticas Farmacêuticas & ANVISA RDC 67</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                Acurácia de Limpeza & Organização
              </h2>
              <p className="text-[#CBDED5] text-xs sm:text-sm leading-relaxed mt-1">
                Monitoramento mensal de conformidade sanitária, higienização terminal de bancadas,
                mapas térmicos, descarte correto e organização de estoque (PVPS) nas 6 salas da CAF.
              </p>
            </div>

            {/* Prominent Hygiene Accuracy Rate */}
            <div className="bg-[#244b3b] p-3.5 rounded-xl border border-[#3D7860] shrink-0 text-right sm:text-center min-w-[150px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#CBDED5] block">
                Acurácia Sanitária
              </span>
              <span className="text-3xl font-black font-mono text-white">
                {globalSummary.hygieneAccuracy}%
              </span>
              <span className="text-[10px] block text-emerald-200 mt-0.5 font-medium">
                {globalSummary.conformingHygieneRoomsCount} de 6 Salas Conformes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards for Cleanliness and Organization */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 1. Taxa Global de Conformidade */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#527365] uppercase tracking-wider">
              Acurácia de Higiene
            </span>
            <div className="p-1.5 bg-[#EBF1EE] text-[#2D5A47] rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#23332B] font-heading">
              {globalSummary.hygieneAccuracy}%
            </span>
            <span className="text-[11px] font-bold text-[#2D5A47]">
              {globalSummary.hygieneAccuracy >= 90 ? 'Excelente' : 'Requer Atenção'}
            </span>
          </div>
          <p className="text-[11px] text-[#527365]">
            Média ponderada do checklist RDC 67
          </p>
        </div>

        {/* 2. Salas 100% Conformes */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#527365] uppercase tracking-wider">
              Salas Conformes
            </span>
            <div className="p-1.5 bg-[#EBF1EE] text-[#2D5A47] rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2D5A47] font-heading">
              {globalSummary.conformingHygieneRoomsCount}
            </span>
            <span className="text-xs font-semibold text-[#527365]">
              de 6 Salas
            </span>
          </div>
          <p className="text-[11px] text-[#527365]">
            Aprovadas sem restrições sanitárias
          </p>
        </div>

        {/* 3. Salas Não Conformes / Pendências */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#527365] uppercase tracking-wider">
              Não Conformidades
            </span>
            <div className="p-1.5 bg-rose-50 text-[#D32F2F] rounded-lg">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#D32F2F] font-heading">
              {globalSummary.nonConformingHygieneRoomsCount}
            </span>
            <span className="text-[11px] font-bold text-[#D32F2F]">
              {globalSummary.nonConformingHygieneRoomsCount > 0 ? 'Ação Corretiva' : 'Nenhuma'}
            </span>
          </div>
          <p className="text-[11px] text-[#527365]">
            Salas com desvios no checklist
          </p>
        </div>

        {/* 4. Validade da Auditoria */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#527365] uppercase tracking-wider">
              Auditoria do Mês
            </span>
            <div className="p-1.5 bg-[#EBF1EE] text-[#2D5A47] rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-extrabold text-[#23332B] font-mono">
              {activeMonth}
            </span>
            <span className="text-[11px] font-semibold text-[#2D5A47]">
              Ativa
            </span>
          </div>
          <p className="text-[11px] text-[#527365]">
            Avaliação realizada pela chefia da unidade
          </p>
        </div>
      </div>

      {/* Room Checklist Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#527365] uppercase block mb-0.5">
              DETALHAMENTO SANITÁRIO POR SALA
            </span>
            <h3 className="font-heading font-extrabold text-xl text-[#23332B]">
              Checklists de Limpeza & Organização da CAF
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ROOMS_CONFIG.map((room) => {
            const evalData = getRoomHygiene(room.id, activeMonth);
            const isConforme = evalData?.status === 'conforme';
            const score = evalData?.score ?? 100;
            const canAccess = canAccessRoom(room.id);

            return (
              <div
                key={room.id}
                className="bg-white border border-[#E1E9E4] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
              >
                {/* Header of the Room Hygiene Card */}
                <div className="p-5 border-b border-[#E1E9E4] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#2D5A47] text-white">
                      {room.shortName}
                    </span>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                      evalData
                        ? isConforme
                          ? 'bg-[#EBF1EE] text-[#2D5A47] border border-[#CBDED5]'
                          : 'bg-rose-50 text-[#D32F2F] border border-rose-200'
                        : 'bg-[#F8FAF9] text-[#527365] border border-[#E1E9E4]'
                    }`}>
                      {evalData ? (
                        isConforme ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A47]" />
                            <span>Conforme ({score}%)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-[#D32F2F]" />
                            <span>Não Conforme ({score}%)</span>
                          </>
                        )
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Pendente</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-heading font-extrabold text-base text-[#23332B]">
                      {room.name}
                    </h4>
                    <p className="text-xs text-[#527365] line-clamp-1">
                      Resp: {room.responsibleName}
                    </p>
                  </div>

                  {/* Progress Bar of Hygiene Score */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#527365] font-medium">Acurácia do Checklist</span>
                      <span className="font-mono font-bold text-[#23332B]">{score}%</span>
                    </div>
                    <div className="w-full bg-[#EBF1EE] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          score >= 90 ? 'bg-[#2D5A47]' : score >= 70 ? 'bg-[#E67E22]' : 'bg-[#D32F2F]'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Checklist items breakdown */}
                <div className="p-5 space-y-2.5 text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#527365]">
                    Itens Inspecionados (RDC 67)
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[#23332B]">1. Piso e desinfecção terminal</span>
                      {evalData?.checklist.pisoLimpo ? (
                        <span className="text-[#2D5A47] font-bold text-[11px]">✓ OK</span>
                      ) : (
                        <span className="text-[#D32F2F] font-bold text-[11px]">✗ Desvio</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#23332B]">2. Bancadas e cabines c/ álcool 70%</span>
                      {evalData?.checklist.bancadasEsterilizadas ? (
                        <span className="text-[#2D5A47] font-bold text-[11px]">✓ OK</span>
                      ) : (
                        <span className="text-[#D32F2F] font-bold text-[11px]">✗ Desvio</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#23332B]">3. Organização por lote/validade (PVPS)</span>
                      {evalData?.checklist.identificacaoValidade ? (
                        <span className="text-[#2D5A47] font-bold text-[11px]">✓ OK</span>
                      ) : (
                        <span className="text-[#D32F2F] font-bold text-[11px]">✗ Desvio</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#23332B]">4. Mapas de temperatura / Umidade</span>
                      {evalData?.checklist.temperaturaUmidadeConforme ? (
                        <span className="text-[#2D5A47] font-bold text-[11px]">✓ OK</span>
                      ) : (
                        <span className="text-[#D32F2F] font-bold text-[11px]">✗ Desvio</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#23332B]">5. Lixeiras de pedal identificadas</span>
                      {evalData?.checklist.lixeirasPedalIdentificadas ? (
                        <span className="text-[#2D5A47] font-bold text-[11px]">✓ OK</span>
                      ) : (
                        <span className="text-[#D32F2F] font-bold text-[11px]">✗ Desvio</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#23332B]">6. Uso de EPIs obrigatórios</span>
                      {evalData?.checklist.episUtilizados ? (
                        <span className="text-[#2D5A47] font-bold text-[11px]">✓ OK</span>
                      ) : (
                        <span className="text-[#D32F2F] font-bold text-[11px]">✗ Desvio</span>
                      )}
                    </div>
                  </div>

                  {/* Observations or corrective actions */}
                  {evalData?.observations && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#F8FAF9] text-[11px] text-[#23332B] border border-[#E1E9E4]">
                      <strong className="text-[#2D5A47] block mb-0.5 font-semibold">Observação:</strong>
                      <span>{evalData.observations}</span>
                    </div>
                  )}

                  {evalData?.correctiveActions && (
                    <div className="mt-2 p-2.5 rounded-xl bg-rose-50 text-[11px] text-[#D32F2F] border border-rose-200">
                      <strong className="block mb-0.5 font-bold">Ação Corretiva Exigida:</strong>
                      <span>{evalData.correctiveActions}</span>
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="p-4 border-t border-[#E1E9E4] bg-[#F8FAF9] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEval(room.id)}
                    className="px-3 py-2 bg-white hover:bg-[#EBF1EE] text-[#2D5A47] border border-[#CBDED5] font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>{isChefe ? 'Avaliar / Atualizar' : 'Ver Detalhes'}</span>
                  </button>

                  <button
                    onClick={() => canAccess && onSelectRoom(room.id)}
                    disabled={!canAccess}
                    className="px-3 py-2 bg-[#2D5A47] hover:bg-[#244b3b] text-white font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <span>Abrir Sala</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hygiene Evaluation Modal */}
      {selectedRoomForEval && (
        <HygieneEvaluationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          roomId={selectedRoomForEval}
          roomName={activeRoomObj.name}
        />
      )}
    </div>
  );
};
