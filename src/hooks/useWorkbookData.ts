import { useCallback, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { DailyRow, MonthlyRow, Transportadora, TruckRow, WorkbookData } from '../types';

const DATA_URL = './data/predilecta_banco_dados_com_caminhoes.xlsx';
const META_TERCEIROS = 0.25;

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;

  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    return new Date(parsed.y, parsed.m - 1, parsed.d);
  }

  if (typeof value === 'string') {
    const clean = value.trim();
    const br = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (br) return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));

    const iso = new Date(clean);
    if (!Number.isNaN(iso.getTime())) return iso;
  }

  return new Date(Number.NaN);
}

function num(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.replace('%', '').replace(',', '.').trim();
    const parsed = Number(normalized);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

function text(value: unknown): string {
  return String(value ?? '').trim();
}

function normalizeHeader(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function findValue(row: Record<string, unknown>, names: string[]): unknown {
  const entries = Object.entries(row);
  for (const name of names) {
    const wanted = normalizeHeader(name);
    const found = entries.find(([key]) => normalizeHeader(key) === wanted);
    if (found) return found[1];
  }
  return undefined;
}

function normalizeTransportadora(value: unknown): Transportadora | undefined {
  const clean = text(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (clean.includes('transpredi')) return 'Transpredi';
  if (clean.includes('terceir')) return 'Terceiro';
  if (clean === 'fob' || clean.includes('cliente retira')) return 'FOB';
  if (clean.includes('frota')) return 'Frota';
  return undefined;
}

function parseMonthly(workbook: XLSX.WorkBook): MonthlyRow[] {
  const sheet = workbook.Sheets.Resultado;
  if (!sheet) return [];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    raw: true,
    defval: '',
  });

  const parsedRows = rows
    .map((row) => ({
      mes: toDate(findValue(row, ['Mês', 'Mes', 'Data'])),
      transportadora: normalizeTransportadora(findValue(row, ['Transportadora', 'Modalidade'])),
      cliente: text(findValue(row, ['Cliente', 'Empresa', 'Filial'])),
      qtd: num(findValue(row, ['QTD de transportes', 'Quantidade', 'Qtd'])),
    }))
    .filter(
      (row) =>
        !Number.isNaN(row.mes.getTime()) && Boolean(row.cliente) && Boolean(row.transportadora),
    );

  return parsedRows as MonthlyRow[];
}

function parseTrucks(workbook: XLSX.WorkBook): TruckRow[] {
  const sheet = workbook.Sheets.Caminhoes;
  if (!sheet) return [];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    raw: true,
    defval: '',
  });

  return rows
    .map((row) => ({
      placa: text(findValue(row, ['Placa'])),
      chassi: text(findValue(row, ['Chassi'])),
      renavam: text(findValue(row, ['Renavam'])),
      empresaBase: text(findValue(row, ['Empresa base'])),
      clienteDashboard: text(findValue(row, ['Cliente dashboard', 'Cliente'])),
      modelo: text(findValue(row, ['Modelo'])),
      ano: text(findValue(row, ['Ano'])),
      categoria: text(findValue(row, ['Categoria'])),
      contaComoCaminhao: num(findValue(row, ['Conta como caminhão', 'Conta como caminhao'])),
    }))
    .filter((row) => row.placa && row.clienteDashboard);
}

