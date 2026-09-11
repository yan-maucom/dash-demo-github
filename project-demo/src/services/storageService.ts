import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  InventoryItem,
  ProductionItem,
  RoomHygieneEvaluation,
  SupabaseConfig,
  UsersConfigMap,
  StandardCatalogItem,
  RoomId,
} from '../types';
import {
  INITIAL_INVENTORY_ITEMS,
  INITIAL_PRODUCTION_ITEMS,
  INITIAL_HYGIENE_EVALUATIONS,
  USERS_CONFIG,
  STANDARD_CATALOG,
} from '../data/mockData';

// Nunca deixa um valor que não seja uma data real (ex: um número de lote
// que caiu na coluna errada) ser enviado para uma coluna "date" do banco —
// isso derruba a gravação inteira. Se não for uma data válida, vira null.
const safeDate = (val: string | null | undefined): string | null => {
  if (!val) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(val) ? val : null;
};

const KEYS = {
  INVENTORY: 'caf_inventory_items_v2',
  PRODUCTION: 'caf_production_items_v2',
  HYGIENE: 'caf_hygiene_evaluations_v2',
  LAST_SYNC: 'caf_supabase_last_sync_v2',
  ACTIVE_MONTH: 'caf_active_month_v2',
  USERS: 'caf_users_config_v1',
  CATALOG: 'caf_catalog_v1',
  LOCKS: 'caf_inventory_locks_v1',
};

export interface InventoryLockEntry {
  status: 'aberto' | 'fechado';
  closedBy?: string;
  closedAt?: string;
}

// --- Row <-> App type mapping -------------------------------------------------

const inventoryToRow = (i: InventoryItem) => ({
  id: i.id,
  room_id: i.roomId,
  month_year: i.monthYear,
  code: i.code,
  description: i.description,
  presentation: i.presentation,
  batch: i.batch,
  // Colunas do tipo "date" no Postgres não aceitam string vazia — precisa
  // ser null quando o item está zerado/sem validade informada.
  expiry_date: safeDate(i.expiryDate),
  aghu_qty: i.aghuQty,
  physical_qty: i.physicalQty,
  unit: i.unit,
  location: i.location,
  min_stock: i.minStock,
  notes: i.notes,
  updated_at: i.updatedAt,
  updated_by: i.updatedBy,
});

const rowToInventory = (r: any): InventoryItem => ({
  id: r.id,
  roomId: r.room_id,
  monthYear: r.month_year,
  code: r.code,
  description: r.description,
  presentation: r.presentation,
  batch: r.batch,
  expiryDate: r.expiry_date || '',
  aghuQty: Number(r.aghu_qty) || 0,
  physicalQty: Number(r.physical_qty) || 0,
  unit: r.unit,
  location: r.location,
  minStock: Number(r.min_stock) || 0,
  notes: r.notes ?? undefined,
  updatedAt: r.updated_at,
  updatedBy: r.updated_by,
});

const productionToRow = (p: ProductionItem) => ({
  id: p.id,
  month_year: p.monthYear,
  date: safeDate(p.date),
  medication_code: p.medicationCode,
  medication_name: p.medicationName,
  batch_number: p.batchNumber,
  source_batch: p.sourceBatch,
  produced_qty: p.producedQty,
  loss_qty: p.lossQty,
  loss_reason: p.lossReason,
  operator_name: p.operatorName,
  technician_note: p.technicianNote,
  expiry_date: safeDate(p.expiryDate),
});

const rowToProduction = (r: any): ProductionItem => ({
  id: r.id,
  monthYear: r.month_year,
  date: r.date || '',
  medicationCode: r.medication_code,
  medicationName: r.medication_name,
  batchNumber: r.batch_number,
  sourceBatch: r.source_batch,
  producedQty: Number(r.produced_qty) || 0,
  lossQty: Number(r.loss_qty) || 0,
  lossReason: r.loss_reason ?? undefined,
  operatorName: r.operator_name,
  technicianNote: r.technician_note ?? undefined,
  expiryDate: r.expiry_date || '',
});

