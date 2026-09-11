import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  InventoryItem,
  ProductionItem,
  RoomHygieneEvaluation,
  RoomId,
  RoomInventorySummary,
  RoomInfo,
  StandardCatalogItem,
} from '../types';
import { ROOMS_CONFIG } from '../data/mockData';
import { storageService, InventoryLockEntry } from '../services/storageService';

interface InventoryContextType {
  activeMonth: string;
  setActiveMonth: (month: string) => void;
  availableMonths: { value: string; label: string }[];
  inventoryItems: InventoryItem[];
  productionItems: ProductionItem[];
  hygieneEvaluations: RoomHygieneEvaluation[];
  
  // Inventory actions
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  importInventoryItems: (items: InventoryItem[], replaceExisting?: boolean) => void;
  upsertInventoryGridRows: (
    roomId: RoomId,
    monthYear: string,
    rows: Array<{
      id?: string;
      code: string;
      description: string;
      presentation: string;
      batch: string;
      expiryDate: string;
      aghuQty: number;
      physicalQty: number;
      unit: string;
      location: string;
      minStock: number;
    }>,
    updatedBy: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Catálogo padrão de itens por sala (editável pela chefia)
  catalogs: Record<RoomId, StandardCatalogItem[]>;
  getCatalog: (roomId: RoomId) => StandardCatalogItem[];
  replaceCatalog: (roomId: RoomId, items: StandardCatalogItem[]) => Promise<void>;
  mergeCatalog: (roomId: RoomId, items: StandardCatalogItem[]) => Promise<void>;
  deleteCatalogItem: (roomId: RoomId, code: string) => Promise<void>;
  addCatalogItem: (roomId: RoomId, item: StandardCatalogItem) => Promise<void>;

  // Efetivação/bloqueio do inventário mensal por sala
  getInventoryLockStatus: (roomId: RoomId, monthYear: string) => 'aberto' | 'fechado';
  getInventoryLockInfo: (roomId: RoomId, monthYear: string) => InventoryLockEntry | undefined;
  reopenInventory: (roomId: RoomId, monthYear: string) => Promise<void>;
  clearRoomInventory: (roomId: RoomId, monthYear: string) => Promise<void>;
  
  // Production actions (Unitarização)
  addProductionItem: (item: Omit<ProductionItem, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateProductionItem: (id: string, item: Partial<ProductionItem>) => void;
  deleteProductionItem: (id: string) => void;
  clearMonthProduction: (monthYear: string) => Promise<void>;
  importProductionItems: (items: ProductionItem[]) => void;

  // Efetivação/bloqueio da produção mensal (Unitarização)
  getProductionLockStatus: (monthYear: string) => 'aberto' | 'fechado';
  getProductionLockInfo: (monthYear: string) => InventoryLockEntry | undefined;
  reopenProduction: (monthYear: string) => Promise<void>;
  closeProduction: (monthYear: string, closedBy: string) => Promise<{ success: boolean; error?: string }>;
  
  // Hygiene evaluation
  saveHygieneEvaluation: (evaluation: Omit<RoomHygieneEvaluation, 'id' | 'evaluatedAt'>) => void;
  
  // Queries & summaries
  getRoomItems: (roomId: RoomId, month?: string) => InventoryItem[];
  getRoomSummary: (roomId: RoomId, month?: string) => RoomInventorySummary;
  getRoomHygiene: (roomId: RoomId, month?: string) => RoomHygieneEvaluation | undefined;
  getRanking: (month?: string) => Array<{ room: RoomInfo; summary: RoomInventorySummary; rank: number; medal?: string }>;
  getGlobalSummary: (month?: string) => {
    totalRoomsAudited: number;
    totalItems: number;
    totalPhysical: number;
    totalAghu: number;
    overallAccuracy: number;
    hygieneAccuracy: number;
    conformingHygieneRoomsCount: number;
    nonConformingHygieneRoomsCount: number;
    totalSurplus: number;
    totalDeficit: number;
    nearExpiryTotal: number;
    criticalExpiryTotal: number;
    zeroStockTotal: number;
    lowStockTotal: number;
  };
  resetAllData: () => void;
  isLoading: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMonth, setActiveMonthState] = useState<string>(() => storageService.getActiveMonth());
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([]);
  const [hygieneEvaluations, setHygieneEvaluations] = useState<RoomHygieneEvaluation[]>([]);
  const [catalogs, setCatalogs] = useState<Record<RoomId, StandardCatalogItem[]>>({} as Record<RoomId, StandardCatalogItem[]>);
  const [locks, setLocks] = useState<Record<string, InventoryLockEntry>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Carrega os dados automaticamente (do Supabase quando conectado, ou do
  // cache local quando offline/sem credenciais configuradas).
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [inv, prod, hyg] = await Promise.all([
        storageService.getInventoryItems(),
        storageService.getProductionItems(),
        storageService.getHygieneEvaluations(),
      ]);
      if (!mounted) return;
      setInventoryItems(inv);
      setProductionItems(prod);
      setHygieneEvaluations(hyg);
      setIsLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Carrega o catálogo de itens padrão de cada sala.
  useEffect(() => {
    let mounted = true;
    (async () => {
      const roomIds = ROOMS_CONFIG.map((r) => r.id);
      const entries = await Promise.all(
        roomIds.map(async (id) => [id, await storageService.getCatalog(id)] as const)
      );
      if (!mounted) return;
      const map = Object.fromEntries(entries) as Record<RoomId, StandardCatalogItem[]>;
      setCatalogs(map);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Carrega o status de efetivação (aberto/fechado) do inventário por sala/mês.
  useEffect(() => {
    let mounted = true;
    (async () => {
      const map = await storageService.getInventoryLocks();
      if (mounted) setLocks(map);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const lockKey = (roomId: RoomId, monthYear: string) => `${roomId}__${monthYear}`;

  // Lista de meses disponíveis: de Janeiro/2026 até 2 meses após o mês
  // atual de verdade (data do sistema) — sempre acompanha o calendário
  // real, sem precisar atualizar o código todo mês.
  const availableMonths = useMemo(() => {
    const PT_MONTH_NAMES = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth(); // 0-based

    const start = { year: 2026, monthIndex: 0 }; // Janeiro 2026
    const end = { year: currentYear, monthIndex: currentMonthIndex + 2 }; // 2 meses à frente

    const months: { value: string; label: string; sortKey: number }[] = [];
    let y = start.year;
    let m = start.monthIndex;
    while (y < end.year || (y === end.year && m <= end.monthIndex)) {
      const isCurrent = y === currentYear && m === currentMonthIndex;
      months.push({
        value: `${y}-${String(m + 1).padStart(2, '0')}`,
        label: `${PT_MONTH_NAMES[m]} ${y}${isCurrent ? ' (Atual)' : ''}`,
        sortKey: y * 12 + m,
      });
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }
    // Mais recente primeiro (mantém o comportamento anterior do seletor)
    return months.sort((a, b) => b.sortKey - a.sortKey).map(({ value, label }) => ({ value, label }));
  }, []);

  const setActiveMonth = (m: string) => {
    setActiveMonthState(m);
    storageService.setActiveMonth(m);
  };

  // Sync to storage
  const updateAndSaveInventory = (newItems: InventoryItem[]): Promise<{ success: boolean; error?: string }> => {
    setInventoryItems(newItems);
    return storageService.saveInventoryItems(newItems);
  };

  const updateAndSaveProduction = (newItems: ProductionItem[]): Promise<{ success: boolean; error?: string }> => {
    setProductionItems(newItems);
    return storageService.saveProductionItems(newItems);
  };

  const updateAndSaveHygiene = (newEvals: RoomHygieneEvaluation[]) => {
    setHygieneEvaluations(newEvals);
    storageService.saveHygieneEvaluations(newEvals);
  };

  // --- Inventory Item CRUD ---
  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      updatedAt: new Date().toISOString(),
    };
    updateAndSaveInventory([newItem, ...inventoryItems]);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    const updated = inventoryItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    updateAndSaveInventory(updated);
  };

  const deleteInventoryItem = (id: string) => {
    const filtered = inventoryItems.filter((i) => i.id !== id);
    updateAndSaveInventory(filtered);
    storageService.deleteInventoryItemRemote(id);
  };

  const importInventoryItems = (newItems: InventoryItem[], replaceExisting = false) => {
    if (replaceExisting) {
      // Replace for that specific room and month
      if (newItems.length > 0) {
        const { roomId, monthYear } = newItems[0];
        const oldForRoomMonth = inventoryItems.filter(
          (i) => i.roomId === roomId && i.monthYear === monthYear
        );
        const remaining = inventoryItems.filter(
          (i) => !(i.roomId === roomId && i.monthYear === monthYear)
        );
        updateAndSaveInventory([...newItems, ...remaining]);
        // Remove de vez os registros antigos dessa sala/mês no Supabase —
        // sem isso, ficam duplicatas "fantasma" acumulando no banco a cada
        // nova importação.
        oldForRoomMonth.forEach((it) => storageService.deleteInventoryItemRemote(it.id));
      }
    } else {
      updateAndSaveInventory([...newItems, ...inventoryItems]);
    }
  };

  // Salva em lote as linhas da grade de inventário (catálogo padrão da
  // sala). Cada linha vira um InventoryItem — casa por id (quando a linha já
  // existia, inclusive lotes extras do mesmo item) ou cria um novo registro.
  // Linhas que existiam antes mas não vieram nesta lista (ex: um lote extra
  // que o usuário removeu) são excluídas.
  const upsertInventoryGridRows: InventoryContextType['upsertInventoryGridRows'] = async (
    roomId,
    monthYear,
    rows,
    updatedBy
  ) => {
    const now = new Date().toISOString();
    const sameRoomMonth = inventoryItems.filter(
      (i) => i.roomId === roomId && i.monthYear === monthYear
    );
    const others = inventoryItems.filter(
      (i) => !(i.roomId === roomId && i.monthYear === monthYear)
    );

    const keptIds = new Set(rows.filter((r) => r.id).map((r) => r.id));
    const removedItems = sameRoomMonth.filter((e) => !keptIds.has(e.id));

    const merged: InventoryItem[] = rows.map((row) => {
      const existing = row.id ? sameRoomMonth.find((e) => e.id === row.id) : undefined;
      return {
        id: existing?.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        roomId,
        monthYear,
        code: row.code,
        description: row.description,
        presentation: row.presentation,
        batch: row.batch,
        expiryDate: row.expiryDate,
        aghuQty: row.aghuQty,
        physicalQty: row.physicalQty,
        unit: row.unit,
        location: row.location,
        minStock: row.minStock,
        notes: existing?.notes,
        updatedAt: now,
        updatedBy,
      };
    });

    const result = await updateAndSaveInventory([...merged, ...others]);

    if (!result.success) {
      // A gravação no Supabase falhou de verdade (não foi só otimismo de
      // tela) — não efetiva/fecha o inventário, e devolve o erro pra quem
      // chamou poder avisar o usuário em vez de mostrar "salvo" à toa.
      return { success: false, error: result.error };
    }

    removedItems.forEach((it) => storageService.deleteInventoryItemRemote(it.id));

    // Toda vez que o inventário é salvo com sucesso, ele é automaticamente
    // efetivado e fechado — só a chefia pode reabrir para editar de novo.
    const key = lockKey(roomId, monthYear);
    const entry: InventoryLockEntry = { status: 'fechado', closedBy: updatedBy, closedAt: now };
    setLocks((prev) => ({ ...prev, [key]: entry }));
    await storageService.setInventoryLock(roomId, monthYear, 'fechado', updatedBy);

    return { success: true };
  };

  const getInventoryLockStatus = (roomId: RoomId, monthYear: string): 'aberto' | 'fechado' =>
    locks[lockKey(roomId, monthYear)]?.status || 'aberto';

  const getInventoryLockInfo = (roomId: RoomId, monthYear: string): InventoryLockEntry | undefined =>
    locks[lockKey(roomId, monthYear)];

  const reopenInventory = async (roomId: RoomId, monthYear: string) => {
    const key = lockKey(roomId, monthYear);
    setLocks((prev) => ({ ...prev, [key]: { status: 'aberto' } }));
    await storageService.setInventoryLock(roomId, monthYear, 'aberto');
  };

  // Exclui de vez todos os lançamentos de inventário de uma sala/mês.
  const clearRoomInventory = async (roomId: RoomId, monthYear: string) => {
    const remaining = inventoryItems.filter((i) => !(i.roomId === roomId && i.monthYear === monthYear));
    updateAndSaveInventory(remaining);
    await storageService.deleteAllInventoryForRoomMonth(roomId, monthYear);
    await reopenInventory(roomId, monthYear);
  };

  // --- Catálogo de itens padrão por sala ---
  const getCatalog = (roomId: RoomId): StandardCatalogItem[] => catalogs[roomId] || [];

  const replaceCatalog = async (roomId: RoomId, items: StandardCatalogItem[]) => {
    setCatalogs((prev) => ({ ...prev, [roomId]: items }));
    await storageService.saveCatalog(roomId, items);
  };

  const mergeCatalog = async (roomId: RoomId, items: StandardCatalogItem[]) => {
    const current = catalogs[roomId] || [];
    const byCode = new Map<string, StandardCatalogItem>(current.map((i): [string, StandardCatalogItem] => [i.code, i]));
    items.forEach((i) => byCode.set(i.code, i));
    const merged = Array.from(byCode.values());
    setCatalogs((prev) => ({ ...prev, [roomId]: merged }));
    await storageService.saveCatalog(roomId, merged);
  };

  const deleteCatalogItem = async (roomId: RoomId, code: string) => {
    const next = (catalogs[roomId] || []).filter((i) => i.code !== code);
    setCatalogs((prev) => ({ ...prev, [roomId]: next }));
    await storageService.deleteCatalogItem(roomId, code);
  };

  const addCatalogItem = async (roomId: RoomId, item: StandardCatalogItem) => {
    const current = catalogs[roomId] || [];
    if (current.some((i) => i.code === item.code)) return;
    const next = [...current, item];
    setCatalogs((prev) => ({ ...prev, [roomId]: next }));
    await storageService.saveCatalog(roomId, next);
  };


  // --- Production CRUD ---
  const addProductionItem = (item: Omit<ProductionItem, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const newItem: ProductionItem = {
      ...item,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    return updateAndSaveProduction([newItem, ...productionItems]);
  };

  const updateProductionItem = (id: string, updates: Partial<ProductionItem>) => {
    const updated = productionItems.map((item) => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    });
    updateAndSaveProduction(updated);
  };

  const deleteProductionItem = (id: string) => {
    const filtered = productionItems.filter((p) => p.id !== id);
    updateAndSaveProduction(filtered);
    storageService.deleteProductionItemRemote(id);
  };

  // Exclui de vez todos os lançamentos de produção de um mês (ex: para
  // desfazer uma importação errada sem apagar item por item).
  const clearMonthProduction = async (monthYear: string) => {
    const remaining = productionItems.filter(
      (p) => !(p.monthYear === monthYear || p.date.startsWith(monthYear))
    );
    updateAndSaveProduction(remaining);
    await storageService.deleteAllProductionForMonth(monthYear);
  };

  const importProductionItems = (newItems: ProductionItem[]) => {
    updateAndSaveProduction([...newItems, ...productionItems]);
  };

  // --- Efetivação/bloqueio da produção mensal (Unitarização) ---
  // Reaproveita o mesmo mecanismo de bloqueio do inventário, usando uma
  // chave própria (não é uma sala de verdade, só um identificador).
  const PRODUCTION_LOCK_KEY = 'producao_unitarizacao' as RoomId;

  const getProductionLockStatus = (monthYear: string): 'aberto' | 'fechado' =>
    getInventoryLockStatus(PRODUCTION_LOCK_KEY, monthYear);

  const getProductionLockInfo = (monthYear: string): InventoryLockEntry | undefined =>
    getInventoryLockInfo(PRODUCTION_LOCK_KEY, monthYear);

  const reopenProduction = async (monthYear: string) => {
    await reopenInventory(PRODUCTION_LOCK_KEY, monthYear);
  };

  const closeProduction = async (
    monthYear: string,
    closedBy: string
  ): Promise<{ success: boolean; error?: string }> => {
    const key = lockKey(PRODUCTION_LOCK_KEY, monthYear);
    const now = new Date().toISOString();
    const entry: InventoryLockEntry = { status: 'fechado', closedBy, closedAt: now };
    setLocks((prev) => ({ ...prev, [key]: entry }));
    await storageService.setInventoryLock(PRODUCTION_LOCK_KEY, monthYear, 'fechado', closedBy);
    return { success: true };
  };

  // --- Hygiene Evaluation ---
  const saveHygieneEvaluation = (evaluation: Omit<RoomHygieneEvaluation, 'id' | 'evaluatedAt'>) => {
    const now = new Date().toISOString();
    const existingIndex = hygieneEvaluations.findIndex(
      (h) => h.roomId === evaluation.roomId && h.monthYear === evaluation.monthYear
    );

    let updated: RoomHygieneEvaluation[];
    if (existingIndex >= 0) {
      updated = [...hygieneEvaluations];
      updated[existingIndex] = {
        ...evaluation,
        id: hygieneEvaluations[existingIndex].id,
        evaluatedAt: now,
      };
    } else {
      const newEval: RoomHygieneEvaluation = {
        ...evaluation,
        id: `hyg_${Date.now()}`,
        evaluatedAt: now,
      };
      updated = [newEval, ...hygieneEvaluations];
    }
    updateAndSaveHygiene(updated);
  };

  // --- Queries ---
  const getRoomItems = (roomId: RoomId, month = activeMonth): InventoryItem[] => {
    return inventoryItems.filter((i) => i.roomId === roomId && i.monthYear === month);
  };

  const getRoomHygiene = (roomId: RoomId, month = activeMonth): RoomHygieneEvaluation | undefined => {
    return hygieneEvaluations.find((h) => h.roomId === roomId && h.monthYear === month);
  };

  const getRoomSummary = (roomId: RoomId, month = activeMonth): RoomInventorySummary => {
    const items = getRoomItems(roomId, month);
    const hygiene = getRoomHygiene(roomId, month);

    const now = new Date();
    let totalPhysical = 0;
    let totalAghu = 0;
    let exactCount = 0;
    let surplusCount = 0;
    let deficitCount = 0;
    let nearExpiry = 0; // < 60 days
    let criticalExpiry = 0; // < 30 days
    let expired = 0;
    let lowStock = 0;
    let zeroStock = 0;
    let latestUpdate = '';

    items.forEach((item) => {
      totalPhysical += item.physicalQty;
      totalAghu += item.aghuQty;

      const diff = item.physicalQty - item.aghuQty;
      if (diff === 0) {
        exactCount++;
      } else if (diff > 0) {
        surplusCount++;
      } else {
        deficitCount++;
      }

      if (item.physicalQty === 0) {
        zeroStock++;
      } else if (item.physicalQty <= item.minStock) {
        lowStock++;
      }

      if (item.expiryDate) {
        const exp = new Date(item.expiryDate);
        const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          expired++;
        } else if (diffDays <= 30) {
          criticalExpiry++;
        } else if (diffDays <= 60) {
          nearExpiry++;
        }
      }

      if (!latestUpdate || item.updatedAt > latestUpdate) {
        latestUpdate = item.updatedAt;
      }
    });

    const accuracyPercentage = items.length > 0 ? (exactCount / items.length) * 100 : 100;
    const hygieneScore = hygiene ? hygiene.score : 100;

    return {
      roomId,
      monthYear: month,
      totalItems: items.length,
      totalPhysicalQty: totalPhysical,
      totalAghuQty: totalAghu,
      exactItemsCount: exactCount,
      surplusItemsCount: surplusCount,
      deficitItemsCount: deficitCount,
      accuracyPercentage: Number(accuracyPercentage.toFixed(1)),
      nearExpiryCount: nearExpiry,
      criticalExpiryCount: criticalExpiry,
      expiredCount: expired,
      lowStockCount: lowStock,
      zeroStockCount: zeroStock,
      hygieneStatus: hygiene?.status,
      hygieneScore,
      isCompleted: items.length > 0,
      lastUpdated: latestUpdate || new Date().toISOString(),
    };
  };

  const getRanking = (month = activeMonth) => {
    const list = ROOMS_CONFIG.map((room) => {
      const summary = getRoomSummary(room.id, month);
      return { room, summary };
    });

    // Sort by combined score or accuracy DESC, then totalItems DESC
    list.sort((a, b) => {
      if (b.summary.accuracyPercentage !== a.summary.accuracyPercentage) {
        return b.summary.accuracyPercentage - a.summary.accuracyPercentage;
      }
      return b.summary.totalItems - a.summary.totalItems;
    });

    const medals = ['🥇', '🥈', '🥉'];

    return list.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      medal: medals[index] || undefined,
    }));
  };

  const getGlobalSummary = (month = activeMonth) => {
    let totalItems = 0;
    let totalPhysical = 0;
    let totalAghu = 0;
    let exactTotal = 0;
    let surplusTotal = 0;
    let deficitTotal = 0;
    let nearExpiryTotal = 0;
    let criticalExpiryTotal = 0;
    let zeroStockTotal = 0;
    let lowStockTotal = 0;
    let auditedRooms = 0;
    let totalHygieneScore = 0;
    let conformingHygieneRoomsCount = 0;
    let nonConformingHygieneRoomsCount = 0;

    ROOMS_CONFIG.forEach((room) => {
      const summary = getRoomSummary(room.id, month);
      if (summary.totalItems > 0) auditedRooms++;
      totalItems += summary.totalItems;
      totalPhysical += summary.totalPhysicalQty;
      totalAghu += summary.totalAghuQty;
      exactTotal += summary.exactItemsCount;
      surplusTotal += summary.surplusItemsCount;
      deficitTotal += summary.deficitItemsCount;
      nearExpiryTotal += summary.nearExpiryCount;
      criticalExpiryTotal += summary.criticalExpiryCount;
      zeroStockTotal += summary.zeroStockCount;
      lowStockTotal += summary.lowStockCount;
      totalHygieneScore += summary.hygieneScore;

      if (summary.hygieneStatus === 'conforme') {
        conformingHygieneRoomsCount++;
      } else if (summary.hygieneStatus === 'nao_conforme') {
        nonConformingHygieneRoomsCount++;
      }
    });

    const overallAccuracy = totalItems > 0 ? (exactTotal / totalItems) * 100 : 100;
    const hygieneAccuracy = ROOMS_CONFIG.length > 0 ? totalHygieneScore / ROOMS_CONFIG.length : 100;

    return {
      totalRoomsAudited: auditedRooms,
      totalItems,
      totalPhysical,
      totalAghu,
      overallAccuracy: Number(overallAccuracy.toFixed(1)),
      hygieneAccuracy: Number(hygieneAccuracy.toFixed(1)),
      conformingHygieneRoomsCount,
      nonConformingHygieneRoomsCount,
      totalSurplus: surplusTotal,
      totalDeficit: deficitTotal,
      nearExpiryTotal,
      criticalExpiryTotal,
      zeroStockTotal,
      lowStockTotal,
    };
  };

  const resetAllData = () => {
    storageService.resetToFactoryData();
    (async () => {
      setInventoryItems(await storageService.getInventoryItems());
      setProductionItems(await storageService.getProductionItems());
      setHygieneEvaluations(await storageService.getHygieneEvaluations());
    })();
  };

  return (
    <InventoryContext.Provider
      value={{
        activeMonth,
        setActiveMonth,
        availableMonths,
        inventoryItems,
        productionItems,
        hygieneEvaluations,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        importInventoryItems,
        upsertInventoryGridRows,
        catalogs,
        getCatalog,
        replaceCatalog,
        mergeCatalog,
        deleteCatalogItem,
        addCatalogItem,
        getInventoryLockStatus,
        getInventoryLockInfo,
        reopenInventory,
        clearRoomInventory,
        addProductionItem,
        updateProductionItem,
        deleteProductionItem,
        clearMonthProduction,
        importProductionItems,
        getProductionLockStatus,
        getProductionLockInfo,
        reopenProduction,
        closeProduction,
        saveHygieneEvaluation,
        getRoomItems,
        getRoomSummary,
        getRoomHygiene,
        getRanking,
        getGlobalSummary,
        resetAllData,
        isLoading,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