function parseDaily(workbook: XLSX.WorkBook): DailyRow[] {
  const sheet = workbook.Sheets['Evolução'] ?? workbook.Sheets.Evolucao;
  if (!sheet) return [];

  const launches = XLSX.utils
    .sheet_to_json<Record<string, unknown>>(sheet, { raw: true, defval: '' })
    .map((row) => ({
      data: toDate(findValue(row, ['Data', 'Dia'])),
      transportadora: normalizeTransportadora(findValue(row, ['Transportadora', 'Modalidade'])),
      cliente: text(findValue(row, ['Cliente', 'Empresa', 'Filial'])) || 'Predilecta',
      qtd: num(findValue(row, ['QTD de transportes', 'Quantidade', 'Qtd'])),
    }))
    .filter(
      (row) =>
        !Number.isNaN(row.data.getTime()) && Boolean(row.transportadora) && row.qtd >= 0,
    ) as Array<{
      data: Date;
      transportadora: Transportadora;
      cliente: string;
      qtd: number;
    }>;

  const dailyMap = new Map<string, DailyRow>();

  launches.forEach((launch) => {
    const key = `${launch.data.getFullYear()}-${String(launch.data.getMonth() + 1).padStart(2, '0')}-${String(launch.data.getDate()).padStart(2, '0')}`;

    if (!dailyMap.has(key)) {
      dailyMap.set(key, {
        data: new Date(launch.data.getFullYear(), launch.data.getMonth(), launch.data.getDate()),
        cliente: launch.cliente,
        frota: 0,
        transpredi: 0,
        proprio: 0,
        terceiro: 0,
        fob: 0,
        total: 0,
        shareFrotaDia: 0,
        shareTransprediDia: 0,
        shareProprioDia: 0,
        shareTerceiroDia: 0,
        shareFobDia: 0,
        shareTerceiroAcumulado: 0,
      });
    }

    const item = dailyMap.get(key)!;
    if (launch.transportadora === 'Frota') item.frota += launch.qtd;
    if (launch.transportadora === 'Transpredi') item.transpredi += launch.qtd;
    if (launch.transportadora === 'Terceiro') item.terceiro += launch.qtd;
    if (launch.transportadora === 'FOB') item.fob += launch.qtd;
  });

  const ordered = Array.from(dailyMap.values()).sort(
    (a, b) => a.data.getTime() - b.data.getTime(),
  );

  let activeMonth = '';
  let accumulatedTotal = 0;
  let accumulatedThirdParty = 0;

  return ordered.map((row) => {
    const rowMonth = `${row.data.getFullYear()}-${row.data.getMonth() + 1}`;
    if (rowMonth !== activeMonth) {
      activeMonth = rowMonth;
      accumulatedTotal = 0;
      accumulatedThirdParty = 0;
    }

    const proprio = row.frota + row.transpredi;
    const total = proprio + row.terceiro + row.fob;
    accumulatedTotal += total;
    accumulatedThirdParty += row.terceiro;

    return {
      ...row,
      proprio,
      total,
      shareFrotaDia: total === 0 ? 0 : row.frota / total,
      shareTransprediDia: total === 0 ? 0 : row.transpredi / total,
      shareProprioDia: total === 0 ? 0 : proprio / total,
      shareTerceiroDia: total === 0 ? 0 : row.terceiro / total,
      shareFobDia: total === 0 ? 0 : row.fob / total,
      shareTerceiroAcumulado:
        accumulatedTotal === 0 ? 0 : accumulatedThirdParty / accumulatedTotal,
    };
  });
}

function parseWorkbook(arrayBuffer: ArrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const monthly = parseMonthly(workbook);
  const daily = parseDaily(workbook);
  const trucks = parseTrucks(workbook);

  if (!monthly.length) {
    throw new Error('A aba Resultado não contém dados mensais no padrão esperado.');
  }

  return { monthly, daily, trucks };
}

export function useWorkbookData(): WorkbookData {
  const [data, setData] = useState<Omit<WorkbookData, 'loadLocalFile'>>({
    loading: true,
    monthly: [],
    daily: [],
    trucks: [],
    metaTerceiros: META_TERCEIROS,
    sourceName: 'predilecta_banco_dados_com_caminhoes.xlsx',
  });

  const loadLocalFile = useCallback(async (file: File) => {
    try {
      setData((current) => ({ ...current, loading: true, error: undefined }));
      const parsed = parseWorkbook(await file.arrayBuffer());
      setData({
        loading: false,
        ...parsed,
        metaTerceiros: META_TERCEIROS,
        sourceName: file.name,
      });
    } catch (error) {
      setData((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro inesperado ao ler os dados.',
      }));
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${DATA_URL}?v=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Não foi possível carregar o arquivo XLSX.');
        const parsed = parseWorkbook(await response.arrayBuffer());
        setData({
          loading: false,
          ...parsed,
          metaTerceiros: META_TERCEIROS,
          sourceName: 'predilecta_banco_dados_com_caminhoes.xlsx',
        });
      } catch (error) {
        setData((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro inesperado ao ler os dados.',
        }));
      }
    }

    load();
  }, []);

  return { ...data, loadLocalFile };
}
