import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

export const PRODUCTIVITY_DATA_FILE = '/data/Controle Diário de Aproveitamento da Frota Julho_26.xlsx';
export const META_TERCEIROS = 0.25;

/**
 * Regra executiva informada para o comparativo Junho x Julho/26:
 * - Junho: Transpredi é tratada como Próprio junto com a Frota.
 * - Julho: Transpredi passa a ser classificada como Terceiro junto com as contratações de terceiros.
 *
 * Mantemos o XLSX bruto sem alteração e aplicamos a regra somente na camada de leitura/apresentação.
 */
export type ExecutiveComparisonPeriod = 'june' | 'july';

export function executiveOwnVolume(month: MonthSummary, period: ExecutiveComparisonPeriod): number {
  return period === 'june' ? month.frota + month.transpredi : month.frota;
}

export function executiveThirdPartyVolume(month: MonthSummary, period: ExecutiveComparisonPeriod): number {
  return period === 'june' ? month.terceiro : month.transpredi + month.terceiro;
}

export interface MonthSummary {
  label: string;
  frota: number;
  transpredi: number;
  terceiro: number;
  fob: number;
  total: number;
}

export interface UnitSummary {
  unit: string;
  frota: number;
  transpredi: number;
  terceiro: number;
  fob: number;
  total: number;
  vehicles: number;
  productivity: number;
  thirdPartyShare: number;
  ownShare: number;
}

export interface DailySummary {
  date: Date;
  label: string;
  frota: number;
  terceiro: number;
  fob: number;
  total: number;
}

export interface ProductivityWorkbookData {
  loading: boolean;
  error?: string;
  june: MonthSummary;
  july: MonthSummary;
  units: UnitSummary[];
  daily: DailySummary[];
  dailyByUnit: Record<string, DailySummary[]>;
  groupVehicles: number;
  metaTerceiros: number;
  dataNotes: string[];
}

const emptyMonth = (label: string): MonthSummary => ({
  label,
  frota: 0,
  transpredi: 0,
  terceiro: 0,
  fob: 0,
  total: 0,
});

function num(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const raw = value.replace('%', '').trim();
    const clean = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
    const parsed = Number(clean);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function text(value: unknown): string {
  return String(value ?? '').trim();
}

function normalize(value: unknown): string {
  return text(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return new Date(parsed.y, parsed.m - 1, parsed.d);
  }

  if (typeof value === 'string' && value.trim()) {
    const br = value.trim().match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/);
    if (br) return new Date(Number(br[3] ?? 2026), Number(br[2]) - 1, Number(br[1]));

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

function sheetRows(workbook: XLSX.WorkBook, name: string): unknown[][] {
  const sheet = workbook.Sheets[name];
  if (!sheet) return [];

  /**
   * IMPORTANTE:
   * Estas abas começam na coluna B (ex.: Analise = B1:O40 e
   * Carreg Julho_26 = B1:AR111). Sem forçar o início em A1, o
   * sheet_to_json(header: 1) devolve B como índice 0 e desloca todas
   * as posições de coluna em -1.
   *
   * Como o restante do parser usa índices absolutos do Excel
   * (B = 1, C = 2, AL = 37 etc.), ancoramos a leitura em A1.
   */
  const usedRange = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1:A1');
  const absoluteRange = {
    s: { r: 0, c: 0 },
    e: usedRange.e,
  };

  return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: null,
    range: absoluteRange,
  }) as unknown[][];
}

function columnLettersToIndex(letters: string): number {
  let value = 0;
  for (const char of letters.toUpperCase()) {
    value = value * 26 + (char.charCodeAt(0) - 64);
  }
  return value - 1;
}

/**
 * Resolve apenas referências simples de célula, como =C60.
 * A planilha usa esse padrão para algumas quantidades de veículos.
 * Fórmulas de soma não são necessárias: os totais são recalculados no código.
 */
function numericCell(rows: unknown[][], rowIndex: number, colIndex: number, depth = 0): number {
  if (depth > 4) return 0;

  const value = rows[rowIndex]?.[colIndex];
  const direct = num(value);
  if (direct !== 0 || value === 0 || value === '0') return direct;

  if (typeof value === 'string') {
    const match = value.trim().match(/^=\$?([A-Z]+)\$?(\d+)$/i);
    if (match) {
      const targetCol = columnLettersToIndex(match[1]);
      const targetRow = Number(match[2]) - 1;
      return numericCell(rows, targetRow, targetCol, depth + 1);
    }
  }

  return 0;
}

function sumRowRange(rows: unknown[][], rowIndex: number, startCol: number, endCol: number): number {
  let total = 0;
  for (let col = startCol; col <= endCol; col += 1) {
    total += num(rows[rowIndex]?.[col]);
  }
  return total;
}

/**
 * Lê um mês pela aba Analise sem usar a linha TOTAL do Excel.
 * As células TOTAL são fórmulas e podem chegar ao navegador sem valor em cache.
 * Por isso somamos diretamente as linhas das empresas, que são valores brutos.
 */
