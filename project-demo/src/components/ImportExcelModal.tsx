import React, { useState, useRef } from 'react';
import { RoomId, InventoryItem, ProductionItem } from '../types';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import {
  parseInventoryExcel,
  parseProductionExcel,
  downloadInventoryTemplate,
  downloadProductionTemplate,
} from '../services/excelService';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: RoomId;
  mode?: 'inventory' | 'production';
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  roomId,
  mode = 'inventory',
}) => {
  const { importInventoryItems, importProductionItems, activeMonth } = useInventory();
  const { user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewItems, setPreviewItems] = useState<InventoryItem[] | ProductionItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setErrors([]);
    setPreviewItems([]);

    try {
      if (mode === 'inventory') {
        const result = await parseInventoryExcel(
          selectedFile,
          roomId,
          activeMonth,
          user?.name || 'Chefia CAF'
        );
        if (result.success) {
          setPreviewItems(result.data);
        } else {
          setErrors(result.errors);
        }
      } else {
        const result = await parseProductionExcel(
          selectedFile,
          activeMonth,
          user?.name || 'Técnico Unitarização'
        );
        if (result.success) {
          setPreviewItems(result.data);
        } else {
          setErrors(result.errors);
        }
      }
    } catch (err) {
      setErrors([`Erro ao ler arquivo: ${(err as Error).message}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (previewItems.length === 0) return;

    if (mode === 'inventory') {
      importInventoryItems(previewItems as InventoryItem[], replaceExisting);
    } else {
      importProductionItems(previewItems as ProductionItem[]);
    }

    onClose();
  };

  const handleDownloadModel = () => {
    if (mode === 'inventory') {
      downloadInventoryTemplate();
    } else {
      downloadProductionTemplate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E1E9E4] rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E9E4] bg-[#F8FAF9]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#EBF1EE] text-[#2D5A47] rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[#23332B] text-base">
                {mode === 'inventory' ? 'Importar Planilha de Inventário' : 'Importar Planilha de Produção'}
              </h3>
              <p className="text-xs text-[#527365]">
                Formatos: Excel (.xlsx, .xls) ou CSV • Mês: <span className="font-bold text-[#23332B]">{activeMonth}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#527365] hover:text-[#23332B] rounded-xl hover:bg-[#EBF1EE] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Download Model Action Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#EBF1EE] border border-[#CBDED5]">
            <div>
              <h4 className="text-xs font-bold text-[#2D5A47] uppercase tracking-wider text-[10px]">
                Precisa do modelo padrão da CAF?
              </h4>
              <p className="text-xs text-[#527365] mt-0.5">
                Baixe a planilha modelo com colunas pré-formatadas (Código, Medicamento, Lote, AGHU, Físico).
              </p>
            </div>
            <button
              onClick={handleDownloadModel}
              className="px-4 py-2 bg-[#2D5A47] hover:bg-[#244b3b] text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Modelo Padrão</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          {!file && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#CBDED5] hover:border-[#2D5A47] rounded-2xl p-8 text-center cursor-pointer hover:bg-[#F8FAF9] transition flex flex-col items-center justify-center gap-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-[#EBF1EE] flex items-center justify-center text-[#2D5A47]">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#23332B]">
                  Clique para selecionar ou arraste o arquivo da planilha aqui
                </p>
                <p className="text-xs text-[#527365] mt-1">
                  Compatível com planilhas exportadas do AGHU ou planilhas de contagem manual
                </p>
              </div>
            </div>
          )}

          {/* Processing state */}
          {isProcessing && (
            <div className="p-8 text-center space-y-2">
              <div className="w-7 h-7 border-2 border-[#2D5A47] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-[#527365]">
                Lendo e processando planilha...
              </p>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-[#D32F2F] space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Ocorreram problemas ao processar o arquivo:</span>
              </div>
              <ul className="list-disc list-inside text-xs pl-2 space-y-0.5 opacity-90">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview of read items */}
          {previewItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A47]" />
                  <span className="text-xs font-bold text-[#23332B]">
                    {previewItems.length} registros identificados no arquivo &quot;{file?.name}&quot;
                  </span>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewItems([]);
                  }}
                  className="text-xs text-[#527365] hover:text-[#23332B] underline cursor-pointer"
                >
                  Trocar arquivo
                </button>
              </div>

              {/* Preview Table */}
              <div className="border border-[#E1E9E4] rounded-xl overflow-hidden max-h-56 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-[#527365] font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5 text-[10px] uppercase">Código</th>
                      <th className="p-2.5 text-[10px] uppercase">Descrição</th>
                      <th className="p-2.5 text-[10px] uppercase">Lote</th>
                      <th className="p-2.5 text-[10px] uppercase">Validade</th>
                      {mode === 'inventory' ? (
                        <>
                          <th className="p-2.5 text-right text-[10px] uppercase">AGHU</th>
                          <th className="p-2.5 text-right text-[10px] uppercase">Físico</th>
                        </>
                      ) : (
                        <>
                          <th className="p-2.5 text-right text-[10px] uppercase">Produzidas</th>
                          <th className="p-2.5 text-right text-[10px] uppercase">Perdas</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E9E4] text-[#23332B]">
                    {previewItems.slice(0, 8).map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAF9]">
                        <td className="p-2.5 font-mono font-bold text-[#2D5A47]">
                          {'code' in item ? item.code : item.medicationCode}
                        </td>
                        <td className="p-2.5 font-medium text-[#23332B] max-w-xs truncate">
                          {'description' in item ? item.description : item.medicationName}
                        </td>
                        <td className="p-2.5 font-mono text-[#527365]">
                          {'batch' in item ? item.batch : item.batchNumber}
                        </td>
                        <td className="p-2.5 text-[#527365]">
                          {item.expiryDate}
                        </td>
                        {mode === 'inventory' ? (
                          <>
                            <td className="p-2.5 text-right font-mono font-semibold text-[#527365]">
                              {(item as InventoryItem).aghuQty}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-[#23332B]">
                              {(item as InventoryItem).physicalQty}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-2.5 text-right font-mono font-bold text-[#2D5A47]">
                              {(item as ProductionItem).producedQty}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-[#D32F2F]">
                              {(item as ProductionItem).lossQty}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewItems.length > 8 && (
                <p className="text-[11px] text-[#527365] text-right">
                  + {previewItems.length - 8} itens adicionais serão carregados.
                </p>
              )}

              {/* Mode Options */}
              {mode === 'inventory' && (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="replaceToggle"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                    className="w-4 h-4 text-[#2D5A47] rounded cursor-pointer accent-[#2D5A47]"
                  />
                  <label htmlFor="replaceToggle" className="text-xs text-[#23332B] font-medium cursor-pointer">
                    Substituir inventário atual desta sala no mês de <span className="font-bold">{activeMonth}</span> (Recomendado para novas cargas)
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E1E9E4] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#527365] hover:bg-[#EBF1EE] rounded-xl transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={previewItems.length === 0}
            onClick={handleConfirmImport}
            className="px-6 py-2 bg-[#2D5A47] hover:bg-[#244b3b] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar e Carregar {previewItems.length} Registros</span>
          </button>
        </div>
      </div>
    </div>
  );
};
