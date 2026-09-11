import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { RoomId } from '../types';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface RankingRoomsProps {
  onSelectRoom: (roomId: RoomId) => void;
}

export const RankingRooms: React.FC<RankingRoomsProps> = ({ onSelectRoom }) => {
  const { getRanking, activeMonth } = useInventory();
  const ranking = getRanking(activeMonth);

  return (
    <div className="bg-white border border-[#E1E9E4] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Ranking Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#E1E9E4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-[#2D5A47] uppercase">
              DESEMPENHO DO MÊS
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF1EE] text-[#2D5A47]">
              {activeMonth}
            </span>
          </div>
          <h3 className="font-heading font-extrabold text-[#23332B] text-lg sm:text-xl mt-0.5">
            Ranking de Acurácia das Salas
          </h3>
          <p className="text-xs text-[#527365] mt-0.5">
            Classificação oficial por precisão de contagem física vs AGHU
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-[#EBF1EE] text-[#2D5A47] border border-[#CBDED5] rounded-lg">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>6 Salas Auditadas</span>
          </span>
        </div>
      </div>

      {/* Ranking Cards List - Clean, Vertical & Non-Overlapping */}
      <div className="space-y-3.5">
        {ranking.map((item, idx) => {
          const rankPos = idx + 1;
          const accuracy = item.summary.accuracyPercentage;
          const isTargetMet = accuracy >= 95;
          const isWarning = accuracy >= 85 && accuracy < 95;

          // Rank badge styling
          let rankBadgeBg = 'bg-[#EBF1EE] text-[#2D3A35] border-[#CBDED5]';
          if (rankPos === 1) {
            rankBadgeBg = 'bg-amber-100 text-amber-900 border-amber-300';
          } else if (rankPos === 2) {
            rankBadgeBg = 'bg-slate-200 text-slate-800 border-slate-300';
          } else if (rankPos === 3) {
            rankBadgeBg = 'bg-orange-100 text-orange-900 border-orange-300';
          }

          return (
            <div
              key={item.room.id}
              onClick={() => onSelectRoom(item.room.id)}
              className="p-4 rounded-xl border border-[#E1E9E4] bg-[#F8FAF9] hover:bg-white hover:border-[#2D5A47] hover:shadow-md transition-all cursor-pointer group space-y-3"
            >
              {/* Row 1: Rank Position, Room Photo, Room Name and Action Arrow */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Position Badge */}
                  <div className={`w-7 h-7 rounded-lg border font-mono font-black text-xs flex items-center justify-center shrink-0 ${rankBadgeBg}`}>
                    {rankPos === 1 ? '🥇' : rankPos === 2 ? '🥈' : rankPos === 3 ? '🥉' : `${rankPos}º`}
                  </div>

                  {/* Room Thumbnail */}
                  <img
                    src={item.room.imageUrl}
                    alt={item.room.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-9 h-9 rounded-lg object-cover border border-[#CBDED5] shrink-0"
                  />

                  {/* Room Name & Category */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-heading font-bold text-sm text-[#23332B] group-hover:text-[#2D5A47] transition truncate">
                        {item.room.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#527365] truncate">
                      Resp: {item.room.responsibleName.split('(')[0].trim()}
                    </p>
                  </div>
                </div>

                {/* Arrow Action Indicator */}
                <div className="p-1.5 rounded-lg text-[#527365] group-hover:text-[#2D5A47] group-hover:bg-[#EBF1EE] transition shrink-0">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Row 2: Accuracy Progress Bar & Percentage */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#527365] text-[11px] flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#2D5A47]" />
                    <span>Acurácia de Estoque:</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#527365]">
                      ({item.summary.exactItemsCount}/{item.summary.totalItems} exatos)
                    </span>
                    <span className={`font-mono font-black text-sm ${
                      isTargetMet
                        ? 'text-[#2D5A47]'
                        : isWarning
                        ? 'text-[#E67E22]'
                        : 'text-[#D32F2F]'
                    }`}>
                      {accuracy}%
                    </span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="w-full bg-[#EBF1EE] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isTargetMet
                        ? 'bg-[#2D5A47]'
                        : isWarning
                        ? 'bg-[#E67E22]'
                        : 'bg-[#D32F2F]'
                    }`}
                    style={{ width: `${Math.max(5, accuracy)}%` }}
                  />
                </div>
              </div>

              {/* Row 3: Hygiene Status & Divergence Info Badges */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E1E9E4] text-[11px]">
                {/* Limpeza Status */}
                <div className="flex items-center gap-1">
                  <span className="text-[#527365] font-medium">Limpeza:</span>
                  {item.summary.hygieneStatus === 'conforme' ? (
                    <span className="inline-flex items-center gap-1 font-bold text-[#2D5A47] px-1.5 py-0.5 rounded bg-[#EBF1EE] border border-[#CBDED5]">
                      <CheckCircle2 className="w-3 h-3 text-[#2D5A47]" />
                      <span>Conforme</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-[#D32F2F] px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200">
                      <XCircle className="w-3 h-3 text-[#D32F2F]" />
                      <span>Pendente</span>
                    </span>
                  )}
                </div>

                {/* Stock Divergence Summary */}
                <div className="text-right">
                  {item.summary.surplusItemsCount + item.summary.deficitItemsCount === 0 ? (
                    <span className="font-bold text-[#2D5A47]">
                      ✓ 100% Conferido
                    </span>
                  ) : (
                    <span className="font-semibold text-rose-700">
                      {item.summary.surplusItemsCount + item.summary.deficitItemsCount} divergência{(item.summary.surplusItemsCount + item.summary.deficitItemsCount) > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Critical PVPS & Audit Notice */}
      <div className="pt-2 grid grid-cols-1 gap-2.5">
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2 text-xs">
          <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <span className="font-bold block">Critério de Acurácia Hospitalar</span>
            <span className="text-amber-800 text-[11px]">
              Meta estabelecida: &ge;95% de exatidão nas contagens físicas vs AGHU e 100% de conformidade no checklist RDC 67.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