const hygieneToRow = (h: RoomHygieneEvaluation) => ({
  id: h.id,
  room_id: h.roomId,
  month_year: h.monthYear,
  status: h.status,
  score: h.score,
  evaluator_name: h.evaluatorName,
  evaluated_at: h.evaluatedAt,
  checklist: h.checklist,
  observations: h.observations,
  corrective_actions: h.correctiveActions,
});

const rowToHygiene = (r: any): RoomHygieneEvaluation => ({
  id: r.id,
  roomId: r.room_id,
  monthYear: r.month_year,
  status: r.status,
  score: Number(r.score) || 0,
  evaluatorName: r.evaluator_name,
  evaluatedAt: r.evaluated_at,
  checklist: r.checklist,
  observations: r.observations ?? undefined,
  correctiveActions: r.corrective_actions ?? undefined,
});

const userEntryToRow = (username: string, entry: UsersConfigMap[string]) => ({
  username,
  user_id: entry.user.id,
  name: entry.user.name,
  role: entry.user.role,
  room_id: entry.user.roomId ?? null,
  password: entry.passwordHash,
});

const rowToUserEntry = (r: any): { key: string; entry: UsersConfigMap[string] } => ({
  key: r.username,
  entry: {
    user: {
      id: r.user_id,
      name: r.name,
      role: r.role,
      roomId: r.room_id ?? undefined,
    },
    passwordHash: r.password,
  },
});

const catalogItemToRow = (roomId: RoomId, item: StandardCatalogItem) => ({
  room_id: roomId,
  code: item.code,
  description: item.description,
  presentation: item.presentation,
});

const rowToCatalogItem = (r: any): StandardCatalogItem => ({
  code: r.code,
  description: r.description,
  presentation: r.presentation,
});

class StorageService {
  // --- Connection status (automático via variáveis de ambiente) ---
  public getSupabaseConfig(): SupabaseConfig {
    return {
      url: (import.meta.env.VITE_SUPABASE_URL as string) || '',
      anonKey: isSupabaseConfigured ? '••••••••••••' : '',
      connected: isSupabaseConfigured,
      lastSync: localStorage.getItem(KEYS.LAST_SYNC) || undefined,
    };
  }

