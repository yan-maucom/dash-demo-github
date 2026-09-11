import * as XLSX from 'xlsx';
import { InventoryItem, ProductionItem, RoomId, StandardCatalogItem } from '../types';

export interface ParseResult<T> {
  success: boolean;
  data: T[];
  errors: string[];
  totalRows: number;
}

// 1. Download Standard Model Template for Inventory
export function downloadInventoryTemplate() {
  const wsData = [
    [
      'CÓDIGO AGHU',
      'MEDICAMENTO / DESCRIÇÃO',
      'APRESENTAÇÃO',
      'LOTE',
      'VALIDADE (AAAA-MM-DD)',
      'QTD AGHU (SISTEMA)',
      'QTD FÍSICO (CONTAGEM)',
      'UNIDADE',
      'LOCALIZAÇÃO',
      'ESTOQUE MÍNIMO',
      'OBSERVAÇÕES',
    ],
    [
      'MED-1001',
      'Dipirona Sódica 500mg/ml Gotas',
      'FR 10ml',
      'LT-12345',
      '2027-05-30',
      150,
      150,
      'FR',
      'Prateleira A-01',
      30,
      'Conferência normal',
    ],
    [
      'MED-1002',
      'Paracetamol 500mg Comprimido',
      'COMP',
      'LT-67890',
      '2026-11-15',
      500,
      480,
      'COMP',
      'Gaveta B-02',
      100,
      'Divergência de 20 comp',
    ],
    [
      'MED-1003',
      'Omeprazol 20mg Cápsula',
      'CAP',
      'LT-11223',
      '2027-08-20',
      200,
      210,
      'CAP',
      'Prateleira C-03',
      50,
      'Sobra de 10 cápsulas',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 16 }, // Código
    { wch: 38 }, // Medicamento
    { wch: 18 }, // Apresentação
    { wch: 14 }, // Lote
    { wch: 22 }, // Validade
    { wch: 22 }, // Qtd AGHU
    { wch: 24 }, // Qtd Físico
    { wch: 12 }, // Unidade
    { wch: 20 }, // Localização
    { wch: 18 }, // Est Min
    { wch: 25 }, // Obs
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Modelo_Inventario_CAF');
  XLSX.writeFile(wb, 'Modelo_Inventario_Padrao_CAF.xlsx');
}

// 2. Download Production Model Template (Unitarização)
export function downloadProductionTemplate() {
  const wsData = [
    [
      'DATA (AAAA-MM-DD)',
      'CÓDIGO MATERIAL',
      'NOME DO MEDICAMENTO',
      'LOTE UNITARIZAÇÃO',
      'LOTE ORIGINAL (FABRICANTE)',
      'DOSES PRODUZIDAS',
      'DOSES PERDIDAS',
      'MOTIVO DA PERDA',
      'OPERADOR / RESPONSÁVEL',
      'VALIDADE FINAL (AAAA-MM-DD)',
      'OBSERVAÇÃO TÉCNICA',
    ],
    [
      '2026-08-10',
      'MED-1009',
      'Paracetamol 500mg - Fracionamento',
      'UNIT-2608-01',
      'LT-99210',
      1200,
      5,
      'Falha na selagem térmica do invólucro',
      'Téc. Amanda Nogueira',
      '2027-04-15',
      'Controle de lote aprovado',
    ],
    [
      '2026-08-11',
      'MED-1002',
      'Dipirona Gotas 500mg/ml - Datamatrix',
      'UNIT-2608-02',
      'LT-88421',
      350,
      0,
      '',
      'Téc. Lucas Meireles',
      '2026-09-25',
      'Etiquetas 100% legíveis',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 18 }, // Data
    { wch: 18 }, // Código
    { wch: 38 }, // Medicamento
    { wch: 22 }, // Lote Unit
    { wch: 25 }, // Lote Original
    { wch: 18 }, // Produzidas
    { wch: 16 }, // Perdidas
    { wch: 35 }, // Motivo
    { wch: 24 }, // Operador
    { wch: 24 }, // Validade
    { wch: 30 }, // Obs
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Modelo_Producao_Unit');
  XLSX.writeFile(wb, 'Modelo_Producao_Unitarizacao_CAF.xlsx');
}

// Helper to normalize string keys
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Detects the real header row of a spreadsheet. Handles both the simple
// generic template (header on row 1) and the official hospital template,
// which has several title/signature rows before the real header
// (ex: "ITENS | DESCRIÇÃO/MEDICAMENTOS... | APRESENTAÇÃO | CÓDIGO...").
function detectHeaderRowIndex(worksheet: XLSX.WorkSheet): number {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: false, range: 0 });
  const scanLimit = Math.min(20, rows.length);

  for (let i = 0; i < scanLimit; i++) {
    const cells = (rows[i] || []).map((c) => String(c ?? '').trim().toUpperCase());
    const hasItens = cells.some((c) => c === 'ITENS');
    const hasCodigo = cells.some((c) => c.includes('CÓDIGO') || c.includes('CODIGO'));
    const hasDescricao = cells.some((c) => c.includes('DESCRI'));
    if (hasItens || (hasCodigo && hasDescricao)) {
      return i;
    }
  }

  // Fallback genérico: quando o modelo não segue o padrão conhecido acima
  // (ex: planilha de produção com outras colunas), procura a primeira linha
  // que "parece" um cabeçalho de tabela — várias células curtas preenchidas
  // lado a lado, em vez de uma célula de título/assinatura longa e isolada.
  for (let i = 0; i < scanLimit; i++) {
    const raw = rows[i] || [];
    const nonEmpty = raw.filter((c) => String(c ?? '').trim().length > 0);
    const looksLikeHeader =
      nonEmpty.length >= 4 &&
      nonEmpty.every((c) => String(c).trim().length <= 40) &&
      nonEmpty.some((c) => /[a-zA-ZÀ-ÿ]{3,}/.test(String(c)));
    if (looksLikeHeader) {
      return i;
    }
  }

  return 0;
}

