import React, { useState, useMemo } from 'react';
import { InventoryItem, RoomId } from '../types';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { exportInventoryToExcel } from '../services/excelService';
import {
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  Package,
  CheckCircle2,
  ArrowUpDown,
  FileDown,
} from 'lucide-react';

interface InventoryTableProps {
  roomId: RoomId;
  roomName: string;
  items: InventoryItem[];
  onOpenAddItem: () => void;
  onOpenEditItem: (item: InventoryItem) => void;
  onOpenImport: () => void;
}

type FilterType = 'all' | 'divergent' | 'expiry' | 'low' | 'zero' | 'exact';

export const InventoryTable: React.FC<InventoryTableProps> = ({
  roomId,
  roomName,
  items,
  onOpenAddItem,
  onOpenEditItem,
  onOpenImport,
}) => {
  const { deleteInventoryItem, activeMonth } = useInventory();
  const { isChefe, canEditRoom } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<keyof InventoryItem>('code');
  const [sortAsc, setSortAsc] = useState(true);

  const canEdit = isChefe || canEditRoom(roomId);

  // Helper for expiry countdown
  const getExpiryInfo = (expiryDateStr: string) => {
    if (!expiryDateStr) return { days: 999, label: 'Sem data', status: 'normal' };
    const exp = new Date(expiryDateStr);
    const now = new Date();
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { days: diffDays, label: `Venceu há ${Math.abs(diffDays)}d`, status: 'expired' };
    } else if (diffDays <= 30) {
      return { days: diffDays, label: `Vence em ${diffDays}d`, status: 'critical' };
    } else if (diffDays <= 60) {
      return { days: diffDays, label: `Vence em ${diffDays}d`, status: 'warning' };
    } else if (diffDays <= 90) {
      return { days: diffDays, label: `Vence em ${diffDays}d`, status: 'notice' };
    }
    return { days: diffDays, label: expiryDateStr, status: 'normal' };
  };

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        item.code.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.batch.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      // Filter chips
      const diff = item.physicalQty - item.aghuQty;
      const expInfo = getExpiryInfo(item.expiryDate);

      if (filterType === 'divergent') return diff !== 0;
      if (filterType === 'exact') return diff === 0;
      if (filterType === 'expiry') return expInfo.days <= 60;
      if (filterType === 'zero') return item.physicalQty === 0;
      if (filterType === 'low') return item.physicalQty > 0 && item.physicalQty <= item.minStock;

      return true;
    });
  }, [items, searchTerm, filterType]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = (aVal as string).toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal === bVal) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;

      return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [filteredItems, sortField, sortAsc]);

  const handleSort = (field: keyof InventoryItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExport = () => {
    exportInventoryToExcel(items, roomName, activeMonth);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Deseja realmente excluir o medicamento "${name}" do inventário?`)) {
      deleteInventoryItem(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Search, Filters, and Action Buttons */}
      <div className="bg-white border border-[#E1E9E4] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#527365] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código AGHU, medicamento, lote, localização..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs sm:text-sm font-medium text-[#23332B] placeholder:text-[#527365]/70 focus:outline-none focus:border-[#2D5A47] focus:ring-1 focus:ring-[#2D5A47]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              title="Exportar dados atuais para Excel (.xlsx)"
              className="px-3.5 py-2 bg-[#F8FAF9] hover:bg-[#EBF1EE] text-[#23332B] text-xs font-bold rounded-xl border border-[#E1E9E4] transition flex items-center gap-2 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-[#2D5A47]" />
              <span>Exportar Excel</span>
            </button>

            <button
              onClick={onOpenImport}
              title="Subir planilha modelo para o inventário"
              className="px-3.5 py-2 bg-[#EBF1EE] hover:bg-[#CBDED5] text-[#2D5A47] text-xs font-bold rounded-xl border border-[#CBDED5] transition flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#2D5A47]" />
              <span>Importar Planilha</span>
            </button>

            <button
              onClick={onOpenAddItem}
              className="px-4 py-2 bg-[#2D5A47] hover:bg-[#234737] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Lançar Medicamento</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 pt-1">
          <span className="text-xs font-bold text-[#527365] uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0 text-[10px]">
            <Filter className="w-3 h-3 text-[#2D5A47]" />
            Filtros:
          </span>

          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#2D5A47] text-white shadow-xs'
                : 'bg-[#EBF1EE] text-[#23332B] hover:bg-[#CBDED5]'
            }`}
          >
            Todos ({items.length})
          </button>

          <button
            onClick={() => setFilterType('divergent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filterType === 'divergent'
                ? 'bg-[#D32F2F] text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Com Divergência ({items.filter((i) => i.physicalQty !== i.aghuQty).length})
          </button>

          <button
            onClick={() => setFilterType('exact')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filterType === 'exact'
                ? 'bg-[#2D5A47] text-white shadow-xs'
                : 'bg-emerald-50 text-[#2D5A47] border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Exatos 100% ({items.filter((i) => i.physicalQty === i.aghuQty).length})
          </button>

          <button
            onClick={() => setFilterType('expiry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filterType === 'expiry'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Perto de Vencer (&lt;60d)
          </button>

          <button
            onClick={() => setFilterType('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filterType === 'low'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100'
            }`}
          >
            Acabando ({items.filter((i) => i.physicalQty > 0 && i.physicalQty <= i.minStock).length})
          </button>

          <button
            onClick={() => setFilterType('zero')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filterType === 'zero'
                ? 'bg-[#23332B] text-white shadow-xs'
                : 'bg-[#F8FAF9] text-[#527365] border border-[#E1E9E4] hover:bg-[#EBF1EE]'
            }`}
          >
            Zerados ({items.filter((i) => i.physicalQty === 0).length})
          </button>
        </div>
      </div>

      {/* Spreadsheet Table Grid */}
      <div className="bg-white border border-[#E1E9E4] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E1E9E4] text-[#527365] font-sans text-[11px] select-none">
                <th
                  onClick={() => handleSort('code')}
                  className="p-3.5 font-extrabold uppercase tracking-wider cursor-pointer hover:text-[#2D5A47] whitespace-nowrap text-[10px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Código AGHU</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('description')}
                  className="p-3.5 font-extrabold uppercase tracking-wider cursor-pointer hover:text-[#2D5A47] min-w-[240px] text-[10px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Medicamento / Descrição</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3.5 font-extrabold uppercase tracking-wider whitespace-nowrap text-[10px]">
                  Apresentação
                </th>
                <th className="p-3.5 font-extrabold uppercase tracking-wider whitespace-nowrap text-[10px]">
                  Lote
                </th>
                <th
                  onClick={() => handleSort('expiryDate')}
                  className="p-3.5 font-extrabold uppercase tracking-wider cursor-pointer hover:text-[#2D5A47] whitespace-nowrap text-[10px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Validade</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('aghuQty')}
                  className="p-3.5 font-extrabold uppercase tracking-wider text-right cursor-pointer hover:text-[#2D5A47] whitespace-nowrap text-[10px]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Qtd AGHU</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('physicalQty')}
                  className="p-3.5 font-extrabold uppercase tracking-wider text-right cursor-pointer hover:text-[#2D5A47] whitespace-nowrap text-[10px]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Qtd Físico</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                {/* Diferença Column Highlighted */}
                <th className="p-3.5 font-extrabold uppercase tracking-wider text-center bg-[#EBF1EE] text-[#2D5A47] whitespace-nowrap text-[10px]">
                  Diferença (F - AGHU)
                </th>
                <th className="p-3.5 font-extrabold uppercase tracking-wider text-center whitespace-nowrap text-[10px]">
                  Status Validade
                </th>
                <th className="p-3.5 font-extrabold uppercase tracking-wider text-center whitespace-nowrap text-[10px]">
                  Estoque
                </th>
                <th className="p-3.5 font-extrabold uppercase tracking-wider whitespace-nowrap text-[10px]">
                  Localização
                </th>
                <th className="p-3.5 font-extrabold uppercase tracking-wider text-right whitespace-nowrap text-[10px]">
                  Ações
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#E1E9E4] text-[#23332B] font-medium">
              {sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-12 text-center text-[#527365]">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#2D5A47]" />
                    <p className="font-bold text-sm text-[#23332B]">Nenhum medicamento encontrado para os filtros selecionados.</p>
                    <p className="text-xs mt-1">Lance um novo medicamento ou importe a planilha modelo para este mês.</p>
                  </td>
                </tr>
              ) : (
                sortedItems.map((item, index) => {
                  const diff = item.physicalQty - item.aghuQty;
                  const expInfo = getExpiryInfo(item.expiryDate);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#EBF1EE]/60 transition-colors ${
                        index % 2 === 0
                          ? 'bg-white'
                          : 'bg-[#F8FAF9]'
                      }`}
                    >
                      {/* Código AGHU */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#2D5A47] bg-[#EBF1EE] px-2 py-1 rounded-md border border-[#CBDED5]">
                          {item.code}
                        </span>
                      </td>

                      {/* Descrição */}
                      <td className="p-3.5 font-bold text-[#23332B]">
                        <div>
                          <span className="text-[#23332B] text-xs sm:text-[13px]">{item.description}</span>
                          {item.notes && (
                            <p className="text-[11px] text-[#527365] font-normal italic mt-0.5 line-clamp-1">
                              Obs: {item.notes}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Apresentação */}
                      <td className="p-3.5 text-[#23332B] font-medium whitespace-nowrap">
                        {item.presentation}
                      </td>

                      {/* Lote */}
                      <td className="p-3.5 font-mono font-medium text-[#23332B] whitespace-nowrap">
                        {item.batch}
                      </td>

                      {/* Validade */}
                      <td className="p-3.5 font-mono text-[#23332B] whitespace-nowrap">
                        {item.expiryDate}
                      </td>

                      {/* Qtd AGHU */}
                      <td className="p-3.5 text-right font-mono font-bold text-[#527365] whitespace-nowrap">
                        {item.aghuQty.toLocaleString('pt-BR')} <span className="text-[10px] text-[#527365] font-sans">{item.unit}</span>
                      </td>

                      {/* Qtd Físico */}
                      <td className="p-3.5 text-right font-mono font-black text-[#23332B] whitespace-nowrap">
                        {item.physicalQty.toLocaleString('pt-BR')} <span className="text-[10px] text-[#527365] font-sans">{item.unit}</span>
                      </td>

                      {/* DIFERENÇA COLUMN */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-1 rounded-lg text-xs ${
                          diff === 0
                            ? 'bg-[#EBF1EE] text-[#2D5A47] border border-[#CBDED5]'
                            : diff > 0
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {diff === 0 ? '0 (Exato)' : diff > 0 ? `+${diff} (Sobra)` : `${diff} (Falta)`}
                        </span>
                      </td>

                      {/* Status Validade Badge */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          expInfo.status === 'expired'
                            ? 'bg-rose-600 text-white'
                            : expInfo.status === 'critical'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : expInfo.status === 'warning'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-[#EBF1EE] text-[#2D5A47] border border-[#CBDED5]'
                        }`}>
                          {expInfo.label}
                        </span>
                      </td>

                      {/* Status Estoque Badge */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        {item.physicalQty === 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-900 border border-slate-300">
                            ZERADO
                          </span>
                        ) : item.physicalQty <= item.minStock ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                            ACABANDO
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[11px] text-[#527365] font-semibold">
                            Normal
                          </span>
                        )}
                      </td>

                      {/* Localização */}
                      <td className="p-3.5 text-[#23332B] font-medium whitespace-nowrap">
                        {item.location}
                      </td>

                      {/* Ações (Editar, Excluir) */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenEditItem(item)}
                            title={isChefe ? 'Editar registro (Chefia)' : 'Editar contagem'}
                            className="p-1.5 text-[#527365] hover:text-[#2D5A47] rounded-lg hover:bg-[#EBF1EE] transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {canEdit && (
                            <button
                              onClick={() => handleDelete(item.id, item.description)}
                              title="Excluir item"
                              className="p-1.5 text-[#527365] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="px-4 py-3 bg-[#F8FAF9] border-t border-[#E1E9E4] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#527365]">
          <div>
            Exibindo <span className="font-extrabold text-[#23332B]">{sortedItems.length}</span> de <span className="font-extrabold text-[#23332B]">{items.length}</span> medicamentos auditados no mês de <span className="font-bold text-[#2D5A47]">{activeMonth}</span>.
          </div>
          <div className="flex items-center gap-4 font-medium">
            <span>Físico Total: <strong className="text-[#23332B] font-mono font-bold">{sortedItems.reduce((acc, i) => acc + i.physicalQty, 0).toLocaleString('pt-BR')}</strong></span>
            <span>AGHU Total: <strong className="text-[#23332B] font-mono font-bold">{sortedItems.reduce((acc, i) => acc + i.aghuQty, 0).toLocaleString('pt-BR')}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
