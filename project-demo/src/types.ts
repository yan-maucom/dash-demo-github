export type RoomId = 
  | 'unitarizacao'
  | 'controlados'
  | 'quimioterapicos'
  | 'mavs'
  | 'injetaveis'
  | 'soros'
  | 'multidoses';

export type NavigationTab = 
  | 'dashboard'
  | 'room'
  | 'hygiene'
  | 'ranking'
  | 'production';

export type UserRole = 'chefe' | 'responsavel_sala';

export type AppTheme = 'green_light';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  roomId?: RoomId; // undefined if chefe
}

export type UsersConfigMap = Record<string, { user: User; passwordHash: string }>;

export interface StandardCatalogItem {
  code: string;
  description: string;
  presentation: string;
}

export interface RoomInfo {
  id: RoomId;
  name: string;
  shortName: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  color: string;
  accentColor: string;
  badgeBg: string;
  responsibleName: string;
  isSpecialProduction?: boolean;
}

export interface InventoryItem {
  id: string;
  roomId: RoomId;
  monthYear: string; // "YYYY-MM", e.g. "2026-08"
  code: string; // Código AGHU / Material
  description: string; // Nome do medicamento / descrição
  presentation: string; // Ex: AMP 10ml, FR/AMP, COMP, BOLSA 500ml
  batch: string; // Lote
  expiryDate: string; // YYYY-MM-DD
  aghuQty: number; // Quantidade no sistema AGHU
  physicalQty: number; // Quantidade na contagem física
  unit: string; // AMP, COMP, FR, ENV, BOLSA, UNID
  location: string; // Gaveta, Prateleira, Geladeira, Armário
  minStock: number; // Estoque Mínimo
  notes?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ProductionItem {
  id: string;
  monthYear: string; // "YYYY-MM"
  date: string; // YYYY-MM-DD
  medicationCode: string;
  medicationName: string;
  batchNumber: string;
  sourceBatch: string;
  producedQty: number; // Doses produzidas/unitarizadas
  lossQty: number; // Doses perdidas
  lossReason?: string; // Motivo da perda
  operatorName: string;
  technicianNote?: string;
  expiryDate: string;
}

export interface RoomHygieneEvaluation {
  id: string;
  roomId: RoomId;
  monthYear: string;
  status: 'conforme' | 'nao_conforme';
  score: number; // 0 - 100%
  evaluatorName: string;
  evaluatedAt: string;
  checklist: Record<string, boolean>;
  observations?: string;
  correctiveActions?: string;
}

export interface RoomInventorySummary {
  roomId: RoomId;
  monthYear: string;
  totalItems: number;
  totalPhysicalQty: number;
  totalAghuQty: number;
  exactItemsCount: number;
  surplusItemsCount: number; // Sobras
  deficitItemsCount: number; // Faltas
  accuracyPercentage: number; // % Acertos
  nearExpiryCount: number; // < 60 ou 90 dias
  criticalExpiryCount: number; // < 30 dias
  expiredCount: number;
  lowStockCount: number; // Físico <= minStock
  zeroStockCount: number; // Físico == 0
  hygieneStatus?: 'conforme' | 'nao_conforme';
  hygieneScore: number; // 0 a 100%
  isCompleted: boolean;
  lastUpdated: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
  lastSync?: string;
}

