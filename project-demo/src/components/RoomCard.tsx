import React from 'react';
import { RoomInfo, RoomInventorySummary } from '../types';
import {
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Package,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';

interface RoomCardProps {
  room: RoomInfo;
  summary: RoomInventorySummary;
  onSelect: (roomId: RoomInfo['id']) => void;
  canAccess: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  summary,
  onSelect,
  canAccess,
}) => {
  const isHighAccuracy = summary.accuracyPercentage >= 95;
  const isMedAccuracy = summary.accuracyPercentage >= 85 && summary.accuracyPercentage < 95;

  return (
    <div
      onClick={() => canAccess && onSelect(room.id)}
      className={`group relative bg-white border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${
        canAccess
          ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 border-[#E1E9E4] hover:border-[#2D5A47]/60'
          : 'opacity-70 border-[#E1E9E4]/60 cursor-not-allowed'
      }`}
    >
      {/* Image Container with Representative Photo */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-[#2D5A47]/10">
        <img
          src={room.imageUrl}
          alt={room.name}
          onError={(e) => {
            // Fallback reliable medical imagery if unsplash image fails
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Soft green overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#16382a]/90 via-[#16382a]/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#2D5A47] text-white shadow-sm border border-white/20">
            {room.shortName}
          </span>

          {/* Hygiene Compliance badge */}
          {summary.hygieneStatus ? (
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border ${
              summary.hygieneStatus === 'conforme'
                ? 'bg-[#2D5A47] text-white border-emerald-400/40'
                : 'bg-[#D32F2F] text-white border-rose-400/40'
            }`}>
              {summary.hygieneStatus === 'conforme' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Limpeza OK</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Limpeza Pendente</span>
                </>
              )}
            </span>
          ) : (
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#1a382b]/80 text-emerald-100 border border-white/10 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>Sem Avaliação</span>
            </span>
          )}
        </div>

        {/* Bottom image overlay information */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-white font-heading font-extrabold text-lg sm:text-xl drop-shadow-md leading-tight">
            {room.name}
          </h3>
          <p className="text-emerald-100/90 text-xs line-clamp-1 drop-shadow mt-0.5">
            {room.subtitle}
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4">
        {/* Accuracy Progress & Metric */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-[#527365] uppercase tracking-wider flex items-center gap-1 text-[10px]">
              <TrendingUp className="w-3.5 h-3.5 text-[#2D5A47]" />
              Acurácia Físico vs AGHU
            </span>
            <span className={`font-mono font-extrabold text-sm ${
              isHighAccuracy
                ? 'text-[#2D5A47]'
                : isMedAccuracy
                ? 'text-[#E67E22]'
                : 'text-[#D32F2F]'
            }`}>
              {summary.accuracyPercentage}% Acertos
            </span>
          </div>

          <div className="w-full h-2 bg-[#EBF1EE] rounded-full overflow-hidden flex">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isHighAccuracy
                  ? 'bg-[#2D5A47]'
                  : isMedAccuracy
                  ? 'bg-[#E67E22]'
                  : 'bg-[#D32F2F]'
              }`}
              style={{ width: `${Math.max(5, summary.accuracyPercentage)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#527365] mt-1 font-medium">
            <span>{summary.exactItemsCount} itens exatos</span>
            <span>{summary.surplusItemsCount + summary.deficitItemsCount} divergências</span>
          </div>
        </div>

        {/* Alert Indicators Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E1E9E4]">
          {/* Perto de Vencer */}
          <div className={`p-2 rounded-xl text-center border transition ${
            summary.criticalExpiryCount > 0 || summary.nearExpiryCount > 0
              ? 'bg-[#FFF4F4] border-[#FFDADA] text-[#D32F2F]'
              : 'bg-[#F8FAF9] border-[#E1E9E4] text-[#527365]'
          }`}>
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              <Clock className="w-3 h-3" />
              <span>Validade</span>
            </div>
            <p className="text-base font-extrabold font-mono">
              {summary.criticalExpiryCount + summary.nearExpiryCount}
            </p>
            <p className="text-[10px] font-medium opacity-90 truncate">
              {summary.criticalExpiryCount > 0 ? 'Crítico (<30d)' : 'Alerta (<60d)'}
            </p>
          </div>

          {/* Acabando */}
          <div className={`p-2 rounded-xl text-center border transition ${
            summary.lowStockCount > 0
              ? 'bg-[#FFF9F0] border-[#FFEBC2] text-[#E67E22]'
              : 'bg-[#F8FAF9] border-[#E1E9E4] text-[#527365]'
          }`}>
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              <AlertTriangle className="w-3 h-3" />
              <span>Acabando</span>
            </div>
            <p className="text-base font-extrabold font-mono">{summary.lowStockCount}</p>
            <p className="text-[10px] font-medium opacity-90 truncate">Est. Mínimo</p>
          </div>

          {/* Zerados */}
          <div className={`p-2 rounded-xl text-center border transition ${
            summary.zeroStockCount > 0
              ? 'bg-[#F8FAF9] border-[#E1E9E4] text-[#2D3A35]'
              : 'bg-[#F8FAF9] border-[#E1E9E4] text-[#527365]'
          }`}>
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              <Package className="w-3 h-3" />
              <span>Zerados</span>
            </div>
            <p className="text-base font-extrabold font-mono">{summary.zeroStockCount}</p>
            <p className="text-[10px] font-medium opacity-90 truncate">Estoque 0</p>
          </div>
        </div>

        {/* Special Unitarização badge if applicable */}
        {room.isSpecialProduction && (
          <div className="p-2 bg-[#EBF1EE] rounded-xl border border-[#CBDED5] flex items-center justify-between text-xs text-[#2D5A47]">
            <span className="flex items-center gap-1.5 font-semibold text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-[#2D5A47]" />
              Aba de Produção Mensal Ativa
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-[#2D5A47] border border-[#CBDED5]">
              Doses & Perdas
            </span>
          </div>
        )}

        {/* Footer Action Button */}
        <div className="pt-1">
          <button
            disabled={!canAccess}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              canAccess
                ? 'bg-[#2D5A47] text-white hover:bg-[#234737] shadow-sm'
                : 'bg-[#EBF1EE] text-[#527365] cursor-not-allowed'
            }`}
          >
            <span>{canAccess ? 'Acessar Inventário da Sala' : 'Acesso Restrito ao Responsável'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
