import React from 'react';
import { InventoryItem, RoomInventorySummary } from '../types';
import { useInventory } from '../context/InventoryContext';
import {
  TrendingUp,
  Scale,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface AccuracyChartsProps {
  items: InventoryItem[];
  summary: RoomInventorySummary;
  roomName: string;
}

export const AccuracyCharts: React.FC<AccuracyChartsProps> = ({
  items,
  summary,
  roomName,
}) => {
  const { getRoomHygiene, activeMonth } = useInventory();
  const hygieneEval = getRoomHygiene(summary.roomId, activeMonth);

  const totalItems = items.length;
  const exactCount = summary.exactItemsCount;
  const surplusCount = summary.surplusItemsCount;
  const deficitCount = summary.deficitItemsCount;
  const errorCount = surplusCount + deficitCount;
  
  const accuracyPct = summary.accuracyPercentage;
  const errorPct = Number((100 - accuracyPct).toFixed(1));
  const hygieneScore = hygieneEval?.score ?? summary.hygieneScore ?? 100;

  // Proportional SVG Donut Calculations
  // Radius = 54, Circumference = 2 * PI * 54 = 339.292
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const exactStrokeDash = (accuracyPct / 100) * circumference;
  const hygieneStrokeDash = (hygieneScore / 100) * circumference;

  // Top divergences sorted by magnitude
  const divergentItems = items
    .filter((i) => i.physicalQty !== i.aghuQty)
    .map((i) => ({
      ...i,
      diff: i.physicalQty - i.aghuQty,
      absDiff: Math.abs(i.physicalQty - i.aghuQty),
    }))
    .sort((a, b) => b.absDiff - a.absDiff);

  const maxAbsDiff = divergentItems.length > 0 ? Math.max(...divergentItems.map((i) => i.absDiff)) : 0;

  // Data do inventário: última atualização entre os itens desta sala/mês.
  const lastUpdatedAt = items.reduce((latest: string, i) => {
    return i.updatedAt && i.updatedAt > latest ? i.updatedAt : latest;
  }, '');
  const lastUpdatedLabel = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="space-y-6">
      {/* 1. TOP 4 PROPORTIONAL METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Acurácia de Limpeza e Organização */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#527365] uppercase tracking-wider">
              Limpeza & Organização
            </span>
            <div className="p-1.5 bg-[#EBF1EE] text-[#2D5A47] rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-heading ${
              hygieneScore >= 90
                ? 'text-[#2D5A47]'
                : hygieneScore >= 70
                ? 'text-[#E67E22]'
                : 'text-[#D32F2F]'
            }`}>
              {hygieneScore}%
            </span>
            <span className="text-xs font-semibold text-[#527365]">
              {hygieneEval?.status === 'conforme' ? 'Conforme' : 'Auditoria'}
            </span>
          </div>

          <div className="w-full bg-[#EBF1EE] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                hygieneScore >= 90 ? 'bg-[#2D5A47]' : hygieneScore >= 70 ? 'bg-[#E67E22]' : 'bg-[#D32F2F]'
              }`}
              style={{ width: `${hygieneScore}%` }}
            />
          </div>

          <p className="text-[11px] text-[#527365]">
            Checklist RDC 67 / ANVISA
          </p>
        </div>

        {/* Acurácia de Inventário */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#527365] uppercase tracking-wider">
              Acurácia de Inventário
            </span>
            <div className="p-1.5 bg-[#EBF1EE] text-[#2D5A47] rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-heading ${
              accuracyPct >= 95
                ? 'text-[#2D5A47]'
                : accuracyPct >= 85
                ? 'text-[#E67E22]'
                : 'text-[#D32F2F]'
            }`}>
              {accuracyPct}%
            </span>
            <span className="text-xs font-semibold text-[#527365]">
              ({exactCount}/{totalItems} itens)
            </span>
          </div>

          <div className="w-full bg-[#EBF1EE] h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-[#2D5A47] h-full transition-all duration-700"
              style={{ width: `${accuracyPct}%` }}
            />
            <div
              className="bg-[#D32F2F] h-full transition-all duration-700"
              style={{ width: `${errorPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#2D5A47] font-semibold">✓ {accuracyPct}% Exatos</span>
            <span className="text-[#D32F2F] font-semibold">✗ {errorPct}% Divergentes</span>
          </div>
        </div>

        {/* Volume Físico vs AGHU */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#527365] uppercase tracking-wider">
              Volume Físico vs AGHU
            </span>
            <div className="p-1.5 bg-[#EBF1EE] text-[#2D5A47] rounded-xl">
              <Scale className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#527365]">Físico:</span>
              <span className="font-bold text-sm text-[#23332B] font-mono">
                {summary.totalPhysicalQty.toLocaleString('pt-BR')} un
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#527365]">AGHU:</span>
              <span className="font-bold text-sm text-[#23332B] font-mono">
                {summary.totalAghuQty.toLocaleString('pt-BR')} un
              </span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-[#E1E9E4] flex items-center justify-between text-xs">
            <span className="font-medium text-[#527365]">Diferença:</span>
            <span className={`font-bold font-mono px-2 py-0.5 rounded-md ${
              summary.totalPhysicalQty === summary.totalAghuQty
                ? 'bg-[#EBF1EE] text-[#2D5A47] border border-[#CBDED5]'
                : summary.totalPhysicalQty > summary.totalAghuQty
                ? 'bg-[#EBF1EE] text-[#2D5A47] border border-[#CBDED5]'
                : 'bg-rose-50 text-[#D32F2F] border border-rose-200'
            }`}>
              {summary.totalPhysicalQty - summary.totalAghuQty >= 0 ? '+' : ''}
              {summary.totalPhysicalQty - summary.totalAghuQty} un
            </span>
          </div>
        </div>

        {/* Distribuição de Itens */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#527365] uppercase tracking-wider">
              Distribuição de Itens
            </span>
            <div className="p-1.5 bg-[#EBF1EE] text-[#2D5A47] rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-1.5 rounded-xl bg-[#EBF1EE] border border-[#CBDED5]">
              <p className="text-[9px] font-bold text-[#2D5A47] uppercase">Exatos</p>
              <p className="text-base font-bold text-[#2D5A47] font-mono">{exactCount}</p>
            </div>
            <div className="p-1.5 rounded-xl bg-[#EBF1EE] border border-[#CBDED5]">
              <p className="text-[9px] font-bold text-[#2D5A47] uppercase">Sobras</p>
              <p className="text-base font-bold text-[#2D5A47] font-mono">+{surplusCount}</p>
            </div>
            <div className="p-1.5 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-[9px] font-bold text-[#D32F2F] uppercase">Faltas</p>
              <p className="text-base font-bold text-[#D32F2F] font-mono">-{deficitCount}</p>
            </div>
          </div>

          <p className="text-[11px] text-[#527365] text-center">
            {errorCount > 0 ? `${errorCount} divergências registradas` : '100% conferido'}
          </p>
        </div>
      </div>

      {/* 2. DUAL PROPORTIONAL ACCURACY GAUGES & DIVERGENCES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proportional Donut Charts Container */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="text-center sm:text-left">
            <h4 className="font-heading font-extrabold text-[#23332B] text-base">
              Indicadores de Acurácia da {roomName}
            </h4>
            <p className="text-xs text-[#527365] mt-0.5">
              Proporção visual entre Acurácia de Estoque e Acurácia de Limpeza & Organização
            </p>
          </div>

          {/* Side-by-Side Dual Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center justify-items-center py-2">
            {/* Gauge 1: Acurácia de Estoque */}
            <div className="flex flex-col items-center space-y-3">
              <span className="text-xs font-bold text-[#2D5A47] uppercase tracking-wider">
                Acurácia de Estoque
              </span>

              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                  {/* Background Track */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    className="text-[#EBF1EE]"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Error Track */}
                  {errorCount > 0 && (
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      className="text-[#D32F2F]"
                      strokeWidth="12"
                      strokeDasharray={`${circumference} ${circumference}`}
                      strokeDashoffset="0"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  )}
                  {/* Exact Value Track */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    className="text-[#2D5A47]"
                    strokeWidth="12"
                    strokeDasharray={`${exactStrokeDash} ${circumference}`}
                    strokeDashoffset="0"
                    stroke="currentColor"
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: 'stroke-dasharray 0.8s ease-in-out' }}
                  />
                </svg>

                {/* Inner Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black font-heading text-[#23332B]">
                    {accuracyPct}%
                  </span>
                  <span className="text-[9px] font-bold text-[#527365] uppercase tracking-wider">
                    Estoque
                  </span>
                </div>
              </div>

              <div className="text-center text-xs space-y-0.5">
                <p className="font-semibold text-[#23332B]">
                  {exactCount} de {totalItems} itens corretos
                </p>
                <p className="text-[11px] text-[#527365]">
                  Meta hospitalar: &ge;95%
                </p>
              </div>
            </div>

            {/* Gauge 2: Acurácia de Limpeza & Organização */}
            <div className="flex flex-col items-center space-y-3">
              <span className="text-xs font-bold text-[#2D5A47] uppercase tracking-wider">
                Limpeza & Organização
              </span>

              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                  {/* Background Track */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    className="text-[#EBF1EE]"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Hygiene Score Track */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    className={hygieneScore >= 90 ? 'text-[#2D5A47]' : hygieneScore >= 70 ? 'text-[#E67E22]' : 'text-[#D32F2F]'}
                    strokeWidth="12"
                    strokeDasharray={`${hygieneStrokeDash} ${circumference}`}
                    strokeDashoffset="0"
                    stroke="currentColor"
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: 'stroke-dasharray 0.8s ease-in-out' }}
                  />
                </svg>

                {/* Inner Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black font-heading text-[#23332B]">
                    {hygieneScore}%
                  </span>
                  <span className="text-[9px] font-bold text-[#527365] uppercase tracking-wider">
                    Higiene
                  </span>
                </div>
              </div>

              <div className="text-center text-xs space-y-0.5">
                <p className="font-semibold text-[#23332B]">
                  {hygieneEval?.status === 'conforme' ? '100% Conforme' : `${hygieneScore}% Aprovado`}
                </p>
                <p className="text-[11px] text-[#527365]">
                  Auditoria RDC 67 / ANVISA
                </p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-3 border-t border-[#E1E9E4]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2D5A47]" />
              <span className="text-[#23332B] font-medium">Acertos / Conforme</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E67E22]" />
              <span className="text-[#23332B] font-medium">Atenção</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F]" />
              <span className="text-[#23332B] font-medium">Divergência / Não Conforme</span>
            </div>
          </div>
        </div>

        {/* Top Divergent Items Breakdown */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-heading font-bold text-[#23332B] text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E67E22]" />
                <span>Medicamentos com Divergência</span>
              </h4>
              <span className="text-xs font-semibold text-[#527365] shrink-0">{divergentItems.length} itens</span>
            </div>
            <p className="text-xs text-[#527365] mt-0.5">
              Itens que exigem recontagem física ou correção no AGHU
              {lastUpdatedLabel && (
                <>
                  {' '}• Inventário atualizado em <span className="font-semibold text-[#23332B]">{lastUpdatedLabel}</span>
                </>
              )}
            </p>
          </div>

          {divergentItems.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#EBF1EE] border border-[#CBDED5]">
              <CheckCircle2 className="w-10 h-10 text-[#2D5A47] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#2D5A47]">
                100% de Acurácia de Estoque!
              </p>
              <p className="text-xs text-[#527365] mt-1">
                Todas as contagens físicas conferem exatamente com as quantidades cadastradas no sistema AGHU.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {divergentItems.map((item) => {
                const isSurplus = item.diff > 0;
                const barWidthPct = maxAbsDiff > 0 ? Math.max((item.absDiff / maxAbsDiff) * 100, 4) : 0;
                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border ${
                      isSurplus ? 'bg-[#EBF1EE]/60 border-[#CBDED5]' : 'bg-rose-50 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                      <div className="min-w-0 flex items-baseline gap-1.5">
                        <span className="font-mono font-bold text-[#2D5A47] shrink-0">
                          {item.code}
                        </span>
                        <span className="font-bold text-[#23332B] truncate">
                          {item.description}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                        isSurplus ? 'bg-[#CBDED5] text-[#2D5A47]' : 'bg-rose-100 text-[#D32F2F]'
                      }`}>
                        {isSurplus ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        <span>{isSurplus ? `+${item.diff}` : item.diff} {item.unit}</span>
                      </span>
                    </div>

                    {/* Barra proporcional à magnitude da divergência */}
                    <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isSurplus ? 'bg-[#2D5A47]' : 'bg-[#D32F2F]'}`}
                        style={{ width: `${barWidthPct}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-[#527365] mt-1">
                      AGHU: <span className="font-mono font-semibold">{item.aghuQty}</span> • Físico: <span className="font-mono font-bold">{item.physicalQty}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 text-[11px] text-[#527365] italic text-center">
            Relatório gerado automaticamente a partir das contagens do inventário da {roomName}.
          </div>
        </div>
      </div>
    </div>
  );
};