const PT_MONTHS = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

// O modelo oficial do hospital costuma ter uma aba por mês (ex: "JANEIRO
// 2026", "AGOSTO 2026"...). Esta função escolhe a aba certa com base no
// mês selecionado no app (monthYear no formato "YYYY-MM"), em vez de
// sempre pegar a primeira aba da planilha.
function pickSheetForMonth(workbook: XLSX.WorkBook, monthYear: string): string {
  const [year, month] = monthYear.split('-');
  const monthIndex = Number(month) - 1;
  const monthName = PT_MONTHS[monthIndex];

  if (monthName && year) {
    const match = workbook.SheetNames.find((name) => {
      const clean = normalizeKey(name);
      return clean.includes(monthName) && clean.includes(year);
    });
    if (match) return match;

    // Sem o ano, tenta só pelo nome do mês (planilhas às vezes só têm o mês)
    const matchByMonthOnly = workbook.SheetNames.find((name) => normalizeKey(name).includes(monthName));
    if (matchByMonthOnly) return matchByMonthOnly;
  }

  return workbook.SheetNames[0];
}

// 3. Parse Inventory File (Excel or CSV)
export async function parseInventoryExcel(
  file: File,
  roomId: RoomId,
  monthYear: string,
  updatedBy: string
): Promise<ParseResult<InventoryItem>> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = pickSheetForMonth(workbook, monthYear);
        const worksheet = workbook.Sheets[sheetName];

        // Detecta a linha real do cabeçalho (o modelo oficial do hospital
        // tem várias linhas de título/assinatura antes do cabeçalho real).
        const headerRowIndex = detectHeaderRowIndex(worksheet);

        // Convert to json objects
        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          raw: false,
          range: headerRowIndex,
        });

        if (!rawRows || rawRows.length === 0) {
          resolve({
            success: false,
            data: [],
            errors: ['A planilha está vazia ou não contém dados legíveis.'],
            totalRows: 0,
          });
          return;
        }

        const items: InventoryItem[] = [];
        const errors: string[] = [];

        rawRows.forEach((row, index) => {
          const rowNum = index + 2; // header is row 1
          
          // Map flexible header names
          let code = '';
          let description = '';
          let presentation = '';
          let batch = '';
          let expiryDate = '';
          let aghuQty = 0;
          let physicalQty = 0;
          let unit = 'UNID';
          let location = 'Setor Geral';
          let minStock = 10;
          let notes = '';
          let loteMarkerRaw: unknown;
          let hasLotesMarkerCol = false;

          for (const [key, val] of Object.entries(row)) {
            const trimmedKey = key.trim().toUpperCase();
            const cleanKey = normalizeKey(key);
            const strVal = String(val ?? '').trim();

            // A coluna "LOTES" (marcador 1°/2°/3°/4°) identifica, no modelo
            // oficial do hospital, qual das 4 sub-linhas de cada item é a
            // linha "mestre" (1°) — as outras 3 só existem para eventuais
            // lotes extras e não têm descrição/código própria.
            if (trimmedKey === 'LOTES') {
              hasLotesMarkerCol = true;
              loteMarkerRaw = val;
              continue;
            }

            if (cleanKey.includes('codigo') || cleanKey.includes('cod') || cleanKey.includes('material')) {
              code = strVal;
            } else if (cleanKey.includes('medicamento') || cleanKey.includes('descricao') || cleanKey.includes('item') || cleanKey.includes('nome')) {
              description = strVal;
            } else if (cleanKey.includes('apresentacao') || cleanKey.includes('forma')) {
              presentation = strVal;
            } else if (cleanKey.includes('lote') || cleanKey.includes('batch')) {
              if (strVal) batch = strVal;
            } else if (cleanKey.includes('validade') || cleanKey.includes('vencimento') || cleanKey.includes('expir')) {
              expiryDate = formatDateString(strVal);
            } else if (cleanKey.includes('aghu') || cleanKey.includes('sistema') || cleanKey.includes('sist')) {
              aghuQty = Number(strVal.replace(',', '.')) || 0;
            } else if (cleanKey.includes('fisico') || cleanKey.includes('contagem') || cleanKey.includes('real')) {
              physicalQty = Number(strVal.replace(',', '.')) || 0;
            } else if (cleanKey.includes('unidade') || cleanKey.includes('unid') || cleanKey.includes('und')) {
              unit = strVal.toUpperCase();
            } else if (cleanKey.includes('local') || cleanKey.includes('prateleira') || cleanKey.includes('gaveta')) {
              location = strVal;
            } else if (cleanKey.includes('minimo') || cleanKey.includes('min') || cleanKey.includes('estoquemin')) {
              minStock = Number(strVal.replace(',', '.')) || 10;
            } else if (cleanKey.includes('obs') || cleanKey.includes('nota') || cleanKey.includes('motivo')) {
              notes = strVal;
            }
          }

          // Só aceita a linha "1°" (primeiro lote) de cada bloco quando o
          // modelo tem a coluna "LOTES" — descarta as sub-linhas 2°/3°/4°.
          if (hasLotesMarkerCol) {
            const normMarker = String(loteMarkerRaw ?? '').replace(/[°º]/g, '').trim();
            if (normMarker !== '1') {
              return;
            }
          }

          if (!code && !description) {
            // Empty row skipped
            return;
          }

          if (!code) {
            code = `ITEM-${Math.floor(1000 + Math.random() * 9000)}`;
          }

          if (!description) {
            description = `Medicamento sem nome (${code})`;
          }

          // Se a planilha não trouxe validade (item zerado/não contado
          // neste mês), respeitamos isso: não inventamos uma validade
          // fictícia. O item entra com os campos vazios e a grade sinaliza
          // como zerado, em vez de parecer que há estoque válido.
          items.push({
            id: `inv_imp_${Date.now()}_${index}`,
            roomId,
            monthYear,
            code,
            description,
            presentation: presentation || 'N/A',
            batch,
            expiryDate,
            aghuQty: Math.max(0, aghuQty),
            physicalQty: Math.max(0, physicalQty),
            unit: unit || 'UNID',
            location: location || 'Setor Padrão',
            minStock: Math.max(0, minStock),
            notes: notes || undefined,
            updatedAt: new Date().toISOString(),
            updatedBy,
          });
        });

        resolve({
          success: items.length > 0,
          data: items,
          errors,
          totalRows: rawRows.length,
        });
      } catch (err) {
        resolve({
          success: false,
          data: [],
          errors: [`Erro ao processar planilha: ${(err as Error).message}`],
          totalRows: 0,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['Falha na leitura do arquivo local.'],
        totalRows: 0,
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

// 3b. Parse Catalog Excel — extrai apenas a identidade dos itens (código,
// descrição, apresentação), ignorando lote/validade/quantidades. Usado
// para importar/atualizar a lista padrão de itens de uma sala.
export async function parseCatalogExcel(file: File): Promise<ParseResult<StandardCatalogItem>> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const headerRowIndex = detectHeaderRowIndex(worksheet);
        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          raw: false,
          range: headerRowIndex,
        });

        if (!rawRows || rawRows.length === 0) {
          resolve({ success: false, data: [], errors: ['A planilha está vazia ou não contém dados legíveis.'], totalRows: 0 });
          return;
        }

        const items: StandardCatalogItem[] = [];
        const seenCodes = new Set<string>();

        rawRows.forEach((row) => {
          let code = '';
          let description = '';
          let presentation = '';
          let loteMarkerRaw: unknown;
          let hasLotesMarkerCol = false;

          for (const [key, val] of Object.entries(row)) {
            const trimmedKey = key.trim().toUpperCase();
            const cleanKey = normalizeKey(key);
            const strVal = String(val ?? '').trim();

            if (trimmedKey === 'LOTES') {
              hasLotesMarkerCol = true;
              loteMarkerRaw = val;
              continue;
            }

            if (cleanKey.includes('codigo') || cleanKey.includes('cod') || cleanKey.includes('material')) {
              code = strVal;
            } else if (cleanKey.includes('medicamento') || cleanKey.includes('descricao') || cleanKey.includes('item') || cleanKey.includes('nome')) {
              description = strVal;
            } else if (cleanKey.includes('apresentacao') || cleanKey.includes('forma')) {
              presentation = strVal;
            }
          }

          if (hasLotesMarkerCol) {
            const normMarker = String(loteMarkerRaw ?? '').replace(/[°º]/g, '').trim();
            if (normMarker !== '1') return;
          }

          if (!code && !description) return;
          if (code && seenCodes.has(code)) return;
          if (code) seenCodes.add(code);

          items.push({ code, description, presentation });
        });

        if (items.length === 0) {
          resolve({
            success: false,
            data: [],
            errors: ['Não foi possível identificar itens nessa planilha. Confira se ela tem colunas de código e descrição do medicamento.'],
            totalRows: rawRows.length,
          });
          return;
        }

        resolve({ success: true, data: items, errors: [], totalRows: rawRows.length });
      } catch (err) {
        resolve({
          success: false,
          data: [],
          errors: [`Erro ao processar a planilha: ${(err as Error).message}`],
          totalRows: 0,
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, data: [], errors: ['Falha na leitura do arquivo local.'], totalRows: 0 });
    };

    reader.readAsArrayBuffer(file);
  });
}

