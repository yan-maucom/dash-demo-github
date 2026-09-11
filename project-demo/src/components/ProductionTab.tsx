import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { exportProductionToExcel, downloadProductionTemplate } from '../services/excelService';
import {
  Sparkles,
  Plus,
  FileSpreadsheet,
  Download,
  Trash2,
  AlertTriangle,
  PackageCheck,
  Percent,
  Layers,
  FileDown,
  X,
  Save,
  Lock,
  Unlock,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface ProductionTabProps {
  onOpenImport: () => void;
}

export const ProductionTab: React.FC<ProductionTabProps> = ({ onOpenImport }) => {
  const {
    productionItems,
    addProductionItem,
    deleteProductionItem,
    clearMonthProduction,
    activeMonth,
    getProductionLockStatus,
    getProductionLockInfo,
    reopenProduction,
    closeProduction,
  } = useInventory();
  const { user, isChefe, canEditRoom } = useAuth();

  const lockStatus = getProductionLockStatus(activeMonth);
  const isLocked = lockStatus === 'fechado';
  const lockInfo = getProductionLockInfo(activeMonth);
  const canEdit = (isChefe || canEditRoom('unitarizacao')) && !isLocked;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [medicationCode, setMedicationCode] = useState('MED-1009');
  const [medicationName, setMedicationName] = useState('Paracetamol 500mg - Fracionamento');
  const [batchNumber, setBatchNumber] = useState(`UNIT-${activeMonth.replace('-', '')}-01`);
  const [sourceBatch, setSourceBatch] = useState('LT-FAB-8812');
  const [producedQty, setProducedQty] = useState<number>(1000);
  const [lossQty, setLossQty] = useState<number>(5);
  const [lossReason, setLossReason] = useState('Falha na selagem térmica do invólucro');
  const [operatorName, setOperatorName] = useState(user?.name || 'Téc. Amanda Nogueira');
  const [technicianNote] = useState('');
  const [expiryDate, setExpiryDate] = useState('2027-06-30');
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [closeFeedback, setCloseFeedback] = useState<string | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);

  // Filter for active month
  const monthProduction = productionItems.filter(
    (p) => p.monthYear === activeMonth || p.date.startsWith(activeMonth)
  );

  const totalProduced = monthProduction.reduce((acc, i) => acc + i.producedQty, 0);
  const totalLosses = monthProduction.reduce((acc, i) => acc + i.lossQty, 0);
  const totalGross = totalProduced + totalLosses;
  const lossRatePct = totalGross > 0 ? Number(((totalLosses / totalGross) * 100).toFixed(2)) : 0;

  // Agrupa a produção do mês por medicamento (somando todos os lotes),
  // já que o gráfico é "por medicamento", não por lote individual —
  // evita uma barra por lote (o que deixava a página enorme).
  const productionByMedication = React.useMemo(() => {
    const map = new Map<string, { medicationName: string; producedQty: number; lossQty: number; lots: number }>();
    monthProduction.forEach((item) => {
      const key = item.medicationName || 'Sem nome';
      const existing = map.get(key);
      if (existing) {
        existing.producedQty += item.producedQty;
        existing.lossQty += item.lossQty;
        existing.lots += 1;
      } else {
        map.set(key, {
          medicationName: key,
          producedQty: item.producedQty,
          lossQty: item.lossQty,
          lots: 1,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.producedQty - a.producedQty);
  }, [monthProduction]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingItem(true);
    setAddError(null);
    const result = await addProductionItem({
      monthYear: activeMonth,
      date,
      medicationCode,
      medicationName,
      batchNumber,
      sourceBatch,
      producedQty: Math.max(0, producedQty),
      lossQty: Math.max(0, lossQty),
      lossReason: lossQty > 0 ? lossReason : undefined,
      operatorName,
      technicianNote: technicianNote.trim() || undefined,
      expiryDate,
    });
    setIsSavingItem(false);
    if (!result.success) {
      setAddError(`Não foi possível salvar no banco de dados (${result.error || 'erro desconhecido'}). Tente novamente.`);
      return;
    }
    setIsAddModalOpen(false);
  };

  const handleCloseMonth = async () => {
    if (
      !window.confirm(
        `Isso vai efetivar e fechar o lançamento de produção de ${activeMonth} — só a chefia poderá reabrir para editar de novo. Confirmar?`
      )
    ) {
      return;
    }
    setIsClosing(true);
    setCloseFeedback(null);
    setCloseError(null);
    const result = await closeProduction(activeMonth, user?.name || 'Sistema');
    setIsClosing(false);
    if (!result.success) {
      setCloseError(`Não foi possível fechar o lançamento (${result.error || 'erro desconhecido'}). Tente novamente.`);
      return;
    }
    setCloseFeedback('Produção do mês efetivada e fechada.');
  };

  const handleReopen = async () => {
    if (!window.confirm('Reabrir o lançamento de produção deste mês para edição?')) return;
    await reopenProduction(activeMonth);
    setCloseFeedback('Lançamento de produção reaberto para edição.');
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        `Isso vai EXCLUIR PERMANENTEMENTE todos os ${monthProduction.length} lançamentos de produção de ${activeMonth}. Essa ação não pode ser desfeita. Confirmar?`
      )
    ) {
      return;
    }
    await clearMonthProduction(activeMonth);
    setCloseFeedback('Todos os lançamentos de produção deste mês foram excluídos.');
  };

  const handleExport = () => {
    exportProductionToExcel(monthProduction, activeMonth);
  };

  const handleDelete = (id: string, name: string) => {
    if (!canEdit) return;
    if (window.confirm(`Deseja excluir o registro de produção de "${name}"?`)) {
      deleteProductionItem(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Info */}
      <div className="bg-[#EBF1EE] rounded-2xl p-6 shadow-xs border border-[#CBDED5] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#CBDED5] text-[#2D5A47] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Módulo de Unitarização de Doses</span>
            </div>
            <h3 className="font-heading font-bold text-xl text-[#23332B]">
              Indicador de Produção Mensal & Controle de Perdas
            </h3>
            <p className="text-[#527365] text-xs sm:text-sm">
              Acompanhamento de fracionamento, etiquetagem datamatrix e índice de perda para o mês de <span className="font-bold text-[#23332B]">{activeMonth}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={downloadProductionTemplate}
              className="px-3.5 py-2 bg-white hover:bg-[#F8FAF9] text-[#2D5A47] font-semibold text-xs rounded-xl border border-[#CBDED5] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-[#2D5A47]" />
              <span>Modelo Planilha</span>
            </button>

            {isChefe && isLocked && (
              <button
                onClick={handleReopen}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs rounded-xl border border-amber-200 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Unlock className="w-4 h-4" />
                <span>Reabrir Produção</span>
              </button>
            )}

            {canEdit && (
              <>
                <button
                  onClick={onOpenImport}
                  className="px-3.5 py-2 bg-[#EBF1EE] hover:bg-[#CBDED5] text-[#2D5A47] font-semibold text-xs rounded-xl border border-[#CBDED5] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#2D5A47]" />
                  <span>Importar Produção</span>
                </button>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3.5 py-2 bg-white text-[#2D5A47] hover:bg-[#F8FAF9] font-bold text-xs rounded-xl border border-[#CBDED5] shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Lançar Produção</span>
                </button>

                {isChefe && monthProduction.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    title="Excluir todos os lançamentos de produção deste mês de uma vez"
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir Produção</span>
                  </button>
                )}

                {isChefe && (
                  <button
                    onClick={handleCloseMonth}
                    disabled={isClosing}
                    className="px-3.5 py-2 bg-[#2D5A47] text-white hover:bg-[#244b3b] font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isClosing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isClosing ? 'Salvando...' : 'Salvar e Fechar Produção do Mês'}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {isLocked && (
          <div className="relative z-10 mt-4 flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>
              Produção deste mês efetivada e fechada
              {lockInfo?.closedBy ? ` por ${lockInfo.closedBy}` : ''}
              {lockInfo?.closedAt ? ` em ${new Date(lockInfo.closedAt).toLocaleString('pt-BR')}` : ''}.
              {isChefe ? ' Clique em "Reabrir Produção" para editar.' : ' Somente a chefia pode reabrir para editar.'}
            </span>
          </div>
        )}

        {closeFeedback && (
          <div className="relative z-10 mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-[#EBF1EE] border border-[#CBDED5] text-[#2D5A47] text-[11px] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{closeFeedback}</span>
          </div>
        )}

        {closeError && (
          <div className="relative z-10 mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{closeError}</span>
          </div>
        )}
      </div>

      {/* Production KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Doses Produzidas */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#527365] uppercase tracking-wider text-[10px]">
              Doses Unitarizadas
            </span>
            <div className="p-2 bg-[#EBF1EE] text-[#2D5A47] rounded-xl">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#2D5A47] font-heading font-mono">
              {totalProduced.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs font-medium text-[#527365]">doses</span>
          </div>
          <p className="text-[11px] text-[#527365]">
            Liberadas e identificadas
          </p>
        </div>

        {/* 2. Doses Perdidas */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#527365] uppercase tracking-wider text-[10px]">
              Perdas Operacionais
            </span>
            <div className="p-2 bg-rose-50 text-[#D32F2F] rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#D32F2F] font-heading font-mono">
              {totalLosses.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs font-medium text-[#527365]">doses</span>
          </div>
          <p className="text-[11px] text-[#527365]">
            Descartes e testes
          </p>
        </div>

        {/* 3. Taxa de Perda % */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#527365] uppercase tracking-wider text-[10px]">
              Taxa de Perda (%)
            </span>
            <div className="p-2 bg-amber-50 text-[#E67E22] rounded-xl">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-bold font-heading font-mono ${
              lossRatePct <= 1.5 ? 'text-[#2D5A47]' : 'text-[#D32F2F]'
            }`}>
              {lossRatePct}%
            </span>
            <span className="text-xs font-semibold text-[#527365]">
              {lossRatePct <= 1.5 ? '✓ Meta < 1.5%' : '⚠ Acima'}
            </span>
          </div>
          <p className="text-[11px] text-[#527365]">
            Meta hospitalar máxima: 1.5%
          </p>
        </div>

        {/* 4. Total de Lotes Processados */}
        <div className="bg-white border border-[#E1E9E4] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#527365] uppercase tracking-wider text-[10px]">
              Lotes Processados
            </span>
            <div className="p-2 bg-[#EBF1EE] text-[#2D5A47] rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#23332B] font-heading font-mono">
              {monthProduction.length}
            </span>
            <span className="text-xs font-medium text-[#527365]">lotes</span>
          </div>
          <p className="text-[11px] text-[#527365]">
            Lançados no mês ativo
          </p>
        </div>
      </div>

      {/* Production Visual Chart / Breakdown */}
      <div className="bg-white border border-[#E1E9E4] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-heading font-bold text-[#23332B] text-base">
              Gráfico de Produção e Perdas por Medicamento
            </h4>
            <p className="text-xs text-[#527365]">
              Volume de doses produzidas vs perdidas por medicamento no mês de {activeMonth} ({productionByMedication.length} medicamentos)
            </p>
          </div>
          <button
            onClick={handleExport}
            className="px-3.5 py-1.5 bg-[#EBF1EE] hover:bg-[#CBDED5] text-[#2D5A47] text-xs font-semibold rounded-xl transition flex items-center gap-1.5 w-fit cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-[#2D5A47]" />
            <span>Exportar Relatório (.xlsx)</span>
          </button>
        </div>

        {/* Bar chart rows — agrupado por medicamento, com rolagem interna
            para não deixar a página gigantesca em meses com muitos itens */}
        <div className="space-y-2.5 pt-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
          {productionByMedication.map((item) => {
            const itemGross = item.producedQty + item.lossQty;
            const itemLossPct = itemGross > 0 ? ((item.lossQty / itemGross) * 100).toFixed(1) : '0';

            return (
              <div key={item.medicationName} className="p-3 rounded-xl bg-[#F8FAF9] border border-[#E1E9E4] space-y-1.5">
                <div className="flex items-center justify-between text-xs gap-2">
                  <div className="min-w-0 flex items-baseline gap-1.5">
                    <span className="font-bold text-[#23332B] truncate">
                      {item.medicationName}
                    </span>
                    <span className="text-[10px] text-[#527365] shrink-0">
                      ({item.lots} {item.lots === 1 ? 'lote' : 'lotes'})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[#2D5A47] font-semibold">
                      {item.producedQty.toLocaleString()} un prod.
                    </span>
                    {item.lossQty > 0 && (
                      <span className="text-[#D32F2F] font-semibold">
                        {item.lossQty} perdas ({itemLossPct}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#EBF1EE] rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#2D5A47] h-full"
                    style={{ width: `${itemGross > 0 ? (item.producedQty / itemGross) * 100 : 100}%` }}
                    title={`Produzidas: ${item.producedQty}`}
                  />
                  {item.lossQty > 0 && (
                    <div
                      className="bg-[#D32F2F] h-full"
                      style={{ width: `${(item.lossQty / itemGross) * 100}%` }}
                      title={`Perdas: ${item.lossQty}`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Table */}
      <div className="bg-white border border-[#E1E9E4] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E1E9E4] flex items-center justify-between bg-[#F8FAF9]">
          <h4 className="font-heading font-extrabold text-[#23332B] text-sm">
            Detalhamento de Lotes de Produção ({monthProduction.length} Lançamentos)
          </h4>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F8FAF9] text-[#527365] font-extrabold border-b border-[#E1E9E4]">
              <tr>
                <th className="p-3.5 text-[10px] uppercase tracking-wider">Data</th>
                <th className="p-3.5 text-[10px] uppercase tracking-wider">Lote Unit</th>
                <th className="p-3.5 text-[10px] uppercase tracking-wider min-w-[200px]">Medicamento</th>
                <th className="p-3.5 text-[10px] uppercase tracking-wider">Lote Orig.</th>
                <th className="p-3.5 text-right text-[10px] uppercase tracking-wider">Doses Prod.</th>
                <th className="p-3.5 text-right text-[10px] uppercase tracking-wider">Perdas</th>
                <th className="p-3.5 text-[10px] uppercase tracking-wider">Motivo da Perda</th>
                <th className="p-3.5 text-[10px] uppercase tracking-wider">Operador</th>
                <th className="p-3.5 text-right text-[10px] uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E9E4] text-[#23332B] font-medium">
              {monthProduction.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`hover:bg-[#EBF1EE]/60 transition-colors ${
                    idx % 2 === 0
                      ? 'bg-white'
                      : 'bg-[#F8FAF9]'
                  }`}
                >
                  <td className="p-3.5 font-mono text-[#23332B] font-medium whitespace-nowrap">{item.date}</td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="font-mono font-bold text-[#2D5A47] bg-[#EBF1EE] px-2 py-0.5 rounded border border-[#CBDED5]">
                      {item.batchNumber}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-[#23332B] text-xs sm:text-[13px]">
                    {item.medicationName}
                  </td>
                  <td className="p-3.5 font-mono text-[#527365] whitespace-nowrap">{item.sourceBatch}</td>
                  <td className="p-3.5 text-right font-mono font-black text-[#2D5A47] whitespace-nowrap">
                    {item.producedQty.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-mono font-black text-rose-600 whitespace-nowrap">
                    {item.lossQty}
                  </td>
                  <td className="p-3.5 text-[#527365] max-w-xs truncate">
                    {item.lossReason || '-'}
                  </td>
                  <td className="p-3.5 text-[#23332B] font-medium whitespace-nowrap">{item.operatorName}</td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    {canEdit && (
                      <button
                        onClick={() => handleDelete(item.id, item.medicationName)}
                        className="p-1.5 text-[#527365] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E1E9E4] rounded-2xl shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E9E4] bg-[#F8FAF9]">
              <h3 className="font-heading font-bold text-[#23332B] text-base">
                Lançar Lote de Produção
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-[#527365] hover:text-[#23332B] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-3.5 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#527365] uppercase mb-1 text-[10px]">Data</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#527365] uppercase mb-1 text-[10px]">Código Material</label>
                  <input
                    type="text"
                    value={medicationCode}
                    onChange={(e) => setMedicationCode(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#527365] uppercase mb-1 text-[10px]">Nome do Medicamento</label>
                <input
                  type="text"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#527365] uppercase mb-1 text-[10px]">Lote Unitarização</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#527365] uppercase mb-1 text-[10px]">Lote Fabricante</label>
                  <input
                    type="text"
                    value={sourceBatch}
                    onChange={(e) => setSourceBatch(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#527365] uppercase mb-1 text-[10px]">Doses Produzidas</label>
                  <input
                    type="number"
                    min="0"
                    value={producedQty}
                    onChange={(e) => setProducedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs font-bold text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#527365] uppercase mb-1 text-[10px]">Doses Perdidas</label>
                  <input
                    type="number"
                    min="0"
                    value={lossQty}
                    onChange={(e) => setLossQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs font-bold text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                  />
                </div>
              </div>

              {lossQty > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-[#527365] uppercase mb-1 text-[10px]">Motivo da Perda</label>
                  <input
                    type="text"
                    value={lossReason}
                    onChange={(e) => setLossReason(e.target.value)}
                    placeholder="Ex: Falha na selagem térmica..."
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#527365] uppercase mb-1 text-[10px]">Operador</label>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#527365] uppercase mb-1 text-[10px]">Validade Final</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#527365] hover:bg-[#EBF1EE] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingItem}
                  className="px-5 py-2 bg-[#2D5A47] hover:bg-[#244b3b] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingItem ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSavingItem ? 'Salvando...' : 'Salvar Lote'}</span>
                </button>
              </div>

              {addError && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
