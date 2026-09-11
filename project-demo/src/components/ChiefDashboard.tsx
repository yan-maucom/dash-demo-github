import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { RoomCard } from './RoomCard';
import { RankingRooms } from './RankingRooms';
import { ROOMS_CONFIG } from '../data/mockData';
import { RoomId } from '../types';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react';

interface ChiefDashboardProps {
  onSelectRoom: (roomId: RoomId) => void;
  onNavigateToHygiene?: () => void;
}

export const ChiefDashboard: React.FC<ChiefDashboardProps> = ({ onSelectRoom, onNavigateToHygiene }) => {
  const { getGlobalSummary, getRoomSummary, activeMonth } = useInventory();
  const { canAccessRoom } = useAuth();

  const globalSummary = getGlobalSummary(activeMonth);

  return (
    <div className="space-y-7 animate-fade-in pb-12">
      {/* 1. TOP EXECUTIVE BANNER */}
      <div className="rounded-2xl overflow-hidden bg-[#2D5A47] text-white p-6 sm:p-7 shadow-sm border border-[#244b3b] relative">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3D7860] text-emerald-100 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gestão Integrada de Estoque e Farmácia Hospitalar (CAF)</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                Painel Executivo da CAF
              </h2>
              <p className="text-[#CBDED5] text-xs sm:text-sm leading-relaxed mt-1">
                Monitoramento completo das 6 salas hospitalares, acurácia de inventário físico vs AGHU,
                acurácia de limpeza e organização (RDC 67) e controle de validades.
              </p>
            </div>

            {/* Dual Accuracy Indicator Banner Badges */}
            <div className="flex items-center gap-3 shrink-0">
              <div
                onClick={onNavigateToHygiene}
                className="bg-[#244b3b] hover:bg-[#1e3e31] p-3.5 rounded-xl border border-[#3D7860] transition cursor-pointer text-center min-w-[130px]"
                title="Clique para ver detalhes de Limpeza & Organização"
              >
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#CBDED5] block">
                  Limpeza & Organização
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {globalSummary.hygieneAccuracy}%
                </span>
                <span className="text-[10px] block text-emerald-200 mt-0.5 font-medium">
                  {globalSummary.conformingHygieneRoomsCount}/6 Conformes
                </span>
              </div>

              <div className="bg-[#244b3b] p-3.5 rounded-xl border border-[#3D7860] text-center min-w-[130px]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#CBDED5] block">
                  Acurácia de Estoque
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {globalSummary.overallAccuracy}%
                </span>
                <span className="text-[10px] block text-emerald-200 mt-0.5 font-medium">
                  Físico vs AGHU
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs text-[#CBDED5]">
            <div className="flex items-center gap-1.5 bg-[#244b3b]/80 px-3 py-1.5 rounded-lg border border-[#3D7860]">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Auditoria Sanitária RDC 67 & Portaria 344</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#244b3b]/80 px-3 py-1.5 rounded-lg border border-[#3D7860]">
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span>Mês de Referência Ativo: {activeMonth}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Acurácia de Limpeza e Organização */}
        <div
          onClick={onNavigateToHygiene}
          className="bg-white border border-[#E1E9E4] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5 hover:border-[#2D5A47] hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#527365] uppercase tracking-wider group-hover:text-[#2D5A47] transition">
              Limpeza & Organização
            </span>
            <div className="p-1.5 bg-[#EBF1EE] text-[#2D5A47] rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#23332B] font-heading">
              {globalSummary.hygieneAccuracy}%
            </span>
            <span className="text-[11px] font-bold text-[#2D5A47]">
              {globalSummary.conformingHygieneRoomsCount}/6 OK
            </span>
          </div>
          <p className="text-[11px] text-[#527365] font-medium">
            Checklist RDC 67 / ANVISA
          </p>
        </div>

        {/* Acurácia de Estoque */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#527365] uppercase tracking-wider">
              Acurácia de Estoque
            </span>
            <div className="p-1.5 bg-[#EBF1EE] text-[#2D5A47] rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#23332B] font-heading">
              {globalSummary.overallAccuracy}%
            </span>
            <span className="text-[11px] font-bold text-[#2D5A47]">
              Meta 95%
            </span>
          </div>
          <p className="text-[11px] text-[#527365] font-medium">
            Contagem Física vs AGHU
          </p>
        </div>

        {/* Total Itens Cadastrados */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#527365] uppercase tracking-wider">
              Itens Cadastrados
            </span>
            <div className="p-1.5 bg-[#EBF1EE] text-[#2D5A47] rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#23332B] font-heading">
              {globalSummary.totalItems}
            </span>
            <span className="text-xs font-semibold text-[#527365]">
              Medicamentos
            </span>
          </div>
          <p className="text-[11px] text-[#527365] font-medium">
            {globalSummary.totalPhysical.toLocaleString('pt-BR')} unidades contadas
          </p>
        </div>

        {/* Alertas de Validade */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#527365] uppercase tracking-wider">
              Alertas de Validade
            </span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-heading">
              {globalSummary.criticalExpiryTotal + globalSummary.nearExpiryTotal}
            </span>
            <span className="text-[11px] font-bold text-rose-600">
              {globalSummary.criticalExpiryTotal} críticos (&lt;30d)
            </span>
          </div>
          <p className="text-[11px] text-[#527365] font-medium">
            Remanejamento PVPS
          </p>
        </div>
      </div>

      {/* 3. CARDS DAS SALAS DA CAF - POSITIONED AT THE TOP */}
      <div className="space-y-4 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#527365] uppercase block mb-1">
              ESTRUTURA FÍSICA & INVENTÁRIO
            </span>
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#23332B]">
              Salas da Unidade CAF
            </h3>
            <p className="text-xs sm:text-sm text-[#527365]">
              Selecione o card de qualquer sala para abrir a tabela de inventário estilo Excel, registrar contagens e exportar relatórios.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 bg-[#EBF1EE] text-[#2D5A47] border border-[#CBDED5] rounded-full w-fit">
            6 Salas Operacionais
          </span>
        </div>

        {/* The 6 Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ROOMS_CONFIG.map((room) => {
            const summary = getRoomSummary(room.id, activeMonth);
            const canAccess = canAccessRoom(room.id);

            return (
              <RoomCard
                key={room.id}
                room={room}
                summary={summary}
                onSelect={onSelectRoom}
                canAccess={canAccess}
              />
            );
          })}
        </div>
      </div>

      {/* 4. COMPARATIVE ACCURACY & RANKING SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Left 2 Cols: Accuracy Comparison Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E1E9E4] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#527365] uppercase block mb-1">
                AUDITORIA DE ESTOQUE & HIGIENE
              </span>
              <h3 className="font-heading font-extrabold text-[#23332B] text-lg">
                Comparativo de Acurácia por Sala
              </h3>
              <p className="text-xs text-[#527365]">
                Percentual de acerto físico vs AGHU e conformidade sanitária
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-[#EBF1EE] text-[#2D5A47] border border-[#CBDED5] rounded-full">
              Meta: 95%
            </span>
          </div>

          {/* Custom Horizontal Bar Comparison */}
          <div className="space-y-4 pt-1">
            {ROOMS_CONFIG.map((room) => {
              const summary = getRoomSummary(room.id, activeMonth);
              const pct = summary.accuracyPercentage;
              const isTargetMet = pct >= 95;

              return (
                <div
                  key={room.id}
                  onClick={() => canAccessRoom(room.id) && onSelectRoom(room.id)}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#23332B] group-hover:text-[#2D5A47] transition flex items-center gap-1.5">
                      <span>{room.name}</span>
                      {summary.hygieneStatus === 'conforme' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF1EE] text-[#2D5A47] border border-[#CBDED5] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#2D5A47]" />
                          Limpeza OK
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Limpeza Pendente
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#527365] text-[11px] font-medium">
                        {summary.totalItems} itens
                      </span>
                      <span className={`font-mono font-black text-sm ${
                        isTargetMet
                          ? 'text-[#2D5A47]'
                          : pct >= 85
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}>
                        {pct}%
                      </span>
                    </div>
                  </div>

                  <div className="relative w-full h-3.5 bg-[#EBF1EE] rounded-full overflow-hidden">
                    {/* 95% target marker line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-[#527365]/50 z-10"
                      style={{ left: '95%' }}
                      title="Meta 95%"
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTargetMet
                          ? 'bg-[#2D5A47]'
                          : pct >= 85
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#527365] pt-3 border-t border-[#E1E9E4]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D5A47]" />
                <span>&ge; 95% (Meta)</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>85% - 94% (Atenção)</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>&lt; 85% (Crítico)</span>
              </span>
            </div>
            <span className="text-[11px] italic text-[#527365]">Clique em qualquer sala para abrir</span>
          </div>
        </div>

        {/* Right 1 Col: Ranking Component */}
        <div className="lg:col-span-1">
          <RankingRooms onSelectRoom={onSelectRoom} />
        </div>
      </div>
    </div>
  );
};