function readMonth(analysisRows: unknown[][], monthName: string, label: string): MonthSummary {
  const headingIndex = analysisRows.findIndex((row) => {
    const cell = normalize(row?.[1]);
    return cell.includes('carregamento grupo predilecta') && cell.includes(normalize(monthName));
  });

  if (headingIndex < 0) return emptyMonth(label);

  let frota = 0;
  let transpredi = 0;
  let terceiro = 0;
  let fob = 0;
  let foundRows = 0;

  // A primeira linha após o título é o cabeçalho; começamos duas linhas abaixo.
  for (let rowIndex = headingIndex + 2; rowIndex < analysisRows.length; rowIndex += 1) {
    const row = analysisRows[rowIndex];
    const company = normalize(row?.[1]);

    if (!company) {
      if (foundRows > 0) break;
      continue;
    }

    if (company === 'total') break;
    if (company.includes('carregamento grupo predilecta')) break;

    // Só considera linhas que realmente possuam números de operação.
    const rowFrota = num(row?.[2]);
    const rowTranspredi = num(row?.[4]);
    const rowTerceiro = num(row?.[8]);
    const rowFob = num(row?.[10]);

    if (rowFrota === 0 && rowTranspredi === 0 && rowTerceiro === 0 && rowFob === 0) continue;

    frota += rowFrota;
    transpredi += rowTranspredi;
    terceiro += rowTerceiro;
    fob += rowFob;
    foundRows += 1;
  }

  return {
    label,
    frota,
    transpredi,
    terceiro,
    fob,
    total: frota + transpredi + terceiro + fob,
  };
}

/**
 * Os blocos de julho aparecem na aba Carreg Julho_26 como:
 * FROTA / TRANSPREDI / TERCEIROS / FOB / TOTAL.
 * Detectamos os blocos pelo rótulo FROTA, sem depender de fórmulas auxiliares.
 */
function getFleetBlockIndexes(carregRows: unknown[][]): number[] {
  return carregRows
    .map((row, index) => ({ row, index }))
    .filter(({ row, index }) => index < 55 && normalize(row?.[1]) === 'frota')
    .map(({ index }) => index);
}

function readUnits(carregRows: unknown[][]): { units: UnitSummary[]; groupVehicles: number; detailTotal: number } {
  const unitNames = ['Predilecta', 'Salsaretti', "Stella D'Oro", 'SóFruta', 'Minas+', 'Nordeste Mais'];
  const fleetBlocks = getFleetBlockIndexes(carregRows);

  // Os seis primeiros blocos são unidades; o sétimo é o consolidado do grupo.
  const unitIndexes = fleetBlocks.slice(0, 6);
  const groupIndex = fleetBlocks[6];

  const units = unitIndexes.map((start, index): UnitSummary => {
    // C:AG = 31 dias de julho. Não usamos AH/AJ porque são fórmulas.
    const frota = sumRowRange(carregRows, start, 2, 32);
    const transpredi = sumRowRange(carregRows, start + 1, 2, 32);
    const terceiro = sumRowRange(carregRows, start + 2, 2, 32);
    const fob = sumRowRange(carregRows, start + 3, 2, 32);
    const total = frota + transpredi + terceiro + fob;

    // AL (índice 37) possui número direto ou referência simples, ex.: =C60.
    const vehicles = numericCell(carregRows, start, 37);

    return {
      unit: unitNames[index] ?? `Unidade ${index + 1}`,
      frota,
      transpredi,
      terceiro,
      fob,
      total,
      vehicles,
      productivity: vehicles > 0 ? frota / vehicles : 0,
      // Julho: pela regra executiva, Transpredi compõe Terceiro.
      thirdPartyShare: total > 0 ? (transpredi + terceiro) / total : 0,
      ownShare: total > 0 ? frota / total : 0,
    };
  });

  const unitVehicleSum = units.reduce((sum, item) => sum + item.vehicles, 0);
  const groupVehicles = groupIndex !== undefined
    ? numericCell(carregRows, groupIndex, 37) || unitVehicleSum
    : unitVehicleSum;

  // O detalhamento soma apenas as unidades existentes nessa aba.
  const detailTotal = units.reduce((sum, item) => sum + item.total, 0);

  return { units, groupVehicles, detailTotal };
}

const DAILY_UNIT_NAMES = ['Predilecta', 'Salsaretti', "Stella D'Oro", 'SóFruta', 'Minas+', 'Nordeste Mais'];

/**
 * Lê o dia a dia de um único bloco de fábrica.
 * Julho segue a regra executiva definida para a apresentação:
 * - Próprio = FROTA
 * - Terceiro = TRANSPREDI + TERCEIROS
 * - FOB permanece separado para fechar a demanda total.
 */
