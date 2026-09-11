import React, { useState, useEffect, useMemo } from 'react';
import { RoomId } from '../types';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { exportInventoryToExcel } from '../services/excelService';
import { CatalogManagementModal } from './CatalogManagementModal';
import {
  Search,
  FileSpreadsheet,
  FileDown,
  Save,
  CheckCircle2,
  AlertTriangle,
  PackageX,
  PackageMinus,
  Trash2,
  Plus,
  CopyPlus,
  Boxes,
  Lock,
  Unlock,
  Loader2,
} from 'lucide-react';

interface InventoryGridProps {
  roomId: RoomId;
  roomName: string;
  onOpenImport: () => void;
  onOpenAddExtraItem: () => void;
}

interface GridRow {
  rowKey: string; // key estável para o React (id existente, ou temp_ novo)
  id?: string; // id real do InventoryItem salvo, se já existir
  code: string;
  description: string;
  presentation: string;
  batch: string;
  expiryDate: string;
  aghuQty: number;
  physicalQty: number;
  isExtra?: boolean;
  groupSize: number; // quantos lotes esse item tem no total (para mostrar "Lote 1/2" etc)
  lotIndex: number; // posição deste lote dentro do grupo (1-based)
}

const getExpiryStatus = (expiryDateStr: string): 'expired' | 'critical' | 'warning' | 'none' | 'ok' => {
  if (!expiryDateStr) return 'none';
  const exp = new Date(expiryDateStr);
  if (isNaN(exp.getTime())) return 'none';
  const diffDays = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'critical';
  if (diffDays <= 60) return 'warning';
  return 'ok';
};

