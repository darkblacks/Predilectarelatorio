import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

export const PRODUCTIVITY_DATA_FILE = '/data/Controle_Aproveitamento_Frota_Agosto_2026_v3.xlsx';
export const PRODUCTIVITY_DATA_LABEL = 'Controle_Aproveitamento_Frota_Agosto_2026_v3.xlsx';
export const CURRENT_MONTH_LABEL = 'Agosto/26';
export const CURRENT_MONTH_LONG_LABEL = 'Agosto/2026';
export const META_TERCEIROS = 0.25;

export type ExecutiveComparisonPeriod = 'may' | 'june' | 'july';

export interface MonthSummary {
  label: string;
  frota: number;
  transpredi: number;
  transprediContratado: number;
  terceiro: number;
  fob: number;
  own: number;
  thirdParty: number;
  total: number;
  vehicles: number;
}

export interface UnitSummary {
  unit: string;
  frota: number;
  transpredi: number;
  transprediContratado: number;
  terceiro: number;
  fob: number;
  own: number;
  thirdParty: number;
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
  months: MonthSummary[];
  may: MonthSummary;
  june: MonthSummary;
  july: MonthSummary;
  units: UnitSummary[];
  daily: DailySummary[];
  dailyByUnit: Record<string, DailySummary[]>;
  groupVehicles: number;
  metaTerceiros: number;
  dataNotes: string[];
}

function buildMonth(input: {
  label: string;
  frota: number;
  transpredi?: number;
  transprediContratado?: number;
  terceiro: number;
  fob: number;
  own?: number;
  thirdParty?: number;
  vehicles?: number;
}): MonthSummary {
  const transpredi = input.transpredi ?? 0;
  const transprediContratado = input.transprediContratado ?? 0;
  const own = input.own ?? input.frota + transpredi;
  const thirdParty = input.thirdParty ?? transprediContratado + input.terceiro;

  return {
    label: input.label,
    frota: input.frota,
    transpredi,
    transprediContratado,
    terceiro: input.terceiro,
    fob: input.fob,
    own,
    thirdParty,
    total: own + thirdParty + input.fob,
    vehicles: input.vehicles ?? 0,
  };
}

export function executiveOwnVolume(month: MonthSummary, _period: ExecutiveComparisonPeriod): number {
  return month.own;
}

export function executiveThirdPartyVolume(month: MonthSummary, _period: ExecutiveComparisonPeriod): number {
  return month.thirdParty;
}

const fallbackMay = buildMonth({
  label: 'Maio/26',
  frota: 942,
  transpredi: 139,
  terceiro: 1025,
  fob: 96,
  own: 1081,
  thirdParty: 1025,
  vehicles: 129,
});

const fallbackJune = buildMonth({
  label: 'Junho/26',
  frota: 1024,
  transpredi: 191,
  terceiro: 828,
  fob: 110,
  own: 1215,
  thirdParty: 828,
  vehicles: 129,
});

const fallbackJuly = buildMonth({
  label: 'Julho/26',
  frota: 1344,
  transpredi: 0,
  transprediContratado: 187,
  terceiro: 798,
  fob: 128,
  own: 1344,
  thirdParty: 985,
  vehicles: 129,
});