function readDailyBlock(carregRows: unknown[][], start: number): DailySummary[] {
  const result: DailySummary[] = [];

  for (let col = 2; col <= 32; col += 1) {
    const date = toDate(carregRows[1]?.[col]);
    if (!date) continue;

    const frota = num(carregRows[start]?.[col]);
    const transpredi = num(carregRows[start + 1]?.[col]);
    const terceiroContratado = num(carregRows[start + 2]?.[col]);
    const fob = num(carregRows[start + 3]?.[col]);
    const terceiro = transpredi + terceiroContratado;
    const total = frota + terceiro + fob;

    result.push({
      date,
      label: `${String(date.getDate()).padStart(2, '0')}/07`,
      frota,
      terceiro,
      fob,
      total,
    });
  }

  return result;
}

function readDailyData(carregRows: unknown[][]): {
  daily: DailySummary[];
  dailyByUnit: Record<string, DailySummary[]>;
} {
  const fleetBlocks = getFleetBlockIndexes(carregRows);
  const unitIndexes = fleetBlocks.slice(0, 6);

  if (!unitIndexes.length) {
    return { daily: [], dailyByUnit: {} };
  }

  const dailyByUnit: Record<string, DailySummary[]> = {};

  unitIndexes.forEach((start, index) => {
    const unitName = DAILY_UNIT_NAMES[index] ?? `Unidade ${index + 1}`;
    dailyByUnit[unitName] = readDailyBlock(carregRows, start);
  });

  // O consolidado do grupo é calculado pela soma dos seis blocos de fábrica.
  // Dessa forma o filtro e o total do grupo usam exatamente a mesma fonte.
  const reference = dailyByUnit[DAILY_UNIT_NAMES[0]] ?? [];
  const daily = reference.map((row, dayIndex): DailySummary => {
    let frota = 0;
    let terceiro = 0;
    let fob = 0;

    DAILY_UNIT_NAMES.forEach((unitName) => {
      const unitDay = dailyByUnit[unitName]?.[dayIndex];
      if (!unitDay) return;
      frota += unitDay.frota;
      terceiro += unitDay.terceiro;
      fob += unitDay.fob;
    });

    return {
      date: row.date,
      label: row.label,
      frota,
      terceiro,
      fob,
      total: frota + terceiro + fob,
    };
  });

  return { daily, dailyByUnit };
}

export function useProductivityWorkbook(): ProductivityWorkbookData {
  const [data, setData] = useState<ProductivityWorkbookData>({
    loading: true,
    june: emptyMonth('Junho/26'),
    july: emptyMonth('Julho/26'),
    units: [],
    daily: [],
    dailyByUnit: {},
    groupVehicles: 0,
    metaTerceiros: META_TERCEIROS,
    dataNotes: [],
  });

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(PRODUCTIVITY_DATA_FILE);
        if (!response.ok) {
          throw new Error(`Não foi possível carregar ${decodeURIComponent(PRODUCTIVITY_DATA_FILE.split('/').pop() ?? 'o XLSX')}.`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

        const analysisRows = sheetRows(workbook, 'Analise');
        const carregRows = sheetRows(workbook, 'Carreg Julho_26');

        if (!analysisRows.length || !carregRows.length) {
          throw new Error('O XLSX foi encontrado, mas as abas Analise e/ou Carreg Julho_26 não existem.');
        }

        const june = readMonth(analysisRows, 'JUNHO/26', 'Junho/26');
        const july = readMonth(analysisRows, 'JULHO/26', 'Julho/26');
        const { units, groupVehicles, detailTotal } = readUnits(carregRows);
        const { daily, dailyByUnit } = readDailyData(carregRows);

        if (june.total === 0 || july.total === 0) {
          throw new Error(
            'O XLSX foi aberto, mas Junho/Julho não puderam ser calculados. Verifique se a estrutura da aba Analise foi alterada.'
          );
        }

        if (!units.length || !daily.length) {
          throw new Error(
            'O XLSX foi aberto, mas o detalhamento de julho não pôde ser calculado na aba Carreg Julho_26.'
          );
        }

        const dataNotes: string[] = [];
        const unitVehicleSum = units.reduce((sum, item) => sum + item.vehicles, 0);

        if (july.total && detailTotal && july.total !== detailTotal) {
          dataNotes.push(`A aba Analise totaliza ${july.total} carregamentos em julho, enquanto o detalhamento diário soma ${detailTotal}.`);
        }

        if (groupVehicles && unitVehicleSum && groupVehicles !== unitVehicleSum) {
          dataNotes.push(`O consolidado informa ${groupVehicles} veículos, enquanto a soma das unidades resulta em ${unitVehicleSum}.`);
        }

        setData({
          loading: false,
          june,
          july,
          units,
          daily,
          dailyByUnit,
          groupVehicles,
          metaTerceiros: META_TERCEIROS,
          dataNotes,
        });
      } catch (error) {
        setData((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro inesperado ao ler o XLSX.',
        }));
      }
    }

    load();
  }, []);

  return data;
}
