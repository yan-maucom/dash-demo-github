import React, { useState, useEffect } from 'react';
import { InventoryItem, RoomId } from '../types';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { X, Save, AlertCircle, Calculator } from 'lucide-react';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: RoomId;
  initialItem?: InventoryItem | null;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  roomId,
  initialItem,
}) => {
  const { addInventoryItem, updateInventoryItem, activeMonth } = useInventory();
  const { user } = useAuth();

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [presentation, setPresentation] = useState('');
  const [batch, setBatch] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [aghuQty, setAghuQty] = useState<number>(0);
  const [physicalQty, setPhysicalQty] = useState<number>(0);
  const [unit, setUnit] = useState('AMP');
  const [location, setLocation] = useState('Prateleira A-01');
  const [minStock, setMinStock] = useState<number>(20);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialItem) {
      setCode(initialItem.code);
      setDescription(initialItem.description);
      setPresentation(initialItem.presentation);
      setBatch(initialItem.batch);
      setExpiryDate(initialItem.expiryDate);
      setAghuQty(initialItem.aghuQty);
      setPhysicalQty(initialItem.physicalQty);
      setUnit(initialItem.unit);
      setLocation(initialItem.location);
      setMinStock(initialItem.minStock);
      setNotes(initialItem.notes || '');
    } else {
      setCode(`MED-${Math.floor(1000 + Math.random() * 9000)}`);
      setDescription('');
      setPresentation('AMP 10ml');
      setBatch(`LT-${Math.floor(10000 + Math.random() * 90000)}`);
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      setExpiryDate(d.toISOString().split('T')[0]);
      setAghuQty(100);
      setPhysicalQty(100);
      setUnit('AMP');
      setLocation('Prateleira A-01');
      setMinStock(20);
      setNotes('');
    }
    setError('');
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const difference = physicalQty - aghuQty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !description.trim()) {
      setError('Código AGHU e Nome do Medicamento são obrigatórios.');
      return;
    }

    if (initialItem) {
      updateInventoryItem(initialItem.id, {
        code,
        description,
        presentation,
        batch,
        expiryDate,
        aghuQty,
        physicalQty,
        unit,
        location,
        minStock,
        notes: notes.trim() || undefined,
        updatedBy: user?.name || 'Chefe CAF',
      });
    } else {
      addInventoryItem({
        roomId,
        monthYear: activeMonth,
        code,
        description,
        presentation,
        batch,
        expiryDate,
        aghuQty,
        physicalQty,
        unit,
        location,
        minStock,
        notes: notes.trim() || undefined,
        updatedBy: user?.name || 'Chefe CAF',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E1E9E4] rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E9E4] bg-[#F8FAF9]">
          <div>
            <h3 className="font-heading font-bold text-[#23332B] text-base">
              {initialItem ? 'Editar Item do Inventário' : 'Lançar Novo Medicamento no Inventário'}
            </h3>
            <p className="text-xs text-[#527365]">
              Mês de referência: <span className="font-semibold text-[#23332B]">{activeMonth}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#527365] hover:text-[#23332B] rounded-xl hover:bg-[#EBF1EE] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 text-[#D32F2F] border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1">
                Código AGHU / Material *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: MED-1001"
                className="w-full px-3.5 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-sm font-medium text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1">
                Apresentação / Forma Farmacêutica
              </label>
              <input
                type="text"
                value={presentation}
                onChange={(e) => setPresentation(e.target.value)}
                placeholder="Ex: AMP 10ml, FR/AMP, COMP"
                className="w-full px-3.5 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-sm font-medium text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1">
              Medicamento / Descrição Completa *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Dipirona Sódica 500mg/ml Gotas"
              className="w-full px-3.5 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-sm font-medium text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1">
                Lote de Fabricação
              </label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="Ex: LT-90214"
                className="w-full px-3.5 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-sm font-medium text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1">
                Data de Validade (AAAA-MM-DD)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-sm font-medium text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
              />
            </div>
          </div>

          {/* Quantities and Live Difference */}
          <div className="p-4 rounded-xl bg-[#EBF1EE] border border-[#CBDED5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#23332B] flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-[#2D5A47]" />
                Contagem & Comparativo com AGHU
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                difference === 0
                  ? 'bg-[#CBDED5] text-[#2D5A47]'
                  : difference > 0
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {difference === 0
                  ? '✓ Exato (0)'
                  : difference > 0
                  ? `+${difference} (Sobra)`
                  : `${difference} (Falta)`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1">
                  Qtd no AGHU (Sistema)
                </label>
                <input
                  type="number"
                  min="0"
                  value={aghuQty}
                  onChange={(e) => setAghuQty(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-white border border-[#E1E9E4] rounded-xl text-sm font-bold text-[#23332B] font-mono focus:outline-none focus:border-[#2D5A47]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1">
                  Qtd Físico (Contagem Real)
                </label>
                <input
                  type="number"
                  min="0"
                  value={physicalQty}
                  onChange={(e) => setPhysicalQty(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-white border border-[#E1E9E4] rounded-xl text-sm font-bold text-[#23332B] font-mono focus:outline-none focus:border-[#2D5A47]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1">
                Unidade
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs font-semibold text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
              >
                <option value="AMP">AMP (Ampola)</option>
                <option value="FR/AMP">FR/AMP (Frasco Ampola)</option>
                <option value="COMP">COMP (Comprimido)</option>
                <option value="CAP">CAP (Cápsula)</option>
                <option value="FR">FR (Frasco)</option>
                <option value="BOLSA">BOLSA (Soro/SPGV)</option>
                <option value="ENV">ENV (Envelope)</option>
                <option value="UNID">UNID (Unidade)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1">
                Localização
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Prateleira B-02"
                className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs font-medium text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1">
                Estoque Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs font-medium text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1">
              Observações da Conferência
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Justificativa de divergência ou observações para o farmacêutico..."
              className="w-full px-3.5 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs font-medium text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
            />
          </div>

          <div className="pt-3 border-t border-[#E1E9E4] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#527365] hover:bg-[#EBF1EE] rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2D5A47] hover:bg-[#244b3b] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
