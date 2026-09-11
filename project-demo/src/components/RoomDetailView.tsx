import React, { useState } from 'react';
import { RoomId, InventoryItem } from '../types';
import { ROOMS_CONFIG } from '../data/mockData';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { InventoryGrid } from './InventoryGrid';
import { AccuracyCharts } from './AccuracyCharts';
import { ProductionTab } from './ProductionTab';
import { ItemFormModal } from './ItemFormModal';
import { ImportExcelModal } from './ImportExcelModal';
import { HygieneEvaluationModal } from './HygieneEvaluationModal';
import {
  ArrowLeft,
  Sparkles,
  ClipboardCheck,
  TrendingUp,
  Table as TableIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

interface RoomDetailViewProps {
  roomId: RoomId;
  onBackToDashboard: () => void;
  onSelectOtherRoom: (roomId: RoomId) => void;
}

type TabType = 'inventory' | 'charts' | 'production';

export const RoomDetailView: React.FC<RoomDetailViewProps> = ({
  roomId,
  onBackToDashboard,
  onSelectOtherRoom,
}) => {
  const room = ROOMS_CONFIG.find((r) => r.id === roomId) || ROOMS_CONFIG[0];
  const { getRoomSummary, getRoomHygiene, getRoomItems, activeMonth } = useInventory();
  const { isChefe } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<InventoryItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'inventory' | 'production'>('inventory');
  const [isHygieneModalOpen, setIsHygieneModalOpen] = useState(false);

  const summary = getRoomSummary(roomId, activeMonth);
  const hygiene = getRoomHygiene(roomId, activeMonth);
  const items = getRoomItems(roomId, activeMonth);

  const handleOpenAddItem = () => {
    setSelectedItemForEdit(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: InventoryItem) => {
    setSelectedItemForEdit(item);
    setIsItemModalOpen(true);
  };

  const handleOpenImportInventory = () => {
    setImportMode('inventory');
    setIsImportModalOpen(true);
  };

  const handleOpenImportProduction = () => {
    setImportMode('production');
    setIsImportModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Breadcrumb & Quick Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#527365]">
          <button
            onClick={onBackToDashboard}
            className="hover:text-[#2D5A47] font-semibold flex items-center gap-1 cursor-pointer transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Painel de Salas</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#527365]" />
          <span className="font-bold text-[#23332B]">{room.name}</span>
        </div>

        {/* Quick Room Switcher for Chief */}
        {isChefe && (
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            <span className="text-[10px] font-bold text-[#527365] uppercase tracking-wider mr-1">Ir para:</span>
            {ROOMS_CONFIG.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelectOtherRoom(r.id)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                  r.id === roomId
                    ? 'bg-[#2D5A47] text-white shadow-xs'
                    : 'bg-[#EBF1EE] hover:bg-[#CBDED5] text-[#23332B]'
                }`}
              >
                {r.shortName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Room Hero Header with Clean Soft Green Minimalism */}
      <div className="relative rounded-2xl overflow-hidden bg-[#2D5A47] text-white shadow-sm border border-[#244b3b]">
        <div className="h-40 sm:h-48 w-full relative">
          <img
            src={room.imageUrl}
            alt={room.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80';
            }}
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2D5A47] via-[#2D5A47]/70 to-transparent" />
        </div>

        <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-end">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#3D7860] text-emerald-100 border border-white/10">
                  {room.shortName}
                </span>
                <span className="text-xs font-medium text-[#CBDED5]">
                  Responsável: <strong className="text-white font-semibold">{room.responsibleName}</strong>
                </span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                {room.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#CBDED5] line-clamp-1">
                {room.description}
              </p>
            </div>

            {/* Hygiene & Organization Status Card / Action */}
            <div className="bg-[#244b3b] border border-[#3D7860] p-3.5 rounded-xl flex items-center justify-between gap-4 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#CBDED5] block">
                  Limpeza & Organização
                </span>
                {hygiene ? (
                  <span className={`text-xs font-bold flex items-center gap-1.5 mt-0.5 ${
                    hygiene.status === 'conforme' ? 'text-emerald-300' : 'text-rose-300'
                  }`}>
                    {hygiene.status === 'conforme' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span>{hygiene.status === 'conforme' ? 'Conforme (100% OK)' : 'Não Conforme'}</span>
                  </span>
                ) : (
                  <span className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Pendente de Avaliação</span>
                  </span>
                )}
              </div>

              <button
                onClick={() => setIsHygieneModalOpen(true)}
                className="px-3 py-1.5 bg-white hover:bg-[#F3F7F5] text-[#2D5A47] font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-[#2D5A47]" />
                <span>{isChefe ? 'Avaliar Sala' : 'Ver Avaliação'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center justify-between border-b border-[#E1E9E4] pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-[#2D5A47] text-white shadow-xs'
                : 'text-[#527365] hover:text-[#23332B] hover:bg-[#EBF1EE]'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Inventário Mensal ({items.length} Itens)</span>
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`px-4 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'charts'
                ? 'bg-[#2D5A47] text-white shadow-xs'
                : 'text-[#527365] hover:text-[#23332B] hover:bg-[#EBF1EE]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Gráficos de Acurácia & Divergência</span>
          </button>

          {room.isSpecialProduction && (
            <button
              onClick={() => setActiveTab('production')}
              className={`px-4 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'production'
                  ? 'bg-[#2D5A47] text-white shadow-xs'
                  : 'text-[#2D5A47] hover:bg-[#EBF1EE]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Aba de Produção Mensal</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'inventory' && (
        <InventoryGrid
          roomId={roomId}
          roomName={room.name}
          onOpenImport={handleOpenImportInventory}
          onOpenAddExtraItem={handleOpenAddItem}
        />
      )}

      {activeTab === 'charts' && (
        <AccuracyCharts
          items={items}
          summary={summary}
          roomName={room.name}
        />
      )}

      {activeTab === 'production' && room.isSpecialProduction && (
        <ProductionTab onOpenImport={handleOpenImportProduction} />
      )}

      {/* Modals */}
      <ItemFormModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        roomId={roomId}
        initialItem={selectedItemForEdit}
      />

      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        roomId={roomId}
        mode={importMode}
      />

      <HygieneEvaluationModal
        isOpen={isHygieneModalOpen}
        onClose={() => setIsHygieneModalOpen(false)}
        roomId={roomId}
        roomName={room.name}
      />
    </div>
  );
};