  public async testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
    if (!supabase) {
      return {
        success: false,
        message:
          'Nenhuma credencial encontrada. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente do projeto.',
      };
    }
    try {
      const { error } = await supabase.from('caf_inventory').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        return {
          success: false,
          message: `Conectado, mas houve um erro ao consultar as tabelas: ${error.message}. Verifique se o schema SQL foi executado no seu projeto Supabase.`,
        };
      }
      this.markSynced();
      return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' };
    } catch (err) {
      return {
        success: false,
        message: `Falha na conexão: ${(err as Error).message || 'Verifique as credenciais.'}`,
      };
    }
  }

  private markSynced() {
    localStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
  }

  // --- Inventory Operations ---
  public async getInventoryItems(): Promise<InventoryItem[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('caf_inventory').select('*');
        if (!error && data) {
          const items = data.map(rowToInventory);
          localStorage.setItem(KEYS.INVENTORY, JSON.stringify(items));
          this.markSynced();
          return items;
        }
      } catch (err) {
        console.warn('Supabase indisponível, usando cache local:', err);
      }
    }
    return this.getLocalInventory();
  }

  private getLocalInventory(): InventoryItem[] {
    const stored = localStorage.getItem(KEYS.INVENTORY);
    if (!stored) {
      localStorage.setItem(KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY_ITEMS));
      return INITIAL_INVENTORY_ITEMS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_INVENTORY_ITEMS;
    }
  }

  public async saveInventoryItems(items: InventoryItem[]): Promise<{ success: boolean; error?: string }> {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(items));
    if (!supabase) return { success: true };
    const CHUNK_SIZE = 200;
    try {
      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE).map(inventoryToRow);
        const { error } = await supabase.from('caf_inventory').upsert(chunk);
        if (error) {
          console.error('Supabase upsert error (inventário):', error);
          return { success: false, error: error.message };
        }
      }
      this.markSynced();
      return { success: true };
    } catch (err) {
      console.error('Supabase sync error (inventário):', err);
      return { success: false, error: (err as Error).message };
    }
  }

  public async deleteInventoryItemRemote(id: string) {
    if (!supabase) return;
    try {
      await supabase.from('caf_inventory').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  // --- Production Operations ---
  public async getProductionItems(): Promise<ProductionItem[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('caf_production').select('*');
        if (!error && data) {
          const items = data.map(rowToProduction);
          localStorage.setItem(KEYS.PRODUCTION, JSON.stringify(items));
          this.markSynced();
          return items;
        }
      } catch (err) {
        console.warn('Supabase indisponível, usando cache local:', err);
      }
    }
    return this.getLocalProduction();
  }

  private getLocalProduction(): ProductionItem[] {
    const stored = localStorage.getItem(KEYS.PRODUCTION);
    if (!stored) {
      localStorage.setItem(KEYS.PRODUCTION, JSON.stringify(INITIAL_PRODUCTION_ITEMS));
      return INITIAL_PRODUCTION_ITEMS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_PRODUCTION_ITEMS;
    }
  }

  public async saveProductionItems(items: ProductionItem[]): Promise<{ success: boolean; error?: string }> {
    localStorage.setItem(KEYS.PRODUCTION, JSON.stringify(items));
    if (!supabase) return { success: true };
    const CHUNK_SIZE = 200;
    try {
      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE).map(productionToRow);
        const { error } = await supabase.from('caf_production').upsert(chunk);
        if (error) {
          console.error('Supabase upsert error (produção):', error);
          return { success: false, error: error.message };
        }
      }
      this.markSynced();
      return { success: true };
    } catch (err) {
      console.error('Supabase sync error (produção):', err);
      return { success: false, error: (err as Error).message };
    }
  }

  public async deleteProductionItemRemote(id: string) {
    if (!supabase) return;
    try {
      await supabase.from('caf_production').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  // Exclui de uma vez todos os lançamentos de produção de um mês (útil
  // quando uma importação errada precisa ser desfeita sem apagar um por um).
  public async deleteAllProductionForMonth(monthYear: string) {
    if (!supabase) return;
    try {
      await supabase.from('caf_production').delete().eq('month_year', monthYear);
      this.markSynced();
    } catch (err) {
      console.warn('Supabase bulk delete error (produção):', err);
    }
  }

  // --- Hygiene Operations ---
  public async getHygieneEvaluations(): Promise<RoomHygieneEvaluation[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('caf_hygiene').select('*');
        if (!error && data) {
          const items = data.map(rowToHygiene);
          localStorage.setItem(KEYS.HYGIENE, JSON.stringify(items));
          this.markSynced();
          return items;
        }
      } catch (err) {
        console.warn('Supabase indisponível, usando cache local:', err);
      }
    }
    return this.getLocalHygiene();
  }

  private getLocalHygiene(): RoomHygieneEvaluation[] {
    const stored = localStorage.getItem(KEYS.HYGIENE);
    if (!stored) {
      localStorage.setItem(KEYS.HYGIENE, JSON.stringify(INITIAL_HYGIENE_EVALUATIONS));
      return INITIAL_HYGIENE_EVALUATIONS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_HYGIENE_EVALUATIONS;
    }
  }

  public async saveHygieneEvaluations(evaluations: RoomHygieneEvaluation[]) {
    localStorage.setItem(KEYS.HYGIENE, JSON.stringify(evaluations));
    if (!supabase) return;
    try {
      await supabase.from('caf_hygiene').upsert(evaluations.map(hygieneToRow));
      this.markSynced();
    } catch (err) {
      console.warn('Supabase sync error:', err);
    }
  }

  // --- Active Month Storage (preferência local de UI, não precisa ir ao banco) ---
  public getActiveMonth(): string {
    const stored = localStorage.getItem(KEYS.ACTIVE_MONTH);
    if (stored) return stored;
    // Sem preferência salva ainda: usa o mês corrente de verdade (data do
    // sistema), não um valor fixo que fica desatualizado com o tempo.
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  public setActiveMonth(monthYear: string) {
    localStorage.setItem(KEYS.ACTIVE_MONTH, monthYear);
  }

  // --- Users / Logins (gerenciados pela chefia) ---
  public async getUsersConfig(): Promise<UsersConfigMap> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('caf_users').select('*');
        if (!error && data) {
          if (data.length === 0) {
            // Primeira vez: semeia a tabela com os usuários padrão definidos no código.
            await this.saveUsersConfig(USERS_CONFIG);
            return USERS_CONFIG;
          }
          const map: UsersConfigMap = {};
          data.forEach((row: any) => {
            const { key, entry } = rowToUserEntry(row);
            map[key] = entry;
          });
          localStorage.setItem(KEYS.USERS, JSON.stringify(map));
          this.markSynced();
          return map;
        }
      } catch (err) {
        console.warn('Supabase indisponível ao buscar usuários, usando cache local:', err);
      }
    }
    return this.getLocalUsersConfig();
  }

  private getLocalUsersConfig(): UsersConfigMap {
    const stored = localStorage.getItem(KEYS.USERS);
    if (!stored) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(USERS_CONFIG));
      return USERS_CONFIG;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return USERS_CONFIG;
    }
  }

  public async saveUsersConfig(usersConfig: UsersConfigMap) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(usersConfig));
    if (!supabase) return;
    try {
      const rows = Object.entries(usersConfig).map(([username, entry]) =>
        userEntryToRow(username, entry)
      );
      await supabase.from('caf_users').upsert(rows, { onConflict: 'username' });
      this.markSynced();
    } catch (err) {
      console.warn('Supabase sync error (usuários):', err);
    }
  }

  // --- Catálogo de itens padrão por sala (gerenciável pela chefia) ---
  public async getCatalog(roomId: RoomId): Promise<StandardCatalogItem[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('caf_catalog').select('*').eq('room_id', roomId);
        if (!error && data) {
          if (data.length === 0) {
            const seed = STANDARD_CATALOG[roomId] || [];
            if (seed.length > 0) {
              await this.saveCatalog(roomId, seed);
            }
            return seed;
          }
          const items = data.map(rowToCatalogItem);
          this.setLocalCatalog(roomId, items);
          this.markSynced();
          return items;
        }
      } catch (err) {
        console.warn('Supabase indisponível ao buscar catálogo, usando cache local:', err);
      }
    }
    return this.getLocalCatalog(roomId);
  }

  private getLocalCatalog(roomId: RoomId): StandardCatalogItem[] {
    const stored = localStorage.getItem(`${KEYS.CATALOG}_${roomId}`);
    if (!stored) {
      const seed = STANDARD_CATALOG[roomId] || [];
      this.setLocalCatalog(roomId, seed);
      return seed;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return STANDARD_CATALOG[roomId] || [];
    }
  }

  private setLocalCatalog(roomId: RoomId, items: StandardCatalogItem[]) {
    localStorage.setItem(`${KEYS.CATALOG}_${roomId}`, JSON.stringify(items));
  }

  // Substitui (ou mescla) totalmente a lista de itens padrão de uma sala.
  public async saveCatalog(roomId: RoomId, items: StandardCatalogItem[]) {
    this.setLocalCatalog(roomId, items);
    if (!supabase) return;
    try {
      // Remove os itens antigos dessa sala e insere a lista nova por
      // completo — assim itens excluídos realmente somem do banco.
      await supabase.from('caf_catalog').delete().eq('room_id', roomId);
      if (items.length > 0) {
        await supabase.from('caf_catalog').insert(items.map((i) => catalogItemToRow(roomId, i)));
      }
      this.markSynced();
    } catch (err) {
      console.warn('Supabase sync error (catálogo):', err);
    }
  }

  public async deleteCatalogItem(roomId: RoomId, code: string) {
    const current = this.getLocalCatalog(roomId).filter((i) => i.code !== code);
    this.setLocalCatalog(roomId, current);
    if (!supabase) return;
    try {
      await supabase.from('caf_catalog').delete().eq('room_id', roomId).eq('code', code);
      this.markSynced();
    } catch (err) {
      console.warn('Supabase delete error (catálogo):', err);
    }
  }

  // --- Bloqueio/Efetivação do inventário mensal por sala ---
  // Toda vez que o inventário é salvo, ele é automaticamente fechado
  // (efetivado). Só a chefia pode reabrir para editar de novo.
  public async getInventoryLocks(): Promise<Record<string, InventoryLockEntry>> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('caf_inventory_locks').select('*');
        if (!error && data) {
          const map: Record<string, InventoryLockEntry> = {};
          data.forEach((r: any) => {
            map[`${r.room_id}__${r.month_year}`] = {
              status: r.status,
              closedBy: r.closed_by ?? undefined,
              closedAt: r.closed_at ?? undefined,
            };
          });
          localStorage.setItem(KEYS.LOCKS, JSON.stringify(map));
          this.markSynced();
          return map;
        }
      } catch (err) {
        console.warn('Supabase indisponível ao buscar status do inventário, usando cache local:', err);
      }
    }
    const stored = localStorage.getItem(KEYS.LOCKS);
    if (!stored) return {};
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }

  public async setInventoryLock(
    roomId: RoomId,
    monthYear: string,
    status: 'aberto' | 'fechado',
    closedBy?: string
  ) {
    const key = `${roomId}__${monthYear}`;
    const stored = localStorage.getItem(KEYS.LOCKS);
    const map: Record<string, InventoryLockEntry> = stored ? JSON.parse(stored) : {};
    map[key] = {
      status,
      closedBy: status === 'fechado' ? closedBy : undefined,
      closedAt: status === 'fechado' ? new Date().toISOString() : undefined,
    };
    localStorage.setItem(KEYS.LOCKS, JSON.stringify(map));

    if (!supabase) return;
    try {
      // Usa "id" (sala+mês) como chave única simples — evita qualquer
      // ambiguidade na resolução de conflito que poderia fazer o status
      // de um mês se misturar com o de outro.
      const { error } = await supabase.from('caf_inventory_locks').upsert({
        id: key,
        room_id: roomId,
        month_year: monthYear,
        status,
        closed_by: status === 'fechado' ? closedBy : null,
        closed_at: status === 'fechado' ? new Date().toISOString() : null,
      });
      if (error) {
        console.error('Supabase sync error (status do inventário):', error);
      } else {
        this.markSynced();
      }
    } catch (err) {
      console.error('Supabase sync error (status do inventário):', err);
    }
  }

  // Exclui TODOS os registros de inventário de uma sala/mês de uma vez.
  public async deleteAllInventoryForRoomMonth(roomId: RoomId, monthYear: string) {
    if (!supabase) return;
    try {
      await supabase
        .from('caf_inventory')
        .delete()
        .eq('room_id', roomId)
        .eq('month_year', monthYear);
      this.markSynced();
    } catch (err) {
      console.warn('Supabase bulk delete error (inventário):', err);
    }
  }

  // Reset to default seed (apenas local; não apaga dados no Supabase)
  public resetToFactoryData() {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY_ITEMS));
    localStorage.setItem(KEYS.PRODUCTION, JSON.stringify(INITIAL_PRODUCTION_ITEMS));
    localStorage.setItem(KEYS.HYGIENE, JSON.stringify(INITIAL_HYGIENE_EVALUATIONS));
  }
}

export const storageService = new StorageService();
