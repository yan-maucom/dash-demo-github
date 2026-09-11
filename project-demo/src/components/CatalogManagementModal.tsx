import React, { useState, useRef } from 'react';
import { RoomId, StandardCatalogItem } from '../types';
import { useInventory } from '../context/InventoryContext';
import { parseCatalogExcel } from '../services/excelService';
import {
  X,
  Boxes,
  Upload,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface CatalogManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: RoomId;
  roomName: string;
}

export const CatalogManagementModal: React.FC<CatalogManagementModalProps> = ({
  isOpen,
  onClose,
  roomId,
  roomName,
}) => {
  const { getCatalog, replaceCatalog, mergeCatalog, deleteCatalogItem, addCatalogItem } = useInventory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [pendingItems, setPendingItems] = useState<StandardCatalogItem[] | null>(null);
  const [pendingFileName, setPendingFileName] = useState('');

  const [newCode, setNewCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPres, setNewPres] = useState('');

  const catalog = getCatalog(roomId);

  if (!isOpen) return null;

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setFeedback(null);
    setPendingItems(null);
    const result = await parseCatalogExcel(file);
    setIsProcessing(false);
    if (!result.success) {
      setFeedback({ success: false, message: result.errors[0] || 'Não foi possível ler a planilha.' });
      return;
    }
    setPendingItems(result.data);
    setPendingFileName(file.name);
  };

  const confirmReplace = async () => {
    if (!pendingItems) return;
    await replaceCatalog(roomId, pendingItems);
    setFeedback({ success: true, message: `Lista substituída — ${pendingItems.length} itens agora na ${roomName}.` });
    setPendingItems(null);
  };

  const confirmMerge = async () => {
    if (!pendingItems) return;
    await mergeCatalog(roomId, pendingItems);
    setFeedback({ success: true, message: `${pendingItems.length} itens adicionados/atualizados na lista da ${roomName}.` });
    setPendingItems(null);
  };

  const handleDelete = async (code: string, description: string) => {
    if (!window.confirm(`Excluir "${description}" da lista padrão da ${roomName}? Isso não apaga inventários já lançados, só remove da lista fixa.`)) {
      return;
    }
    await deleteCatalogItem(roomId, code);
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newDesc.trim()) return;
    await addCatalogItem(roomId, {
      code: newCode.trim(),
      description: newDesc.trim(),
      presentation: newPres.trim(),
    });
    setNewCode('');
    setNewDesc('');
    setNewPres('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E1E9E4] rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E9E4] bg-[#F8FAF9] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#EBF1EE] text-[#2D5A47] rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[#23332B] text-base">
                Lista de Itens — {roomName}
              </h3>
              <p className="text-xs text-[#527365]">{catalog.length} itens cadastrados nesta sala</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#527365] hover:text-[#23332B] rounded-xl hover:bg-[#EBF1EE] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Import section */}
          <div className="p-4 rounded-xl border border-[#E1E9E4] bg-[#F8FAF9] space-y-3">
            <p className="text-xs font-bold text-[#23332B]">Importar planilha oficial desta sala</p>
            <p className="text-[11px] text-[#527365]">
              Sobe a lista de medicamentos do modelo do hospital. Você escolhe se quer <strong>substituir</strong> tudo (apaga os itens atuais e usa só os da planilha) ou <strong>adicionar/atualizar</strong> (mantém os que já existem e só inclui/atualiza os da planilha).
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                e.target.value = '';
              }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-4 py-2 bg-[#2D5A47] hover:bg-[#234737] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{isProcessing ? 'Lendo planilha...' : 'Escolher Planilha (.xlsx)'}</span>
            </button>

            {pendingItems && (
              <div className="p-3 rounded-xl bg-white border border-[#CBDED5] space-y-2">
                <p className="text-xs text-[#23332B]">
                  <strong>{pendingFileName}</strong> — {pendingItems.length} itens identificados. O que você quer fazer?
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={confirmMerge}
                    className="px-3 py-1.5 bg-[#EBF1EE] hover:bg-[#CBDED5] text-[#2D5A47] text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    Adicionar / Atualizar
                  </button>
                  <button
                    onClick={confirmReplace}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    Substituir lista inteira
                  </button>
                  <button
                    onClick={() => setPendingItems(null)}
                    className="px-3 py-1.5 bg-white hover:bg-[#F8FAF9] text-[#527365] text-xs font-semibold rounded-lg border border-[#E1E9E4] transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {feedback && (
              <div
                className={`flex items-center gap-2 p-2.5 text-xs rounded-lg border ${
                  feedback.success
                    ? 'bg-[#EBF1EE] text-[#2D5A47] border-[#CBDED5]'
                    : 'bg-rose-50 text-[#D32F2F] border-rose-200'
                }`}
              >
                {feedback.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}
          </div>

          {/* Manual add */}
          <form onSubmit={handleAddManual} className="p-4 rounded-xl border border-[#E1E9E4] space-y-2">
            <p className="text-xs font-bold text-[#23332B]">Adicionar item manualmente</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Código"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="px-3 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-lg text-xs font-mono"
              />
              <input
                type="text"
                placeholder="Descrição do medicamento"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="px-3 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-lg text-xs sm:col-span-1"
              />
              <input
                type="text"
                placeholder="Apresentação"
                value={newPres}
                onChange={(e) => setNewPres(e.target.value)}
                className="px-3 py-2 bg-[#F8FAF9] border border-[#E1E9E4] rounded-lg text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#F8FAF9] hover:bg-[#EBF1EE] text-[#2D5A47] text-xs font-bold rounded-lg border border-[#E1E9E4] transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar
            </button>
          </form>

          {/* Current list */}
          <div>
            <p className="text-xs font-bold text-[#23332B] mb-2">Itens atuais ({catalog.length})</p>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {catalog.length === 0 && (
                <p className="text-xs text-[#527365] italic">Nenhum item cadastrado ainda nesta sala.</p>
              )}
              {catalog.map((item) => (
                <div
                  key={item.code}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[#F8FAF9] border border-[#E1E9E4]"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#23332B] truncate">{item.description}</p>
                    <p className="text-[10px] text-[#527365] font-mono">
                      {item.code} {item.presentation && `· ${item.presentation}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.code, item.description)}
                    title="Excluir da lista"
                    className="p-1.5 text-[#527365] hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