let tempIdCounter = 0;
const nextTempId = () => `temp_${Date.now()}_${tempIdCounter++}`;

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  roomId,
  roomName,
  onOpenImport,
  onOpenAddExtraItem,
}) => {
  const { getRoomItems, activeMonth, upsertInventoryGridRows, getCatalog, getInventoryLockStatus, getInventoryLockInfo, reopenInventory, clearRoomInventory } = useInventory();
  const { user, isChefe, canEditRoom } = useAuth();
  const lockStatus = getInventoryLockStatus(roomId, activeMonth);
  const isLocked = lockStatus === 'fechado';
  const lockInfo = getInventoryLockInfo(roomId, activeMonth);
  const canEdit = (isChefe || canEditRoom(roomId)) && !isLocked;

  const catalog = getCatalog(roomId);
  const savedItems = getRoomItems(roomId, activeMonth);
  const savedItemsKey = JSON.stringify(savedItems);

  // Constrói as linhas: cada item do catálogo pode ter 1 ou mais linhas de
  // lote, empilhadas em sequência (uma após a outra, na ordem em que os
  // lotes foram lançados). Itens fora do catálogo (extras) vêm no final,
  // também agrupados por código.
  const buildRows = (): GridRow[] => {
    const rows: GridRow[] = [];

    catalog.forEach((c) => {
      const matches = savedItems.filter((i) => i.code === c.code);
      const group = matches.length > 0 ? matches : [null];
      group.forEach((existing, gi) => {
        rows.push({
          rowKey: existing?.id || nextTempId(),
          id: existing?.id,
          code: c.code,
          description: c.description,
          presentation: c.presentation,
          batch: existing?.batch || '',
          expiryDate: existing?.expiryDate || '',
          aghuQty: existing?.aghuQty ?? 0,
          physicalQty: existing?.physicalQty ?? 0,
          groupSize: group.length,
          lotIndex: gi + 1,
        });
      });
    });

    const catalogCodes = new Set(catalog.map((c) => c.code));
    const extraCodes = Array.from(
      new Set(savedItems.filter((i) => !catalogCodes.has(i.code)).map((i) => i.code))
    );
    extraCodes.forEach((code) => {
      const matches = savedItems.filter((i) => i.code === code);
      matches.forEach((existing, gi) => {
        rows.push({
          rowKey: existing.id,
          id: existing.id,
          code: existing.code,
          description: existing.description,
          presentation: existing.presentation,
          batch: existing.batch,
          expiryDate: existing.expiryDate,
          aghuQty: existing.aghuQty,
          physicalQty: existing.physicalQty,
          isExtra: true,
          groupSize: matches.length,
          lotIndex: gi + 1,
        });
      });
    });

    return rows;
  };

  const [rows, setRows] = useState<GridRow[]>(buildRows);
  const [searchTerm, setSearchTerm] = useState('');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const catalogKey = JSON.stringify(catalog);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setRows(buildRows());
    setSaveFeedback(null);
  }, [roomId, activeMonth, savedItemsKey, catalogKey]);

  const updateCell = (rowKey: string, field: keyof GridRow, value: string | number) => {
    setRows((prev) => prev.map((r) => (r.rowKey === rowKey ? { ...r, [field]: value } : r)));
  };

  // Adiciona uma nova linha de lote para o mesmo item, logo depois da
  // última linha existente desse código.
  const addLot = (afterRowKey: string) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.rowKey === afterRowKey);
      if (idx === -1) return prev;
      const base = prev[idx];
      const sameGroupCount = prev.filter((r) => r.code === base.code && r.isExtra === base.isExtra).length;
      const newRow: GridRow = {
        rowKey: nextTempId(),
        code: base.code,
        description: base.description,
        presentation: base.presentation,
        batch: '',
        expiryDate: '',
        aghuQty: 0,
        physicalQty: 0,
        isExtra: base.isExtra,
        groupSize: sameGroupCount + 1,
        lotIndex: sameGroupCount + 1,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, newRow);
      // Renumera o grupo inteiro para manter "Lote X/Y" consistente
      let counter = 0;
      return next.map((r) => {
        if (r.code === base.code && r.isExtra === base.isExtra) {
          counter++;
          return { ...r, groupSize: sameGroupCount + 1, lotIndex: counter };
        }
        return r;
      });
    });
  };

  const removeLot = (rowKey: string) => {
    const row = rows.find((r) => r.rowKey === rowKey);
    if (!row) return;
    if (row.groupSize <= 1 && !row.isExtra) {
      // Item padrão com só 1 lote: não remove a linha, só limpa os campos.
      setRows((prev) =>
        prev.map((r) =>
          r.rowKey === rowKey ? { ...r, batch: '', expiryDate: '', aghuQty: 0, physicalQty: 0 } : r
        )
      );
      return;
    }
    if (!window.confirm('Remover esta linha de lote?')) return;
    setRows((prev) => {
      const filtered = prev.filter((r) => r.rowKey !== rowKey);
      let counter = 0;
      const sameGroupTotal = filtered.filter((r) => r.code === row.code && r.isExtra === row.isExtra).length;
      return filtered.map((r) => {
        if (r.code === row.code && r.isExtra === row.isExtra) {
          counter++;
          return { ...r, groupSize: sameGroupTotal, lotIndex: counter };
        }
        return r;
      });
    });
  };

  const filteredKeys = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return new Set(rows.map((r) => r.rowKey));
    return new Set(
      rows
        .filter(
          (r) =>
            r.description.toLowerCase().includes(term) ||
            r.code.toLowerCase().includes(term) ||
            r.batch.toLowerCase().includes(term)
        )
        .map((r) => r.rowKey)
    );
  }, [rows, searchTerm]);

  const alerts = useMemo(() => {
    let zero = 0;
    let low = 0;
    let expiring = 0;
    rows.forEach((r) => {
      const touched = r.isExtra || r.batch || r.expiryDate || r.aghuQty > 0 || r.physicalQty > 0;
      if (!touched) return;
      if (r.physicalQty === 0) zero++;
      else if (r.physicalQty <= 10) low++;
      const st = getExpiryStatus(r.expiryDate);
      if (st === 'expired' || st === 'critical' || st === 'warning') expiring++;
    });
    return { zero, low, expiring };
  }, [rows]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!window.confirm(
      'Ao salvar, o inventário deste mês fica efetivado e fechado — só a chefia poderá reabrir para editar de novo. Confirmar?'
    )) {
      return;
    }
    const payload = rows
      .filter((r) => r.isExtra || r.batch || r.expiryDate || r.aghuQty > 0 || r.physicalQty > 0)
      .map((r) => ({
        id: r.id,
        code: r.code,
        description: r.description,
        presentation: r.presentation,
        batch: r.batch,
        expiryDate: r.expiryDate,
        aghuQty: r.aghuQty,
        physicalQty: r.physicalQty,
        unit: 'UND',
        location: `Estoque ${roomName}`,
        minStock: 10,
      }));

    setIsSaving(true);
    setSaveFeedback(null);
    setSaveError(null);
    const result = await upsertInventoryGridRows(roomId, activeMonth, payload, user?.name || 'Sistema');
    setIsSaving(false);

    if (!result.success) {
      setSaveError(
        `Não foi possível salvar no banco de dados (${result.error || 'erro desconhecido'}). Nada foi perdido na tela — tente salvar de novo. Se persistir, confira sua conexão com a internet.`
      );
      return;
    }
    setSaveFeedback(`Inventário salvo e fechado — ${payload.length} lançamentos efetivados no mês de ${activeMonth}.`);
  };

  const handleReopen = async () => {
    if (!window.confirm('Reabrir o inventário deste mês para edição?')) return;
    await reopenInventory(roomId, activeMonth);
    setSaveFeedback('Inventário reaberto para edição.');
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        `Isso vai EXCLUIR PERMANENTEMENTE todo o inventário lançado da ${roomName} no mês de ${activeMonth}. Essa ação não pode ser desfeita. Confirmar?`
      )
    ) {
      return;
    }
    await clearRoomInventory(roomId, activeMonth);
    setSaveFeedback('Todo o inventário deste mês foi excluído.');
  };

  const handleExport = () => {
    exportInventoryToExcel(savedItems, roomName, activeMonth);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white border border-[#E1E9E4] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#527365] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar medicamento, código ou lote..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs sm:text-sm font-medium text-[#23332B] placeholder:text-[#527365]/70 focus:outline-none focus:border-[#2D5A47] focus:ring-1 focus:ring-[#2D5A47]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3.5 py-2 bg-[#F8FAF9] hover:bg-[#EBF1EE] text-[#23332B] text-xs font-bold rounded-xl border border-[#E1E9E4] transition flex items-center gap-2 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-[#2D5A47]" />
              <span>Exportar Excel</span>
            </button>

            {isChefe && (
              <button
                onClick={() => setIsCatalogModalOpen(true)}
                title="Importar planilha oficial, adicionar ou excluir itens da lista padrão desta sala"
                className="px-3.5 py-2 bg-[#F8FAF9] hover:bg-[#EBF1EE] text-[#23332B] text-xs font-bold rounded-xl border border-[#E1E9E4] transition flex items-center gap-2 cursor-pointer"
              >
                <Boxes className="w-4 h-4 text-[#2D5A47]" />
                <span>Gerenciar Lista de Itens</span>
              </button>
            )}

            {isChefe && isLocked && (
              <button
                onClick={handleReopen}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-200 transition flex items-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Reabrir Inventário</span>
              </button>
            )}

            {canEdit && (
              <>
                <button
                  onClick={onOpenImport}
                  className="px-3.5 py-2 bg-[#EBF1EE] hover:bg-[#CBDED5] text-[#2D5A47] text-xs font-bold rounded-xl border border-[#CBDED5] transition flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#2D5A47]" />
                  <span>Importar Planilha</span>
                </button>
                <button
                  onClick={onOpenAddExtraItem}
                  title="Adicionar um item que não está na lista padrão"
                  className="px-3.5 py-2 bg-[#F8FAF9] hover:bg-[#EBF1EE] text-[#23332B] text-xs font-bold rounded-xl border border-[#E1E9E4] transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#2D5A47]" />
                  <span>Item Fora da Lista</span>
                </button>
                {isChefe && (
                  <button
                    onClick={handleClearAll}
                    title="Excluir permanentemente todo o inventário deste mês"
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir Todo o Inventário</span>
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#2D5A47] hover:bg-[#234737] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'Salvando...' : 'Salvar Inventário'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {isLocked && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>
              Inventário efetivado e fechado
              {lockInfo?.closedBy ? ` por ${lockInfo.closedBy}` : ''}
              {lockInfo?.closedAt ? ` em ${new Date(lockInfo.closedAt).toLocaleString('pt-BR')}` : ''}.
              {isChefe ? ' Clique em "Reabrir Inventário" para editar.' : ' Somente a chefia pode reabrir para editar.'}
            </span>
          </div>
        )}

        {saveError && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Alert summary */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <PackageX className="w-3.5 h-3.5" /> {alerts.zero} zerados
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
            <PackageMinus className="w-3.5 h-3.5" /> {alerts.low} acabando
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-orange-50 text-orange-900 border border-orange-200">
            <AlertTriangle className="w-3.5 h-3.5" /> {alerts.expiring} perto de vencer
          </span>
          {saveFeedback && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#EBF1EE] text-[#2D5A47] border border-[#CBDED5]">
              <CheckCircle2 className="w-3.5 h-3.5" /> {saveFeedback}
            </span>
          )}
        </div>
      </div>

      {/* Spreadsheet grid */}
      <div className="bg-white border border-[#E1E9E4] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs">
            <thead className="bg-[#F3F7F5] border-b border-[#E1E9E4] sticky top-0 z-10">
              <tr className="text-[#527365]">
                <th className="p-2.5 text-left font-extrabold uppercase tracking-wider text-[10px] min-w-[220px]">Medicamento</th>
                <th className="p-2.5 text-left font-extrabold uppercase tracking-wider text-[10px] w-28">Apresentação</th>
                <th className="p-2.5 text-left font-extrabold uppercase tracking-wider text-[10px] w-20">Código</th>
                <th className="p-2.5 text-left font-extrabold uppercase tracking-wider text-[10px] w-16">Lote Nº</th>
                <th className="p-2.5 text-left font-extrabold uppercase tracking-wider text-[10px] w-32">Lote</th>
                <th className="p-2.5 text-left font-extrabold uppercase tracking-wider text-[10px] w-36">Validade</th>
                <th className="p-2.5 text-center font-extrabold uppercase tracking-wider text-[10px] w-24">Qtd AGHU</th>
                <th className="p-2.5 text-center font-extrabold uppercase tracking-wider text-[10px] w-24">Qtd Físico</th>
                <th className="p-2.5 text-center font-extrabold uppercase tracking-wider text-[10px] w-24 bg-[#EBF1EE]">Diferença</th>
                {canEdit && <th className="p-2.5 w-16"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E9E4]">
              {rows.filter((r) => filteredKeys.has(r.rowKey)).length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-[#527365] text-sm">
                    Nenhum item encontrado para essa busca.
                  </td>
                </tr>
              ) : (
                rows
                  .filter((r) => filteredKeys.has(r.rowKey))
                  .map((row, visualIdx) => {
                    const diff = row.physicalQty - row.aghuQty;
                    const expStatus = getExpiryStatus(row.expiryDate);
                    const isFirstOfGroup = row.lotIndex === 1;
                    const rowTint =
                      row.physicalQty === 0 && (row.batch || row.expiryDate || row.aghuQty > 0)
                        ? 'bg-rose-50/40'
                        : expStatus === 'critical' || expStatus === 'expired'
                        ? 'bg-orange-50/40'
                        : visualIdx % 2 === 0
                        ? 'bg-white'
                        : 'bg-[#F8FAF9]';

                    return (
                      <tr
                        key={row.rowKey}
                        className={`${rowTint} hover:bg-[#EBF1EE]/50 transition-colors ${
                          isFirstOfGroup ? 'border-t-2 border-t-[#E1E9E4]' : ''
                        }`}
                      >
                        <td className="p-2 font-semibold text-[#23332B]">
                          {isFirstOfGroup ? row.description : <span className="text-[#527365] italic">↳ mesmo item</span>}
                          {row.isExtra && isFirstOfGroup && (
                            <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold align-middle">
                              EXTRA
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-[#527365]">{isFirstOfGroup ? row.presentation : ''}</td>
                        <td className="p-2 font-mono text-[#527365]">{isFirstOfGroup ? row.code : ''}</td>
                        <td className="p-2 text-center text-[#527365] font-mono">
                          {row.groupSize > 1 ? `${row.lotIndex}/${row.groupSize}` : '—'}
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={row.batch}
                            disabled={!canEdit}
                            onChange={(e) => updateCell(row.rowKey, 'batch', e.target.value)}
                            placeholder="Lote"
                            className="w-full px-2 py-1.5 bg-white border border-[#E1E9E4] rounded-lg text-xs font-mono text-[#23332B] focus:outline-none focus:border-[#2D5A47] disabled:bg-transparent disabled:border-transparent"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="date"
                            value={row.expiryDate}
                            disabled={!canEdit}
                            onChange={(e) => updateCell(row.rowKey, 'expiryDate', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-[#E1E9E4] rounded-lg text-xs text-[#23332B] focus:outline-none focus:border-[#2D5A47] disabled:bg-transparent disabled:border-transparent"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="number"
                            value={row.aghuQty || ''}
                            disabled={!canEdit}
                            onChange={(e) => updateCell(row.rowKey, 'aghuQty', Number(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-1.5 bg-white border border-[#E1E9E4] rounded-lg text-xs text-right font-mono text-[#23332B] focus:outline-none focus:border-[#2D5A47] disabled:bg-transparent disabled:border-transparent"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="number"
                            value={row.physicalQty || ''}
                            disabled={!canEdit}
                            onChange={(e) => updateCell(row.rowKey, 'physicalQty', Number(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-1.5 bg-white border border-[#E1E9E4] rounded-lg text-xs text-right font-mono font-bold text-[#23332B] focus:outline-none focus:border-[#2D5A47] disabled:bg-transparent disabled:border-transparent"
                          />
                        </td>
                        <td className="p-2 text-center bg-[#F8FAF9]">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                              diff === 0 ? 'text-[#2D5A47]' : diff > 0 ? 'text-blue-700' : 'text-rose-700'
                            }`}
                          >
                            {diff === 0 ? '0' : diff > 0 ? `+${diff}` : diff}
                          </span>
                        </td>
                        {canEdit && (
                          <td className="p-2 text-center whitespace-nowrap">
                            <button
                              onClick={() => addLot(row.rowKey)}
                              title="Adicionar outro lote deste mesmo item"
                              className="p-1 text-[#527365] hover:text-[#2D5A47] rounded-md hover:bg-[#EBF1EE] transition cursor-pointer"
                            >
                              <CopyPlus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeLot(row.rowKey)}
                              title={row.groupSize > 1 || row.isExtra ? 'Remover este lote' : 'Limpar esta linha'}
                              className="p-1 text-[#527365] hover:text-rose-600 rounded-md hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-[#F8FAF9] border-t border-[#E1E9E4] text-[11px] text-[#527365]">
          {catalog.length > 0 ? (
            <>
              Lista padrão de <span className="font-extrabold text-[#23332B]">{catalog.length}</span> medicamentos da {roomName}. Edite Lote, Validade e Quantidades — use o ícone{' '}
              <CopyPlus className="w-3 h-3 inline text-[#2D5A47]" /> para lançar mais de um lote do mesmo item — e clique em <strong>Salvar Inventário</strong>.
            </>
          ) : (
            <>
              Esta sala ainda não tem uma lista padrão de itens cadastrada. Envie o modelo oficial de planilha desta sala para que ele seja configurado, ou use <strong>Item Fora da Lista</strong> para lançar manualmente.
            </>
          )}
        </div>
      </div>

      {isChefe && (
        <CatalogManagementModal
          isOpen={isCatalogModalOpen}
          onClose={() => setIsCatalogModalOpen(false)}
          roomId={roomId}
          roomName={roomName}
        />
      )}
    </div>
  );
};