// 4. Parse Production Excel (Unitarização)
export async function parseProductionExcel(
  file: File,
  monthYear: string,
  operatorFallback: string
): Promise<ParseResult<ProductionItem>> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = pickSheetForMonth(workbook, monthYear);
        const worksheet = workbook.Sheets[sheetName];

        const headerRowIndex = detectHeaderRowIndex(worksheet);
        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          raw: false,
          range: headerRowIndex,
        });

        if (!rawRows || rawRows.length === 0) {
          resolve({
            success: false,
            data: [],
            errors: ['A planilha de produção está vazia.'],
            totalRows: 0,
          });
          return;
        }

        const items: ProductionItem[] = [];
        const errors: string[] = [];

        rawRows.forEach((row, index) => {
          let date = `${monthYear}-15`;
          let medicationCode = '';
          let medicationName = '';
          let batchNumber = '';
          let sourceBatch = '';
          let producedQty = 0;
          let lossQty = 0;
          let lossReason = '';
          let operatorName = operatorFallback;
          let technicianNote = '';
          let expiryDate = '';

          for (const [key, val] of Object.entries(row)) {
            const cleanKey = normalizeKey(key);
            const strVal = String(val ?? '').trim();

            if (cleanKey.includes('data') || cleanKey.includes('dia')) {
              date = formatDateString(strVal) || date;
            } else if (cleanKey.includes('codigo') || cleanKey.includes('cod')) {
              medicationCode = strVal;
            } else if (cleanKey.includes('medicamento') || cleanKey.includes('nome') || cleanKey.includes('descricao')) {
              medicationName = strVal;
            } else if (cleanKey.includes('loteunit') || cleanKey.includes('fracionamento') || cleanKey.includes('lote')) {
              if (!batchNumber) batchNumber = strVal;
              else if (!sourceBatch) sourceBatch = strVal;
            } else if (cleanKey.includes('original') || cleanKey.includes('fabricante') || cleanKey.includes('fonte')) {
              sourceBatch = strVal;
            } else if (cleanKey.includes('produz') || cleanKey.includes('doses') || cleanKey.includes('qtd') || cleanKey.includes('quantidade')) {
              producedQty = Number(strVal.replace(',', '.')) || 0;
            } else if (cleanKey.includes('perda') || cleanKey.includes('descarte') || cleanKey.includes('perd')) {
              lossQty = Number(strVal.replace(',', '.')) || 0;
            } else if (cleanKey.includes('motivo') || cleanKey.includes('razao') || cleanKey.includes('justificativa')) {
              lossReason = strVal;
            } else if (cleanKey.includes('operador') || cleanKey.includes('responsavel') || cleanKey.includes('tec')) {
              operatorName = strVal || operatorFallback;
            } else if (cleanKey.includes('validade') || cleanKey.includes('vencimento')) {
              expiryDate = formatDateString(strVal);
            } else if (cleanKey.includes('obs') || cleanKey.includes('nota')) {
              technicianNote = strVal;
            }
          }

          // Linhas de rodapé/total (ex: "TOTAL" na coluna de validade, sem
          // nome de medicamento) não são lançamentos de produção de verdade
          // — só uma linha com nome de medicamento (ou código) é aceita.
          if (!medicationCode && !medicationName) {
            return;
          }

          items.push({
            id: `prod_imp_${Date.now()}_${index}`,
            monthYear,
            date,
            medicationCode: medicationCode || `MED-${normalizeKey(medicationName || 'item').slice(0, 12)}`,
            medicationName: medicationName || 'Medicamento Unitarizado',
            batchNumber: batchNumber || `UNIT-${monthYear.replace('-', '')}-${index + 1}`,
            sourceBatch: sourceBatch || batchNumber || `LT-FAB-${Math.floor(1000 + Math.random() * 9000)}`,
            producedQty: Math.max(0, producedQty),
            lossQty: Math.max(0, lossQty),
            lossReason: lossReason || (lossQty > 0 ? 'Perda operacional padrão' : undefined),
            operatorName,
            technicianNote: technicianNote || undefined,
            expiryDate: expiryDate || `${Number(monthYear.split('-')[0]) + 1}-12-31`,
          });
        });

        resolve({
          success: items.length > 0,
          data: items,
          errors,
          totalRows: rawRows.length,
        });
      } catch (err) {
        resolve({
          success: false,
          data: [],
          errors: [`Erro ao processar planilha de produção: ${(err as Error).message}`],
          totalRows: 0,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['Falha na leitura do arquivo de produção.'],
        totalRows: 0,
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

// 5. Export Inventory to Excel (.xlsx)
export function exportInventoryToExcel(
  items: InventoryItem[],
  roomName: string,
  monthYear: string
) {
  const rows = items.map((item, idx) => {
    const diff = item.physicalQty - item.aghuQty;
    let statusDivergencia = 'EXATO (0)';
    if (diff > 0) statusDivergencia = `SOBRA (+${diff})`;
    else if (diff < 0) statusDivergencia = `FALTA (${diff})`;

    return {
      'Item Nº': idx + 1,
      'Código AGHU': item.code,
      'Medicamento / Descrição': item.description,
      'Apresentação': item.presentation,
      'Lote': item.batch,
      'Validade': item.expiryDate,
      'Qtd AGHU (Sistema)': item.aghuQty,
      'Qtd Físico (Contagem)': item.physicalQty,
      'Diferença (Físico - AGHU)': diff,
      'Status de Acurácia': statusDivergencia,
      'Unidade': item.unit,
      'Localização': item.location,
      'Estoque Mínimo': item.minStock,
      'Status de Estoque': item.physicalQty === 0 ? 'ZERADO' : item.physicalQty <= item.minStock ? 'ACABANDO' : 'NORMAL',
      'Última Edição': new Date(item.updatedAt).toLocaleDateString('pt-BR'),
      'Editado Por': item.updatedBy,
      'Observações': item.notes || '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  
  // Auto-width
  ws['!cols'] = [
    { wch: 8 },  // Item Nº
    { wch: 15 }, // Cod
    { wch: 36 }, // Nome
    { wch: 18 }, // Apresentação
    { wch: 14 }, // Lote
    { wch: 14 }, // Validade
    { wch: 18 }, // AGHU
    { wch: 20 }, // Físico
    { wch: 22 }, // Diferença
    { wch: 18 }, // Status
    { wch: 10 }, // Unid
    { wch: 20 }, // Local
    { wch: 15 }, // Min
    { wch: 16 }, // Est
    { wch: 14 }, // Edit
    { wch: 20 }, // Por
    { wch: 25 }, // Obs
  ];

  // Calculate Summary metrics
  const totalAghu = items.reduce((acc, i) => acc + i.aghuQty, 0);
  const totalFisico = items.reduce((acc, i) => acc + i.physicalQty, 0);
  const exatos = items.filter((i) => i.physicalQty === i.aghuQty).length;
  const acuracia = items.length > 0 ? ((exatos / items.length) * 100).toFixed(1) : '100';

  const summaryData = [
    ['RELATÓRIO OFICIAL DE INVENTÁRIO - CENTRAL DE ABASTECIMENTO FARMACÊUTICO (CAF)'],
    ['Unidade / Sala:', roomName],
    ['Mês de Referência:', monthYear],
    ['Data de Emissão:', new Date().toLocaleString('pt-BR')],
    [],
    ['INDICADORES GERAIS DA SALA:'],
    ['Total de Itens Auditados:', items.length],
    ['Total Unidades Físicas (Contadas):', totalFisico],
    ['Total Unidades no AGHU (Sistema):', totalAghu],
    ['Diferença Líquida:', totalFisico - totalAghu],
    ['Itens 100% Exatos (Sem divergência):', exatos],
    ['Taxa de Acurácia de Inventário (%):', `${acuracia}%`],
    ['Itens com Sobra (+):', items.filter((i) => i.physicalQty > i.aghuQty).length],
    ['Itens com Falta (-):', items.filter((i) => i.physicalQty < i.aghuQty).length],
    ['Itens Zerados:', items.filter((i) => i.physicalQty === 0).length],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 35 }, { wch: 35 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo_Geral');
  XLSX.utils.book_append_sheet(wb, ws, 'Itens_Inventario');

  const safeRoom = roomName.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Inventario_CAF_${safeRoom}_${monthYear}.xlsx`);
}

// 6. Export Production to Excel (.xlsx)
export function exportProductionToExcel(
  items: ProductionItem[],
  monthYear: string
) {
  const rows = items.map((item, idx) => {
    const lossPct = item.producedQty + item.lossQty > 0 
      ? ((item.lossQty / (item.producedQty + item.lossQty)) * 100).toFixed(2) + '%'
      : '0%';

    return {
      'Lançamento Nº': idx + 1,
      'Data de Produção': item.date,
      'Código Material': item.medicationCode,
      'Medicamento': item.medicationName,
      'Lote Unitarização': item.batchNumber,
      'Lote Original (Fabricante)': item.sourceBatch,
      'Validade Final': item.expiryDate,
      'Doses Produzidas': item.producedQty,
      'Doses Perdidas': item.lossQty,
      'Taxa de Perda (%)': lossPct,
      'Motivo da Perda': item.lossReason || 'Nenhuma perda',
      'Operador': item.operatorName,
      'Observação Técnica': item.technicianNote || '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 36 },
    { wch: 20 },
    { wch: 22 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 30 },
    { wch: 22 },
    { wch: 30 },
  ];

  const totalProduzido = items.reduce((acc, i) => acc + i.producedQty, 0);
  const totalPerdido = items.reduce((acc, i) => acc + i.lossQty, 0);
  const totalBruto = totalProduzido + totalPerdido;
  const taxaGlobalPerda = totalBruto > 0 ? ((totalPerdido / totalBruto) * 100).toFixed(2) : '0';

  const summaryData = [
    ['RELATÓRIO MENSAL DE PRODUÇÃO DE UNITARIZAÇÃO - CAF'],
    ['Mês de Referência:', monthYear],
    ['Data de Emissão:', new Date().toLocaleString('pt-BR')],
    [],
    ['INDICADORES DE PRODUTIVIDADE E QUALIDADE:'],
    ['Total de Doses Unitarizadas (Liberadas):', totalProduzido],
    ['Total de Doses Descartadas (Perdas):', totalPerdido],
    ['Taxa Global de Perda Operacional:', `${taxaGlobalPerda}% (Meta < 1.5%)`],
    ['Total de Lotes Processados no Mês:', items.length],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 35 }, { wch: 35 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo_Producao');
  XLSX.utils.book_append_sheet(wb, ws, 'Detalhamento_Producao');

  XLSX.writeFile(wb, `Producao_Unitarizacao_CAF_${monthYear}.xlsx`);
}

// Date normalization helper
function formatDateString(val: string): string {
  if (!val) return '';

  // Formato "MM/AAAA" (comum em planilhas de validade sem dia definido)
  if (/^\d{2}\/\d{4}$/.test(val)) {
    const [m, y] = val.split('/');
    return `${y}-${m.padStart(2, '0')}-01`;
  }

  // Format DD/MM/YYYY to YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
    const [d, m, y] = val.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Formato "M/D/AA" ou "MM/DD/AA" (padrão dos EUA que o Excel usa para
  // exibir células de data "de verdade" sem formato numérico customizado —
  // comum em planilhas de produção onde a data foi digitada como data,
  // não como texto).
  if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(val)) {
    const [m, d, y] = val.split('/');
    const fullYear = Number(y) < 70 ? `20${y.padStart(2, '0')}` : `19${y.padStart(2, '0')}`;
    return `${fullYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  
  // Format DD-MM-YYYY to YYYY-MM-DD
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
    const [d, m, y] = val.split('-');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
    return val.substring(0, 10);
  }

  const parsed = new Date(val);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  // Não foi possível reconhecer como data (ex: um valor de lote que caiu
  // na coluna errada) — nunca devolve o texto original aqui, pois isso
  // quebra a gravação no banco (coluna de data não aceita texto solto).
  return '';
}