const emptyMonth = (label: string): MonthSummary =>
  buildMonth({
    label,
    frota: 0,
    transpredi: 0,
    transprediContratado: 0,
    terceiro: 0,
    fob: 0,
    own: 0,
    thirdParty: 0,
    vehicles: 0,
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

function cleanUnitName(value: unknown): string {
  return text(value).replace(/^\d+\.\s*/, '').replace(/\s+/g, ' ').trim();
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

function sumRowRange(rows: unknown[][], rowIndex: number, startCol: number, endCol: number): number {
  let total = 0;
  for (let col = startCol; col <= endCol; col += 1) {
    total += num(rows[rowIndex]?.[col]);
  }
  return total;
}

function getDayColumns(rows: unknown[][]): Array<{ col: number; date: Date }> {
  const dayRowIndex = rows.findIndex((row) => normalize(row?.[1]) === 'dia');
  if (dayRowIndex < 0) return [];

  const result: Array<{ col: number; date: Date }> = [];
  const row = rows[dayRowIndex] ?? [];

  for (let col = 2; col < row.length; col += 1) {
    const date = toDate(row[col]);
    if (date) result.push({ col, date });
  }

  return result;
}

function getUnitBlockIndexes(rows: unknown[][]): number[] {
  return rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => /^\d+\.\s+/.test(text(row?.[1])))
    .map(({ index }) => index);
}

function getVehicleMap(frotaRows: unknown[][]): Map<string, number> {
  const vehicles = new Map<string, number>();

  frotaRows.forEach((row) => {
    const unit = text(row?.[1]);
    if (!unit || normalize(unit) === 'empresa' || normalize(unit) === 'total') return;
    vehicles.set(normalize(unit), num(row?.[2]));
  });

  return vehicles;
}

function readUnit(
  launchRows: unknown[][],
  start: number,
  dayColumns: Array<{ col: number; date: Date }>,
  vehicleMap: Map<string, number>
): { unit: UnitSummary; daily: DailySummary[] } {
  const unitName = cleanUnitName(launchRows[start]?.[1]);
  const endCol = dayColumns.length ? dayColumns[dayColumns.length - 1].col : 32;
  const modalityRows = new Map<string, number>();

  for (let rowIndex = start + 1; rowIndex < launchRows.length; rowIndex += 1) {
    const label = normalize(launchRows[rowIndex]?.[1]);
    if (!label || label === 'total') {
      if (label === 'total') break;
      continue;
    }
    modalityRows.set(label, rowIndex);
  }

  const frotaRow = modalityRows.get('frota') ?? -1;
  const transprediRow = modalityRows.get('transpredi') ?? -1;
  const transprediContratadoRow = modalityRows.get('transpredi contratado') ?? -1;
  const terceiroRow = modalityRows.get('terceiros') ?? -1;
  const fobRow = modalityRows.get('fob') ?? -1;

  const frota = frotaRow >= 0 ? sumRowRange(launchRows, frotaRow, 2, endCol) : 0;
  const transpredi = transprediRow >= 0 ? sumRowRange(launchRows, transprediRow, 2, endCol) : 0;
  const transprediContratado = transprediContratadoRow >= 0
    ? sumRowRange(launchRows, transprediContratadoRow, 2, endCol)
    : 0;
  const terceiro = terceiroRow >= 0 ? sumRowRange(launchRows, terceiroRow, 2, endCol) : 0;
  const fob = fobRow >= 0 ? sumRowRange(launchRows, fobRow, 2, endCol) : 0;
  const own = frota + transpredi;
  const thirdParty = transprediContratado + terceiro;
  const total = own + thirdParty + fob;
  const vehicles = vehicleMap.get(normalize(unitName)) ?? 0;

  const daily = dayColumns.map(({ col, date }) => {
    const dayOwn =
      num(launchRows[frotaRow]?.[col]) +
      num(launchRows[transprediRow]?.[col]);
    const dayThirdParty =
      num(launchRows[transprediContratadoRow]?.[col]) +
      num(launchRows[terceiroRow]?.[col]);
    const dayFob = num(launchRows[fobRow]?.[col]);

    return {
      date,
      label: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
      frota: dayOwn,
      terceiro: dayThirdParty,
      fob: dayFob,
      total: dayOwn + dayThirdParty + dayFob,
    };
  });

  return {
    unit: {
      unit: unitName,
      frota,
      transpredi,
      transprediContratado,
      terceiro,
      fob,
      own,
      thirdParty,
      total,
      vehicles,
      productivity: vehicles > 0 ? own / vehicles : 0,
      thirdPartyShare: own + thirdParty > 0 ? thirdParty / (own + thirdParty) : 0,
      ownShare: own + thirdParty > 0 ? own / (own + thirdParty) : 0,
    },
    daily,
  };
}

function readAugustWorkbook(workbook: XLSX.WorkBook): {
  currentMonth: MonthSummary;
  units: UnitSummary[];
  daily: DailySummary[];
  dailyByUnit: Record<string, DailySummary[]>;
  groupVehicles: number;
} {
  const launchRows = sheetRows(workbook, 'Lançamento Diário');
  const frotaRows = sheetRows(workbook, 'Frota');

  if (!launchRows.length || !frotaRows.length) {
    throw new Error('O XLSX foi encontrado, mas as abas Lançamento Diário e/ou Frota não existem.');
  }

  const dayColumns = getDayColumns(launchRows);
  const blockIndexes = getUnitBlockIndexes(launchRows);
  const vehicleMap = getVehicleMap(frotaRows);

  if (!dayColumns.length || !blockIndexes.length) {
    throw new Error('O XLSX foi aberto, mas a estrutura de lançamentos diários não foi reconhecida.');
  }

  const dailyByUnit: Record<string, DailySummary[]> = {};
  const units = blockIndexes.map((start) => {
    const parsed = readUnit(launchRows, start, dayColumns, vehicleMap);
    dailyByUnit[parsed.unit.unit] = parsed.daily;
    return parsed.unit;
  });

  const daily = dayColumns.map(({ date }, dayIndex) => {
    let frota = 0;
    let terceiro = 0;
    let fob = 0;

    units.forEach((unit) => {
      const unitDay = dailyByUnit[unit.unit]?.[dayIndex];
      if (!unitDay) return;
      frota += unitDay.frota;
      terceiro += unitDay.terceiro;
      fob += unitDay.fob;
    });

    return {
      date,
      label: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
      frota,
      terceiro,
      fob,
      total: frota + terceiro + fob,
    };
  });

  const totals = units.reduce(
    (acc, item) => {
      acc.frota += item.frota;
      acc.transpredi += item.transpredi;
      acc.transprediContratado += item.transprediContratado;
      acc.terceiro += item.terceiro;
      acc.fob += item.fob;
      acc.own += item.own;
      acc.thirdParty += item.thirdParty;
      acc.total += item.total;
      acc.vehicles += item.vehicles;
      return acc;
    },
    {
      frota: 0,
      transpredi: 0,
      transprediContratado: 0,
      terceiro: 0,
      fob: 0,
      own: 0,
      thirdParty: 0,
      total: 0,
      vehicles: 0,
    }
  );

  return {
    currentMonth: {
      label: CURRENT_MONTH_LABEL,
      frota: totals.frota,
      transpredi: totals.transpredi,
      transprediContratado: totals.transprediContratado,
      terceiro: totals.terceiro,
      fob: totals.fob,
      own: totals.own,
      thirdParty: totals.thirdParty,
      total: totals.total,
      vehicles: totals.vehicles,
    },
    units,
    daily,
    dailyByUnit,
    groupVehicles: totals.vehicles,
  };
}

export function useProductivityWorkbook(): ProductivityWorkbookData {
  const [data, setData] = useState<ProductivityWorkbookData>({
    loading: true,
    months: [fallbackMay, fallbackJune, fallbackJuly, emptyMonth(CURRENT_MONTH_LABEL)],
    may: fallbackMay,
    june: fallbackJune,
    july: emptyMonth(CURRENT_MONTH_LABEL),
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
          throw new Error(`Não foi possível carregar ${PRODUCTIVITY_DATA_LABEL}.`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
        const { currentMonth, units, daily, dailyByUnit, groupVehicles } = readAugustWorkbook(workbook);

        if (currentMonth.total === 0 || !units.length || !daily.length) {
          throw new Error('O XLSX foi aberto, mas os dados de agosto não puderam ser calculados.');
        }

        setData({
          loading: false,
          months: [fallbackMay, fallbackJune, fallbackJuly, currentMonth],
          may: fallbackMay,
          june: fallbackJune,
          july: currentMonth,
          units,
          daily,
          dailyByUnit,
          groupVehicles,
          metaTerceiros: META_TERCEIROS,
          dataNotes: [],
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
