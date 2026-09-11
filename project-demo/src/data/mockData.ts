import { RoomInfo, InventoryItem, ProductionItem, RoomHygieneEvaluation, User, RoomId, StandardCatalogItem } from '../types';

// Checklist oficial de Limpeza & Organização, aplicado a todas as salas.
// Só a chefia pode realizar essa avaliação dentro do app.
export const HYGIENE_CHECKLIST_ITEMS: { id: string; label: string }[] = [
  { id: 'espaco_suficiente', label: 'O espaço de armazenamento e estocagem está sendo suficiente para atender o volume de demanda.' },
  { id: 'paredes_sem_danos', label: 'As paredes não possuem rachaduras, infiltrações ou mofo.' },
  { id: 'iluminacao_ventilacao', label: 'O espaço possui iluminação e ventilação adequadas.' },
  { id: 'termohigrometros_funcionando', label: 'O espaço possui todos os termohigrômetros digitais em perfeito funcionamento.' },
  { id: 'temp_umidade_verificada', label: 'A temperatura e umidade do espaço é verificada diária e diuturnamente.' },
  { id: 'equipamentos_alocados', label: 'Todos os equipamentos, utensílios e materiais estão alocados em seus devidos lugares.' },
  { id: 'facil_inspecao_contagem', label: 'Os medicamentos e materiais estão estocados de modo a possibilitar uma fácil inspeção e uma rápida contagem.' },
  { id: 'sem_obstrucao_fluxo', label: 'O espaço não possui qualquer coisa que obstrua o fluxo de passagem (caixas, sacos, carrinhos, pallets etc).' },
  { id: 'identificacao_bins', label: 'Todos os bins, prateleiras ou caixas estão devidamente identificados com nome do produto, apresentação, lote e validade.' },
  { id: 'pvps', label: 'O armazenamento obedece o sistema PVPS (primeiro que vence, primeiro a sair).' },
  { id: 'caixas_sobre_pallets', label: 'Todas as caixas estão sobre pallets ou em prateleiras.' },
  { id: 'empilhamento_maximo', label: 'Está sendo respeitado o empilhamento máximo de caixas determinado pelo fabricante.' },
  { id: 'enderecamento_padrao', label: 'Todos os medicamentos estão respeitando seu endereçamento padrão.' },
  { id: 'validade_proxima_retirada', label: 'Todos os medicamentos e materiais com validade próxima foram retirados da área de estocagem antes do vencimento.' },
  { id: 'classificacao_local_padrao', label: 'Todos os medicamentos estão guardados em seu local padrão respeitando sua classificação (termolábil, MAV, SPGV, comprimidos, controlados e multidoses).' },
  { id: 'controlados_sala_reservada', label: 'Os medicamentos controlados e de alto custo estão em sala reservada com fechadura.' },
  { id: 'documentos_arquivados', label: 'Requisições, notas, planilhas, fichas e outros documentos impressos foram arquivados em seu local padrão.' },
  { id: 'circulacao_limpa', label: 'O espaço de circulação está devidamente limpo.' },
  { id: 'prateleiras_bins_limpos', label: 'Prateleiras e bins estão devidamente limpos.' },
  { id: 'epi_epc', label: 'Todos os colaboradores utilizam EPI e EPC corretamente.' },
  { id: 'acesso_emergencia_livre', label: 'Os medicamentos e materiais estocados não prejudicam o acesso às saídas de emergência, aos extintores de incêndio, a outros equipamentos de emergência ou à circulação de pessoal especializado para combater incêndio (Corpo de Bombeiros).' },
];

export const ROOMS_CONFIG: RoomInfo[] = [
  {
    id: 'unitarizacao',
    name: 'Sala de Unitarização',
    shortName: 'Unitarização',
    subtitle: 'Fracionamento, etiquetagem e rastreabilidade de doses',
    description: 'Central de fracionamento de comprimidos, ampolas e frascos com código de barras datamatrix para dispensação individualizada segura.',
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80',
    color: 'emerald',
    accentColor: '#10b981',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
    responsibleName: 'Farmacêutico Rafael Andrade (CRF 00001)',
    isSpecialProduction: true,
  },
  {
    id: 'controlados',
    name: 'Sala de Medicamentos Controlados',
    shortName: 'Controlados',
    subtitle: 'Portaria 344/98 - Psicotrópicos e Entorpecentes',
    description: 'Armazenamento em cofre com dupla tranca e livro eletrônico SNGPC de substâncias sujeitas a controle especial.',
    imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80',
    color: 'amber',
    accentColor: '#f59e0b',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
    responsibleName: 'Farmacêutica Beatriz Oliveira (CRF 00002)',
  },
  {
    id: 'quimioterapicos',
    name: 'Sala de Quimioterápicos',
    shortName: 'Quimioterápicos',
    subtitle: 'Antineoplásicos e Manipulação Estéril de Risco',
    description: 'Ambiente com pressão negativa e cabine de segurança biológica classe II B2 para antineoplásicos de alta toxicidade.',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
    color: 'purple',
    accentColor: '#8b5cf6',
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300',
    responsibleName: 'Farmacêutico Caio Barbosa (CRF 00003)',
  },
  {
    id: 'mavs',
    name: "Sala de MAV's",
    shortName: "MAV's",
    subtitle: 'Medicamentos de Alta Vigilância / High-Alert',
    description: 'Eletrólitos concentrados, heparinas, agentes sedativos e bloqueadores neuromusculares sob dupla checagem obrigatória.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    color: 'rose',
    accentColor: '#f43f5e',
    badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300',
    responsibleName: 'Farmacêutica Débora Ramos (CRF 00004)',
  },
  {
    id: 'injetaveis',
    name: 'Sala de Injetáveis Gerais',
    shortName: 'Injetáveis',
    subtitle: 'Ampolas, frascos-ampola e antibióticos parenterais',
    description: 'Estoque central climatizado (15°C a 25°C) de soluções injetáveis parenterais e antibióticos de uso hospitalar.',
    imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80',
    color: 'blue',
    accentColor: '#3b82f6',
    badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300',
    responsibleName: 'Técnico Especialista Eduardo Nunes',
  },
  {
    id: 'soros',
    name: 'Sala de Soros e Soluções',
    shortName: 'Soros',
    subtitle: 'Grandes Volumes Parenterais (SPGV) e Dialíticos',
    description: 'Armazenamento em paletes de soluções hidroeletrolíticas (SF 0,9%, SG 5%, Ringer c/ Lactato, Água p/ Injeção).',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    color: 'cyan',
    accentColor: '#06b6d4',
    badgeBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300',
    responsibleName: 'Técnica Fabiana Teixeira',
  },
  {
    id: 'multidoses',
    name: 'Sala de Multidoses',
    shortName: 'Multidoses',
    subtitle: 'Frascos multidose e doses fracionadas de uso comum',
    description: 'Armazenamento e controle de frascos multidose (colírios, insulinas, xaropes e injetáveis de múltiplas aplicações) com rastreabilidade de abertura e validade após abertura.',
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80',
    color: 'orange',
    accentColor: '#f97316',
    badgeBg: 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300',
    responsibleName: 'Técnico Gabriel Moraes',
  },
];

// Catálogo padrão de itens (medicamentos) de cada sala. Estes são os itens
// que aparecem fixos na grade de inventário mensal — o usuário só edita
// Lote, Validade e Quantidade a cada mês; a lista de itens é fixa.
// A lista da Unitarização (comprimidos) foi extraída do modelo oficial de
// planilha do hospital (relatório de conferência D/E).
export const STANDARD_CATALOG: Record<RoomId, StandardCatalogItem[]> = {
  unitarizacao: [
  { code: '13587', description: 'ACETAZOLAMIDA; 250MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '16926', description: 'ACICLOVIR; 200MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '13544', description: 'ÁCIDO ACETILSALICÍLICO; 100 MG TAMPONADO; COMPRIMIDO', presentation: 'comprimido' },
  { code: '12750', description: 'ÁCIDO FÓLICO; 5MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '114081', description: 'ÁCIDO FOLÍNICO( FÓLINATO DE CÁLCIO) 15MG;COMPRIMIDO', presentation: 'comprimido' },
  { code: '151300', description: 'ÁCIDO URSODESOXICÓLICO; 150MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '153451', description: 'ALBENDAZOL; 400MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '13757', description: 'AMIODARONA(CLORIDRATO); 200MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '154059', description: 'AMOXICILINA + CLAVULANATO DE POTÁSSIO; 500MG + 125MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '181099', description: 'ANLODIPINO(BESILATO); 5MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '136107', description: 'ATENOLOL; 50MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '13870', description: 'AZATIOPRINA; 50MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '269929', description: 'AZITROMICINA; 500MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '181315', description: 'BISACODIL; 5MG; DRÁGEA', presentation: 'drágea' },
  { code: '272857', description: 'BROMOPRIDA; 10MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '13978', description: 'CAPTOPRIL; 25MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '280632', description: 'CARVEDILOL; 3,125MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '290215', description: 'CILOSTAZOL; 50MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '238813', description: 'CIPROFLOXACINO(CLORIDRATO); 500 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '405970', description: 'CLARITROMICINA 500 MG', presentation: 'comprimido' },
  { code: '206636', description: 'CLINDAMICINA(CLORIDRATO); 300 MG; CÁPSULA', presentation: 'capsula' },
  { code: '14559', description: 'DEXAMETASONA; 0,5 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '16390', description: 'DEXAMETASONA; 4 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '17027', description: 'DOXICICLINA(CLORIDRATO); 100 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '14931', description: 'ESPIRONOLACTONA; 100 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '14923', description: 'ESPIRONOLACTONA; 25 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '288997', description: 'FLUCONAZOL; 150 MG; CÁPSULA', presentation: 'capsula' },
  { code: '230804', description: 'FLUCITOSINA 500MG COMPRIMIDO', presentation: 'comprimido' },
  { code: '15172', description: 'FUROSEMIDA; 40 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '281190', description: 'HIDROCLOROTIAZIDA; 25 MG, COMPRIMIDO', presentation: 'comprimido' },
  { code: '175706', description: 'ISOSSORBIDA, MONONITRATO 20MG COMP.', presentation: 'comprimido' },
  { code: '189197', description: 'ITRACONAZOL; 100 MG; CÁPSULA', presentation: 'cápsula' },
  { code: '406013', description: 'ITRACONAZOL; 100 MG; CÁPSULA - MS', presentation: 'cápsula' },
  { code: '265217', description: 'IVERMECTINA; 6 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '406353', description: 'LEVOFLOXACINO 500MG', presentation: 'comprimido' },
  { code: '289017', description: 'LEVOTIROXINA SÓDICA 50MCG', presentation: 'comprimido' },
  { code: '289019', description: 'LEVOTIROXINA SÓDICA; 25 MCG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '271187', description: 'LORATADINA; 10 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '264369', description: 'LOSARTANA POTÁSSICA; 50 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '136123', description: 'METILDOPA; 250 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '405811', description: 'METRONIDAZOL; 250 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '163996', description: 'NIFEDIPINO; 20 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '290225', description: 'NIMESULIDA; 100 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '13480', description: 'NORFLOXACINO; 400 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '136085', description: 'OMEPRAZOL; 20 MG; CÁPSULA', presentation: 'cápsula' },
  { code: '400003', description: 'OSELTAMIVIR (FOSFATO); 30 MG; CÁPSULA', presentation: 'cápsula' },
  { code: '400005', description: 'OSELTAMIVIR (FOSFATO); 45 MG; CÁPSULA', presentation: 'cápsula' },
  { code: '271851', description: 'OSELTAMIVIR (FOSFATO); 75 MG; CÁPSULA', presentation: 'cápsula' },
  { code: '13560', description: 'PARACETAMOL 500MG COMPRIMIDO', presentation: 'comprimido' },
  { code: '17620', description: 'PIRIMETAMINA; 25 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '405955', description: 'PREDNISONA 5MG', presentation: 'comprimido' },
  { code: '17680', description: 'PREDNISONA; 20 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '17752', description: 'PROMETAZINA(CLORIDRATO); 25 MG; COMPRIMIDO REVESTIDO', presentation: 'comprimido' },
  { code: '17809', description: 'PROPRANOLOL(CLORIDRATO); 40 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '290229', description: 'SECNIDAZOL; 1.000 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '271617', description: 'SINVASTATINA; 20 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '17973', description: 'SULFADIAZINA; 500 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '18406', description: 'SULFAMETOXAZOL + TRIMETOPRIMA; 400 MG + 80 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '17990', description: 'SULFASSALAZINA; 500 MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '18007', description: 'SULFATO FERROSO; 40 MG (FERRO ELEMENTAR);300MG', presentation: 'comprimido' },
  { code: '273627', description: 'VORICONAZOL 200MG COMP', presentation: 'comprimido' },
  { code: '405491', description: 'BEDAQUILINA 100 MG; COMPRIMIDO', presentation: 'COMPRIMIDOS' },
  { code: '224685', description: 'CLARITROMICINA; 500MG; COMPRIMIDO', presentation: 'comprimido' },
  { code: '184403', description: 'CLOFAZIMINA 100MG COMP', presentation: 'COMPRIMIDOS' },
  { code: '404565', description: 'CLOFAZIMINA 50MG COMP', presentation: 'COMPRIMIDOS' },
  { code: '405492', description: 'DELAMANIDA 50MG COMPRIMIDO', presentation: 'COMPRIMIDOS' },
  { code: '135631', description: 'ETAMBUTOL 400 MG COMP', presentation: 'COMPRIMIDOS' },
  { code: '135658', description: 'ETIONAMIDA 250 MG', presentation: 'COMPRIMIDOS' },
  { code: '135607', description: 'ISONIAZIDA 100 MG COMP', presentation: 'COMPRIMIDOS' },
  { code: '15750', description: 'ISONIAZIDA 150MG + RIFAMPICINA 300MG', presentation: 'COMPRIMIDOS' },
  { code: '404419', description: 'ISONIAZIDA; 300MG; COMPRIMIDO', presentation: 'COMPRIMIDOS' },
  { code: '248614', description: 'LEVOFLOXACINA 500MG COMPRIMIDO', presentation: 'COMPRIMIDOS' },
  { code: '290251', description: 'LEVOFLOXACINO 250MG COMP', presentation: 'COMPRIMIDOS' },
  { code: '270937', description: 'LINEZOLIDA 600MG COMPRIMIDO', presentation: 'COMPRIMIDOS' },
  { code: '281556', description: 'MOXIFLOXACINA 400 MG COMPRIMIDOS', presentation: 'COMPRIMIDOS' },
  { code: '135615', description: 'PIRAZINAMIDA 500 MG COMP', presentation: 'COMPRIMIDOS' },
  { code: '404347', description: 'PIRAZINAMIDA; 150 MG; COMPRIMIDO DISPERSÍVEL', presentation: 'COMPRIMIDOS' },
  { code: '402523', description: 'PIRIDOXINA (VITAMINA B6); 50 MG; COMPRIMIDO', presentation: 'COMPRIMIDOS' },
  { code: '402524', description: 'RIFABUTINA; 150 MG; COMPRIMIDO', presentation: 'COMPRIMIDOS' },
  { code: '290257', description: 'RIFAMPICINA 150MG + ISONIAZIDA 75MG', presentation: 'COMPRIMIDOS' },
  { code: '286242', description: 'RIFAMPICINA 150MG+ISONIAZIDA 75MG+PIRAZINAMIDA 400MG + ETAMBUTOL 275MG', presentation: 'COMPRIMIDOS' },
  { code: '17850', description: 'RIFAMPICINA 300 MG CAPS', presentation: 'COMPRIMIDOS' },
  { code: '404547', description: 'RIFAMPICINA 75MG+ISONIAZIDA 50MG', presentation: 'COMPRIMIDOS' },
  { code: '403835', description: 'RIFAMPICINA 75MG+ISONIAZIDA 50MG+PIRAZINAMIDA 150MG', presentation: 'COMPRIMIDOS' },
  { code: '405701', description: 'RIFAPENTINA 150MG COMPRIMIDO', presentation: 'COMPRIMIDOS' },
  { code: '290231', description: 'TERIZIDONA 250MG COMP', presentation: 'COMPRIMIDOS' },
  ],
  // Controlados: lista padrão ainda não recebida (chefia vai enviar depois).
  // Lista fictícia para fins de demonstração (a lista real do cliente
  // ainda não foi recebida na versão de produção).
  controlados: [
    { code: 'CTR-001', description: 'MORFINA 10MG/ML SOLUÇÃO INJETÁVEL', presentation: 'AMPOLA 1ML' },
    { code: 'CTR-002', description: 'FENTANILA 50MCG/ML SOLUÇÃO INJETÁVEL', presentation: 'AMPOLA 2ML' },
    { code: 'CTR-003', description: 'DIAZEPAM 5MG COMPRIMIDO', presentation: 'COMPRIMIDO' },
    { code: 'CTR-004', description: 'MIDAZOLAM 5MG/ML SOLUÇÃO INJETÁVEL', presentation: 'AMPOLA 3ML' },
    { code: 'CTR-005', description: 'CLONAZEPAM 2,5MG/ML SOLUÇÃO ORAL', presentation: 'FRASCO 20ML' },
    { code: 'CTR-006', description: 'METADONA 10MG COMPRIMIDO', presentation: 'COMPRIMIDO' },
    { code: 'CTR-007', description: 'HALOPERIDOL 5MG/ML SOLUÇÃO INJETÁVEL', presentation: 'AMPOLA 1ML' },
    { code: 'CTR-008', description: 'CLORIDRATO DE TRAMADOL 50MG/ML', presentation: 'AMPOLA 2ML' },
    { code: 'CTR-009', description: 'FENOBARBITAL 100MG COMPRIMIDO', presentation: 'COMPRIMIDO' },
    { code: 'CTR-010', description: 'CETAMINA 50MG/ML SOLUÇÃO INJETÁVEL', presentation: 'FRASCO-AMPOLA 10ML' },
    { code: 'CTR-011', description: 'OXICODONA 10MG COMPRIMIDO REVESTIDO', presentation: 'COMPRIMIDO' },
    { code: 'CTR-012', description: 'LORAZEPAM 2MG COMPRIMIDO', presentation: 'COMPRIMIDO' },
  ],
  // Quimioterápicos: extraído dos modelos oficiais UNACON + MULTIDOSE.
  quimioterapicos: [
  { code: '18457', description: 'ABIRATERONA (ACETATO); 250 MG; COMPRIMIDO', presentation: 'COMPRIMIDO' },
  { code: '16578', description: 'ACIDO FOLINICO 50 MG/5 ML', presentation: 'FRASCO-AMPOLA 5ML' },
  { code: '273221', description: 'ácido zoledrônico; 0,8 mg/mL; 4mg;solução injetável; frasco ampola 5ml', presentation: 'FRASCO-AMPOLA 5ML' },
  { code: '256617', description: 'anastrozol; 1 mg; comprimido', presentation: 'comprimido' },
  { code: '275067', description: 'bicalutamida; 50 mg; comprimido revestido', presentation: 'comprimido' },
  { code: '13919', description: 'bleomicina(sulfato); 15 U; pó para solução injetável', presentation: 'frasco-ampola' },
  { code: '269453', description: 'capecitabina; 500 mg; comprimido revestido', presentation: 'comprimido' },
  { code: '148601', description: 'carboplatina; 10 mg/mL; solução injetável 45ml', presentation: 'frasco-ampola 45ml' },
  { code: '14117', description: 'ciclofosfamida; 1 g; pó liofilizado injetável', presentation: 'frasco-ampola' },
  { code: '406673', description: 'cisplatina; 1 mg/mL; solução injetável 100ml', presentation: 'frasco-ampola 100ml' },
  { code: '16730', description: 'cisplatina; 1 mg/mL; solução injetável 50ml', presentation: 'frasco-ampola 50ml' },
  { code: '406689', description: 'cisplatina; 1 mg/mL; solução injetável 10ml', presentation: 'frasco-ampola 10ml' },
  { code: '228850', description: 'DOCETAXEL 80MG', presentation: 'frasco-ampola' },
  { code: '402327', description: 'etoposídeo; 20 mg/mL; 5ml; solução injetável', presentation: 'frasco-ampola 5ml' },
  { code: '402323', description: 'FILGRASTIM; 300 MCG; SOL. INJ; FRASCO AMPOLA 1 ML IV. SC.', presentation: 'seringa' },
  { code: '269880', description: 'fluoruracila; 50 mg/mL; 10ml;solução injetável', presentation: 'frasco-ampola 10ml' },
  { code: '269879', description: 'fluoruracila; 50 mg/mL; 50ML; solução injetável', presentation: 'frasco-ampola 50ml' },
  { code: '400031', description: 'gefitinibe; 250 mg; comprimido', presentation: 'comprimido' },
  { code: '237043', description: 'gencitabina(cloridrato); 1 g; pó liofilizado injetável', presentation: 'frasco-ampola' },
  { code: '275179', description: 'IMATINIBE 400MG COMPRIMIDOS', presentation: 'comprimido' },
  { code: '252468', description: 'irinotecano(cloridrato); 20 mg/mL; 5ml; solução injetável', presentation: 'frasco-ampola 5ml' },
  { code: '17248', description: 'mesna (mercaptoetanossulfonato de sódio); 100 mg/mL; 4ml; solução injetável', presentation: 'ampola 4ml' },
  { code: '400025', description: 'metotrexato; 100 mg/mL; solução injetável;frasco 5ml', presentation: 'frasco-ampola 5ml' },
  { code: '141097', description: 'ondansetrona(cloridrato); 2 mg/mL; 4ml; solução injetável', presentation: 'ampola 4ml' },
  { code: '202215', description: 'ondansetrona(cloridrato); 8 mg; comprimido', presentation: 'comprimido' },
  { code: '273298', description: 'oxaliplatina; 5 mg/mL; 100mg; 20ml; solução injetável', presentation: 'frasco-ampola 20ml' },
  { code: '287236', description: 'oxaliplatina; 5 mg/mL; 50mg; 10ml; solução injetável', presentation: 'frasco-ampola 10ml' },
  { code: '268780', description: 'paclitaxel; 6 mg/mL; 50ml; solução injetável', presentation: 'frasco-ampola 50ml' },
  { code: '406651', description: 'PACLITAXEL 6MG/ML FRA 16,7ML', presentation: 'frasco-ampola 16,7ml' },
  { code: '154075', description: 'tamoxifeno (citrato); 20 mg; comprimido', presentation: 'comprimido' },
  { code: '263478', description: 'vacina bcg; 40 mg (nº de bacilos vivos > 2,0 x 10⁶ UFC/mg de BCG); pó para suspensão injetável', presentation: 'ampola' },
  { code: '269563', description: 'TOPOTECANO 4MG FRASCO AMPOLA', presentation: 'frasco-ampola' },
  { code: '144517', description: 'AMOXICILINA + ACIDO CLAVULANICO 250MG SUSP', presentation: 'FRASCO' },
  { code: '16853', description: 'AMOXICILINA 50MG/ML', presentation: 'FRASCO' },
  { code: '157678', description: 'AZITROMICINA 600 MG, SUSPENSÃO', presentation: 'FRASCO' },
  { code: '19852', description: 'BICARBONATO DE SÓDIO; PÓ ORAL', presentation: 'FRASCO 100G' },
  { code: '150916', description: 'BROMETO IPRATROPIO 20ML', presentation: 'FRASCO' },
  { code: '402521', description: 'BUDESONIDA ;025MG/ML;SUSPENSAO INALATÓRIA', presentation: 'FRASCO 2ML' },
  { code: '290209', description: 'BUDESONIDA 0,5MG SOL. NEBULIZAÇÃO', presentation: 'FRASCO 2ML' },
  { code: '14060', description: 'CEFALEXINA 250MG/5ML SUSPENSAO ORAL FR', presentation: 'FRASCO' },
  { code: '270384', description: 'CETOCONAZOL CREME 2%', presentation: 'BISNAGA 30G' },
  { code: '250414', description: 'CLARITROMICINA 250MG/ 5 ML; PÓ SUSPENSÃO ORAL', presentation: 'FRASCO' },
  { code: '14311', description: 'CLOR. POTASSIO 60MG/ML 0,8MEQ/ML S.ORAL', presentation: 'FRASCO' },
  { code: '406661', description: 'DESLORATIDINA 0,5 MG/ML SOLUÇÃO ORAL FRASCO 100ML', presentation: 'FRASCO' },
  { code: '14532', description: 'DEXAMETASONA ACETATO A 0,1%', presentation: 'BISNAGA' },
  { code: '14591', description: 'DEXCLORFENIRAMINA 0,4 MG/ML SOL.ORAL', presentation: 'FRASCO 2ML' },
  { code: '14818', description: 'DIPIRONA 500 MG/ML SOL.ORAL', presentation: 'FRASCO 10ML' },
  { code: '16756', description: 'FENOTEROL GOTAS', presentation: 'FRASCO' },
  { code: '289099', description: 'FOSFATO DE SÓDIO MONOBÁSICO + DIBÁSICO; SOLUÇÃO RETAL', presentation: 'FRASCO' },
  { code: '15245', description: 'GLICERINA 12%', presentation: 'FRASCO 500ML' },
  { code: '290222', description: 'HIDROXIDO DE ALUMÍNIO 60MG/ML.', presentation: 'FRASCO 150ML' },
  { code: '148261', description: 'LACTULOSE SOL.ORAL 667MG/ML', presentation: 'FRASCO 120ML' },
  { code: '15865', description: 'LIDOCAINA A 2% GELEIA TUB. 30 G', presentation: 'BISNAGA' },
  { code: '16322', description: 'LIDOCAINA A SPRAY 10 MG/JATO FR', presentation: 'FRASCO' },
  { code: '15962', description: 'MEBENDAZOL 20 MG/ML SUSP.ORAL', presentation: 'FRASCO' },
  { code: '16136', description: 'METRONIDAZOL 40MG/ML SUSP.ORAL', presentation: 'FRASCO' },
  { code: '150746', description: 'MUPIROCINA CREME 2% TB', presentation: 'BISNAGA' },
  { code: '160601', description: 'N - ACETIL CISTEINA 600 MG', presentation: 'ENVELOPE' },
  { code: '17388', description: 'NISTATINA 100.000 U/ML SUSP.ORAL', presentation: 'FRASCO' },
  { code: '17442', description: 'OLEO MINERAL LIQ.', presentation: 'FRASCO 100ML' },
  { code: '290226', description: 'OXIDO DE ZINCO+ VIT A + VIT D POMADA', presentation: 'BISNAGA' },
  { code: '406245', description: 'PARACETAMOL SOL ORAL 200MG/ML', presentation: 'FRASCO' },
  { code: '195359', description: 'PERMETRINA LOCAO 5% FR', presentation: 'FRASCO' },
  { code: '145394', description: 'POLIESTIRENOSSULFONATO DE CALCIO PO ENV', presentation: 'ENVELOPE 30G' },
  { code: '270975', description: 'PREDNISOLONA 3MG/ML SOL ORAL', presentation: 'FRASCO' },
  { code: '17876', description: 'SAIS P/REIDRATACAO ORAL PÓ', presentation: 'ENVELOPE' },
  { code: '135950', description: 'SALBUTAMOL 100 MCG/JATO', presentation: 'FRASCO' },
  { code: '17892', description: 'SALBUTAMOL XAROPE 0.4 MG/ML', presentation: 'FRASCO' },
  { code: '17922', description: 'SIMETICONA 75 MG/ML SOL.ORAL', presentation: 'FRASCO' },
  { code: '17930', description: 'SORBITOL 70% + LAURILSSULFATO DE SODIO GELEIA', presentation: 'BISNAGA' },
  { code: '18414', description: 'SULFAMET+TRIMETOPRIM 200MG+40MG/5ML', presentation: 'FRASCO 100ML' },
  ],
  mavs: [
  { code: '14885', description: 'ADRENALINA 1 MG/ML 1 ML', presentation: 'AMPOLA 1ML' },
  { code: '13765', description: 'AMIODARONA(CLORIDRATO); 50 MG/ML; SOLUÇÃO INJETÁVEL; AMPOLA 3ML', presentation: 'AMPOLA 3ML' },
  { code: '13862', description: 'ATROPINA(SULFATO); 0,25 MG/ML; SOLUÇÃO INJETÁVEL; AMPOLA 1ML', presentation: 'AMPOLA 1ML' },
  { code: '13889', description: 'BICARBONATO DE SÓDIO; 1MEQ/ML (8,4%); SOLUÇÃO INJETÁVEL; AMPOLA 10ML', presentation: 'AMPOLA 10ML' },
  { code: '404983', description: 'BUPIVACAÍNA CLORIDRATO, EPINEFRINA, DOSAGEM 0,5 + 1/200.000UI', presentation: 'FRASCO-AMPOLA 10ML' },
  { code: '402333', description: 'BUPIVACAÍNA (CLORIDRATO) + GLICOSE; 5 MG/ML (0,5%) + 80 MG/ML (8%); SOLUÇÃO INJETÁVEL; AMPOLA 4 ML', presentation: 'FRASCO-AMPOLA 4ML' },
  { code: '400732', description: 'CLONIDINA CLORIDRATO 150 MCG/ML SOLUÇÃO INJETÁVEL', presentation: 'AMPOLA' },
  { code: '16233', description: 'CLORETO DE POTÁSSIO; 10% (1,34MEQ/ML); SOLUÇÃO INJETÁVEL; AMPOLA 10ML', presentation: 'AMPOLA 10ML' },
  { code: '290218', description: 'CLORETO DE SÓDIO; 10% (1,71 MEQ/ML); SOLUÇÃO INJETÁVEL;AMPOLA 10ML', presentation: 'AMPOLA 10ML' },
  { code: '289188', description: 'CONTRASTE RADIOLÓGICO ÁCIDO GADOTÉRICO 10 ML', presentation: 'AMPOLA 10ML' },
  { code: '12769', description: 'DESLANOSIDO 0,2 MG/ML AMP 2ML', presentation: 'AMPOLA 2ML' },
  { code: '14745', description: 'DIGOXINA 0,25 MG', presentation: 'COMPRIMIDO' },
  { code: '16861', description: 'DOBUTAMINA(CLORIDRATO); 12,5 MG/ML; SOLUÇÃO INJETÁVEL; AMPOLA 20ML', presentation: 'AMPOLA 20ML' },
  { code: '14834', description: 'DOPAMINA(CLORIDRATO); 5 MG/ML; SOLUÇÃO INJETÁVEL; AMPOLA 10ML', presentation: 'AMPOLA 10ML' },
  { code: '242845', description: 'ENOXAPARINA SÓDICA; 100 MG/ML; SOLUÇÃO INJETÁVEL; SERINGA 0,2ML', presentation: 'SERINGA' },
  { code: '242853', description: 'ENOXAPARINA SÓDICA; 100 MG/ML; SOLUÇÃO INJETÁVEL; SERINGA 0,4ML', presentation: 'SERINGA' },
  { code: '288989', description: 'ETILEFRINA; 10 MG/ML; SOL INJETÁVEL; AMPOLA 1 ML', presentation: 'AMPOLA' },
  { code: '15237', description: 'GLIBENCLAMIDA 5MG', presentation: 'COMPRIMIDO' },
  { code: '289000', description: 'GLICOSE; 25%; SOLUÇÃO INJETÁVEL; AMPOLA 10ML', presentation: 'AMPOLA 10ML' },
  { code: '15334', description: 'GLICOSE; 50%; SOLUÇÃO INJETÁVEL; AMPOLA 10ML', presentation: 'AMPOLA 10ML' },
  { code: '15342', description: 'GLUCONATO DE CÁLCIO; 100MG/ML (10%); SOLUÇÃO INJETÁVEL; AMPOLA 10ML', presentation: 'AMPOLA 10ML' },
  { code: '16349', description: 'HEPARINA SODICA 5000 UI; SOLUÇÃO INJ. SUBCUTÂNEA; FRASCO 0,25 ML', presentation: 'FRASCO-AMPOLA' },
  { code: '15431', description: 'HEPARINA SÓDICA; 5.000 UI/ML; SOL. INJ- SC', presentation: 'FRASCO-AMPOLA 5ML' },
  { code: '404957', description: 'LIDOCAINA 2% + EPINEFRINA 0,005MG/ML', presentation: 'FRASCO/AMPOLA 20ML' },
  { code: '83305', description: 'INSULINA INTERM NPH HUMANA 100 UI/ML FRA 10ML', presentation: 'FRASCO-AMPOLA' },
  { code: '13307', description: 'INSULINA REGULAR HUMANA 100UI FR/AMP 10ML', presentation: 'FRASCO-AMPOLA' },
  { code: '404338', description: 'LEVOBUPIVACAINA SEM VASO 0,5% F/A 20ML', presentation: 'FRASCO-AMPOLA' },
  { code: '402339', description: 'LEVOBUPIVACAINA C/ EPINEFRINA 0,5% F/A 20ML', presentation: 'FRASCO-AMPOLA' },
  { code: '406645', description: 'CLORIDRATO DE LIDOCAÍNA + CLORIDRATO FENILEFRINA; 20 MG/ML (2%) + 0,4 MG/ML (0,04%); SOLUÇÃO INJETÁV', presentation: 'AMPOLA 1,8ML' },
  { code: '218456', description: 'LIDOCAINA 2% SEM VASO CONSTRITOR 5ML', presentation: 'FRASCO-AMPOLA 5ML' },
  { code: '16489', description: 'LIDOCAINA 2% S/ VASO 20ML', presentation: 'FRASCO-AMPOLA 20ML' },
  { code: '138932', description: 'METARAMINOL 10MG/ML 1 ML AMP', presentation: 'AMPOLA 1ML' },
  { code: '176672', description: 'METFORMINA 850 MG', presentation: 'COMPRIMIDO' },
  { code: '17345', description: 'NEOSTIGMINA(METILSUFATO); 0,5 MG/ML; SOLUÇÃO INJETÁVEL; AMPOLA 1ML', presentation: 'AMPOLA 1ML' },
  { code: '17426', description: 'NITROPRUSSETO DE SÓDIO; 25 MG/ML; PÓ PARA SOLUÇÃO INJETÁVEL; AMPOLA 2ML', presentation: 'AMPOLA 2ML' },
  { code: '155284', description: 'NORADRENALINA 1/1000 4 ML AMP', presentation: 'AMPOLA 4ML' },
  { code: '213659', description: 'OCTREOTIDA 0,1MG/ML AMPOLA 1ML', presentation: 'AMPOLA 1ML' },
  { code: '17760', description: 'PROMETAZINA(CLORIDRATO); 25 MG/ML; SOLUÇÃO INJETÁVEL; AMPOLA 2ML', presentation: 'AMPOLA 2ML' },
  { code: '181277', description: 'PROTAMINA 1 % 5 ML AMP (P/CIRURGIA CARDIACA)', presentation: 'AMPOLA' },
  { code: '242888', description: 'ROCURONIO 50MG AMP', presentation: 'FRASCO/AMPOLA' },
  { code: '289023', description: 'SULFATO DE MAGNÉSIO; 10% (0,81 MEQ/ML); SOLUÇÃO INJETÁVEL 10ML', presentation: 'AMPOLA 10ML' },
  { code: '289072', description: 'SUXAMETÔNIO 100MG- INJ', presentation: 'FRASCO/AMPOLA' },
  { code: '273427', description: 'TERLIPRESSINA 1MG/FRA', presentation: 'FRASCO/AMPOLA' },
  { code: '235369', description: 'VARFARINA 5MG', presentation: 'COMPRIMIDO' },
  { code: '136239', description: 'VASOPRESSINA 20 UI/ML 1 ML AMP', presentation: 'FRASCO-AMPOLA' },
  { code: '211869', description: 'VECURÔNIO 4MG PÓ PARA SOLUÇÃO INJETÁVEL', presentation: 'FRASCO-AMPOLA' },
  ],
  injetaveis: [
  { code: '18457', description: 'ACETILCISTEÍNA; 100MG/ML; SOLUÇÃO INJETÁVEL; AMPOLA; 3ML', presentation: 'AMPOLA 3ML' },
  { code: '16934', description: 'ACICLOVIR;250MG;SOLUÇÃO INJETÁVEL', presentation: 'FRASCO/AMPOLA' },
  { code: '145050', description: 'ÁCIDO TRANEXÂMICO; 50MG/ML; SOLUÇÃO INJETÁVEL; AMPOLA 5ML', presentation: 'AMP 5ML' },
  { code: '405967', description: 'AMICACINA 250 MG/ML; INJETÁVEL', presentation: 'AMPOLA' },
  { code: '13722', description: 'AMINOFILINA; 24MG/ML; SOLUÇÃO INJETÁVEL; AMPOLA 10ML', presentation: 'AMPOLA 10ML' },
  { code: '167290', description: 'AMOXICILINA + AC. CLAVULANICO 1G', presentation: 'FRASCO/AMPOLA' },
  { code: '235334', description: 'AMPICILINA + SULBACTAN 3G', presentation: 'FRASCO/AMPOLA' },
  { code: '13811', description: 'AMPICILINA 1G', presentation: 'FRASCO/AMPOLA' },
  { code: '176346', description: 'ANTIMONIATO DE MEGLUMINA 1,5G', presentation: 'AMPOLA 5ML' },
  { code: '273311', description: 'AZITROMICINA 500MG INJETAVEL', presentation: 'FRASCO/AMPOLA' },
  { code: '288949', description: 'BROMOPRIDA; 5MG/ML; SOLUÇÃO INJETÁVEL; AMPOLA 2ML', presentation: 'AMPOLA 2ML' },
  { code: '248681', description: 'CEFAZOLINA 1G FRA', presentation: 'FRASCO/AMPOLA' },
  { code: '222380', description: 'CEFEPIMA 1G', presentation: 'FRASCO/AMPOLA' },
  { code: '18660', description: 'CEFTAZIDIMA 1000 MG SOL.INJ.', presentation: 'FRASCO' },
  { code: '16969', description: 'CEFTRIAXONA 1000 MG SOL.INJ.', presentation: 'FRASCO' },
  { code: '400726', description: 'CETOPROFENO; 100MG; PÓ LIOFILIZADO INJETÁVEL IV', presentation: 'FRASCO-AMPOLA' },
  { code: '224669', description: 'CLARITROMICINA 500MG', presentation: 'FRASCO' },
  { code: '288958', description: 'CLINDAMICINA 150MG/ML - INJETAVEL (AMP 4ML)', presentation: 'FRASCO' },
  { code: '404755', description: 'COLISTIMETATO DE SÓDIO; 1.000.000 UI; PÓ INJETÁVEL', presentation: 'FRASCO' },
  { code: '14575', description: 'DEXAMETASONA(FOSFATO DISSÓDICO); 4 MG/ML; SOLUÇÃO INJETÁVEL; AMPOLA 2,5ML', presentation: 'AMPOLA 2,5ML' },
  { code: '14826', description: 'DIPIRONA; 500 MG/ML; SOLUÇÃO INJETÁVEL; AMPOLA 2ML', presentation: 'AMPOLA 2ML' },
  { code: '15555', description: 'ESCOPOLAMINA(BUTILBROMETO); 20MG/ML; SOLUÇÃO INJETÁVEL; AMPOLA 1ML', presentation: 'AMPOLA 1ML' },
  { code: '289140', description: 'FITOMENADIONA (VITAMINA K); 10 MG/ML; SOLUÇÃO INJETÁVEL INTRAMUSCULAR; AMPOLA 1ML', presentation: 'AMPOLA 1ML' },
  { code: '151041', description: 'FLUCONAZOL 2MG/ML 100 ML', presentation: 'FRASCO' },
  { code: '15180', description: 'FUROSEMIDA; 10 MG/ML; SOLUÇÃO INJETÁVEL; AMPOLA 2ML', presentation: 'AMPOLA 2ML' },
  { code: '290221', description: 'GANCICLOVIR; 1 MG/ML; SOLUÇÃO INJETÁVEL; BOLSA 250 ML', presentation: 'BOLSA 250ML' },
  { code: '178365', description: 'GANCICLOVIR; 1 MG/ML; SOLUÇÃO INJETÁVEL; BOLSA 100 ML', presentation: 'BOLSA 100ML' },
  { code: '15202', description: 'GENTAMICINA 80 MG AMP', presentation: 'AMPOLA' },
  { code: '15474', description: 'HIDROCORTISONA(SUCCINATO SÓDICO); 100 MG; PÓ PARA SOLUÇÃO INJETÁVEL', presentation: 'FRASCO-AMPOLA' },
  { code: '15482', description: 'HIDROCORTISONA(SUCCINATO SÓDICO); 500 MG; PÓ PARA SOLUÇÃO INJETÁVEL', presentation: 'FRASCO-AMPOLA' },
  { code: '18708', description: 'IMIPENEM 500 MG + CILASTATINA 500MG SOL.INJ.FRA', presentation: 'FRASCO' },
  { code: '142921', description: 'ISOSSORBIDA(MONONITRATO); 10 MG/ML; SOLUÇÃO INJETÁVEL; AMPOLA 1ML', presentation: 'AMPOLA 1ML' },
  { code: '270058', description: 'LINEZOLIDA 2MG/ML', presentation: 'BOLSA 300ML' },
  { code: '15938', description: 'MANITOL 200MG/ML', presentation: 'FRASCO 250ML' },
  { code: '218480', description: 'MEROPENEM 1G', presentation: 'FRASCO/AMPOLA' },
  { code: '16420', description: 'METILPREDNISOLONA (SUCCINATO); 500 MG; PÓ PARA SUSPENSÃO INJETÁVEL', presentation: 'FRASCO-AMPOLA' },
  { code: '290250', description: 'METILPREDNISOLONA(SUCCINATO); 40 MG; PÓ PARA SUSPENSÃO INJETÁVEL', presentation: 'FRASCO-AMPOLA' },
  { code: '290224', description: 'MOXIFLOXACINO 400MG SOL. INJ', presentation: 'FRASCO' },
  { code: '289135', description: 'MULTIVITAMÍNICO PARA NUTRIÇÃO PARENTERAL:', presentation: 'AMPOLA' },
  { code: '136026', description: 'OLIGOELEMENTOS P/USO ADULTO', presentation: 'AMPOLA 2ML' },
  { code: '201790', description: 'OMEPRAZOL 40MG FRASCO/AMPOLA', presentation: 'FRASCO-AMPOLA' },
  { code: '141097', description: 'ONDANSENTRON 8MG AMP', presentation: 'FRASCO-AMPOLA' },
  { code: '149454', description: 'ONDANSETRONA(CLORIDRATO); 2 MG/ML; SOLUÇÃO INJETÁVEL; AMPOLA 2ML', presentation: 'AMPOLA 2ML' },
  { code: '17469', description: 'OXACILINA 500 MG SOL. INJ.FRA', presentation: 'FRASCO' },
  { code: '218200', description: 'PANTOPRAZOL SÓDICO; 40 MG; PÓ PARA SOLUÇÃO INJETÁVEL', presentation: 'FRASCO-AMPOLA' },
  { code: '17531', description: 'PENICILINA G BENZATINA 1.200.000 UI', presentation: 'FRASCO/AMPOLA' },
  { code: '17540', description: 'PENICILINA G CRISTALINA 5.000.000 UI', presentation: 'FRASCO/AMPOLA' },
  { code: '248665', description: 'PIPERACILINA 4G + 0,5G TAZOBACTAM FRA', presentation: 'FRASCO/AMPOLA' },
  { code: '402551', description: 'POLIDOCANOL 1%', presentation: 'AMPOLA' },
  { code: '289168', description: 'POLIDOCANOL 3%', presentation: 'AMPOLA' },
  { code: '272925', description: 'POLIMIXINA B SULFATO 500.000 UI', presentation: 'FRASCO/AMPOLA' },
  { code: '12858', description: 'SULFAMETOXAZOL+TRIMETOPRIM 400MG+80MG/5ML AMP INJ', presentation: 'FRASCO/AMPOLA' },
  { code: '13412', description: 'TERBUTALINA(SULFATO); 0,5 MG/ML;1ML; SOLUÇÃO INJETÁVEL;AMPOLA 1ML', presentation: 'AMPOLA 1ML' },
  { code: '18465', description: 'VANCOMICINA 50MG/ML 10 ML FRA', presentation: 'FRASCO/AMPOLA' },
  { code: '273312', description: 'VORICONAZOL 200MG', presentation: 'FRASCO/AMPOLA' },
  { code: '1277', description: 'METRONIDAZOL; 5 MG/ML; SOLUÇÃO INJETÁVEL; SISTEMA FECHADO COM 100 ML', presentation: 'BOLSA' },
  ],
  // Multidoses: lista padrão ainda não recebida (chefia vai enviar depois).
  multidoses: [],
  soros: [
  { code: '190110', description: 'cloreto de sódio; 0,9% (0,154 mEq/mL); solução injetável; frasco 1000ml', presentation: 'FRASCO' },
  { code: '202550', description: 'cloreto de sódio; 0,9% (0,154 mEq/mL); solução injetável; frasco 100ml', presentation: 'FRASCO' },
  { code: '201570', description: 'cloreto de sódio; 0,9% (0,154 mEq/mL); solução injetável; frasco 500ml', presentation: 'FRASCO' },
  { code: '201588', description: 'cloreto de sódio; 0,9% (0,154meq/ml); solução injetável; frasco 250ml', presentation: 'FRASCO' },
  { code: '191973', description: 'ringer com lactato: cloreto de sódio + cloreto de potássio + cloreto de cálcio + lactato de sódio; 6,00 mg/mL + 0,30 mg/mL + 0,20 mg/mL + 3,00 mg/mL; solução injetável;frasco 500ml', presentation: 'FRASCO' },
  { code: '253650', description: 'ringer simples: cloreto de sódio + cloreto de potássio + cloreto de cálcio; 8 mg/mL + 0,3 mg/mL + 0,33 mg/mL; solução injetável;frasco 500ml', presentation: 'FRASCO' },
  { code: '143723', description: 'AGUA DE INJEÇÃO EM SIST FECHADO EMB DE 100 ML', presentation: 'FRASCO' },
  { code: '274893', description: 'AGUA PARA INJEÇÃO; SOLUÇÃO INJETÁVEL; EMB. DE 250 ML', presentation: 'FRASCO' },
  { code: '403947', description: 'concentrado básico para hemodiálise - CPHD; Bicarbonato de sódio; 8,4%; solução para hemodiálise', presentation: 'GALÃO' },
  { code: '405753', description: 'SOLUÇÃO BÁSICA DE BICARBONATO À 8,4% - BIBAG 650G, COMPATÍVEL COM EQUIPAMENTO DA MARCA FRESENIUS, MO', presentation: 'BOLSA' },
  { code: '242861', description: 'glicose; 10%; solução injetável; frasco 250ml', presentation: '' },
  { code: '201545', description: 'glicose; 5%; solução injetável; frasco 250ml', presentation: '' },
  { code: '201561', description: 'glicose; 5%; solução injetável; frasco 500ml', presentation: '' },
  { code: '289104', description: 'manitol + sorbitol; 5,4 mg/mL (0,54%) + 27 mg/mL (2,7%); solução injetável – 1000ml', presentation: 'FRASCO' },
  { code: '15938', description: 'manitol; 200 mg/mL (20%);  solução injetável; frasco 250ml', presentation: 'FRASCO' },
  ],
};

export const USERS_CONFIG: Record<string, { user: User; passwordHash: string }> = {
  'adm': {
    user: {
      id: 'usr_chefe',
      name: 'Ana Ferreira',
      role: 'chefe',
    },
    passwordHash: 'adm',
  },
  'rafael.andrade': {
    user: {
      id: 'usr_unit',
      name: 'Rafael Andrade',
      role: 'responsavel_sala',
      roomId: 'unitarizacao',
    },
    passwordHash: 'demo123',
  },
  'beatriz.oliveira': {
    user: {
      id: 'usr_ctrl',
      name: 'Beatriz Oliveira',
      role: 'responsavel_sala',
      roomId: 'controlados',
    },
    passwordHash: 'demo123',
  },
  'caio.barbosa': {
    user: {
      id: 'usr_quimio',
      name: 'Caio Barbosa',
      role: 'responsavel_sala',
      roomId: 'quimioterapicos',
    },
    passwordHash: 'demo123',
  },
  'debora.ramos': {
    user: {
      id: 'usr_mavs',
      name: 'Débora Ramos',
      role: 'responsavel_sala',
      roomId: 'mavs',
    },
    passwordHash: 'demo123',
  },
  'eduardo.nunes': {
    user: {
      id: 'usr_inj',
      name: 'Eduardo Nunes',
      role: 'responsavel_sala',
      roomId: 'injetaveis',
    },
    passwordHash: 'demo123',
  },
  'fabiana.teixeira': {
    user: {
      id: 'usr_soros',
      name: 'Fabiana Teixeira',
      role: 'responsavel_sala',
      roomId: 'soros',
    },
    passwordHash: 'demo123',
  },
  'gabriel.moraes': {
    user: {
      id: 'usr_multi',
      name: 'Gabriel Moraes',
      role: 'responsavel_sala',
      roomId: 'multidoses',
    },
    passwordHash: 'demo123',
  },
};

// ============================================================================
// DADOS DE DEMONSTRAÇÃO — gerados dinamicamente para o mês atual, com nomes
// e lotes fictícios. Sem conexão com nenhum banco de dados real: isto só
// preenche o modo "offline" do app quando não há Supabase configurado, para
// que a demonstração pública sempre mostre as salas com dados de exemplo,
// não vazias.
// ============================================================================

const DEMO_PEOPLE: Record<RoomId, string> = {
  unitarizacao: 'Rafael Andrade',
  controlados: 'Beatriz Oliveira',
  quimioterapicos: 'Caio Barbosa',
  mavs: 'Débora Ramos',
  injetaveis: 'Eduardo Nunes',
  soros: 'Fabiana Teixeira',
  multidoses: 'Gabriel Moraes',
};

const pad2 = (n: number) => String(n).padStart(2, '0');

function currentMonthYear(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function offsetDateFromToday(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// Gera o inventário fictício de uma sala a partir do seu catálogo padrão,
// com uma amostra de itens, misturando: certos, com pequena divergência,
// perto de vencer e algum zerado — para a demo mostrar todos os tipos de
// alerta que o painel sabe destacar.
function generateDemoInventoryForRoom(roomId: RoomId, monthYear: string): InventoryItem[] {
  const catalog = STANDARD_CATALOG[roomId] || [];
  const sample = catalog.slice(0, Math.min(16, catalog.length));
  const operator = DEMO_PEOPLE[roomId];

  return sample.map((item, idx) => {
    const seed = idx + 1;
    const aghuQty = 15 + ((seed * 13) % 160);

    // Padrão cíclico de cenários para variar a demonstração
    const scenario = seed % 6;
    let physicalQty = aghuQty;
    let expiryDays = 90 + ((seed * 23) % 280); // maioria com validade tranquila
    if (scenario === 0) {
      physicalQty = 0; // item zerado
    } else if (scenario === 1) {
      physicalQty = Math.max(0, aghuQty - (2 + (seed % 5))); // pequena falta
    } else if (scenario === 2) {
      physicalQty = aghuQty + (1 + (seed % 3)); // pequena sobra
      expiryDays = 12 + (seed % 15); // perto de vencer
    } else if (scenario === 3) {
      expiryDays = 5 + (seed % 10); // crítico, quase vencendo
    }

    return {
      id: `demo_${roomId}_${item.code}`,
      roomId,
      monthYear,
      code: item.code,
      description: item.description,
      presentation: item.presentation,
      batch: `LT${2000 + seed * 41}`,
      expiryDate: offsetDateFromToday(expiryDays),
      aghuQty,
      physicalQty,
      unit: 'UND',
      location: `Estoque Demo`,
      minStock: 10,
      updatedAt: new Date().toISOString(),
      updatedBy: operator,
    } as InventoryItem;
  });
}

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = (() => {
  const monthYear = currentMonthYear();
  return ROOMS_CONFIG.flatMap((room) => generateDemoInventoryForRoom(room.id, monthYear));
})();

// Produção fictícia da Unitarização no mês atual
function generateDemoProduction(monthYear: string): ProductionItem[] {
  const catalog = STANDARD_CATALOG.unitarizacao || [];
  const sample = catalog.slice(0, Math.min(14, catalog.length));
  return sample.map((item, idx) => {
    const seed = idx + 1;
    const producedQty = 200 + ((seed * 37) % 900);
    const lossQty = seed % 4 === 0 ? 3 + (seed % 8) : 0;
    return {
      id: `demo_prod_${item.code}`,
      monthYear,
      date: offsetDateFromToday(-(seed % 20)),
      medicationCode: item.code,
      medicationName: item.description,
      batchNumber: `UNIT-${monthYear.replace('-', '')}-${pad2(seed)}`,
      sourceBatch: `LT${3000 + seed * 29}`,
      producedQty,
      lossQty,
      lossReason: lossQty > 0 ? 'Falha na selagem térmica do invólucro' : undefined,
      operatorName: DEMO_PEOPLE.unitarizacao,
      expiryDate: offsetDateFromToday(180 + (seed % 200)),
    } as ProductionItem;
  });
}

export const INITIAL_PRODUCTION_ITEMS: ProductionItem[] = generateDemoProduction(currentMonthYear());

// Avaliações fictícias de Limpeza & Organização — a maioria conforme, com
// uma sala não conforme para ilustrar como o painel sinaliza pendências.
function generateDemoHygiene(monthYear: string): RoomHygieneEvaluation[] {
  const allConforme = Object.fromEntries(HYGIENE_CHECKLIST_ITEMS.map((i) => [i.id, true]));

  return ROOMS_CONFIG.map((room, idx) => {
    const isNaoConforme = idx === 4; // uma sala fica não conforme, de propósito
    const checklist = { ...allConforme };
    if (isNaoConforme) {
      checklist[HYGIENE_CHECKLIST_ITEMS[2].id] = false;
      checklist[HYGIENE_CHECKLIST_ITEMS[8].id] = false;
    }
    const trueCount = Object.values(checklist).filter(Boolean).length;
    const score = Math.round((trueCount / HYGIENE_CHECKLIST_ITEMS.length) * 100);

    return {
      id: `demo_hyg_${room.id}`,
      roomId: room.id,
      monthYear,
      status: isNaoConforme ? 'nao_conforme' : 'conforme',
      score,
      evaluatorName: 'Ana Ferreira',
      evaluatedAt: new Date().toISOString(),
      checklist,
      observations: isNaoConforme
        ? 'Pontos de organização a corrigir identificados durante a vistoria mensal.'
        : 'Sala em conformidade com os padrões de armazenamento e organização.',
      correctiveActions: isNaoConforme
        ? 'Reorganizar prateleiras e reforçar identificação de bins até a próxima vistoria.'
        : undefined,
    } as RoomHygieneEvaluation;
  });
}

export const INITIAL_HYGIENE_EVALUATIONS: RoomHygieneEvaluation[] = generateDemoHygiene(currentMonthYear());
