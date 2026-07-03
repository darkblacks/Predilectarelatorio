import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { DailyRow, FleetRow, MonthlyRow, Transportadora, WorkbookData } from '../types';

const DATA_URL = '/data/predilecta_banco_dados_frota.xlsx';
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
    const shortBr = clean.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (shortBr) return new Date(2026, Number(shortBr[2]) - 1, Number(shortBr[1]));
    const iso = new Date(clean);
    if (!Number.isNaN(iso.getTime())) return iso;
  }
  return new Date();
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

function parseMonthly(workbook: XLSX.WorkBook): MonthlyRow[] {
  const sheet = workbook.Sheets['Resultado'];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: true, defval: '' });
  return rows.map((row) => ({
    mes: toDate(row['Mês']),
    transportadora: text(row['Transportadora']) as Transportadora,
    cliente: text(row['Cliente']),
    qtd: num(row['QTD de transportes']),
  })).filter((row) => row.cliente && row.transportadora);
}

function parseFleet(workbook: XLSX.WorkBook): FleetRow[] {
  const sheet = workbook.Sheets['Frota'];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: true, defval: '' });
  return rows.map((row) => ({
    placa: text(row['Placa']),
    chassi: text(row['Chassi']),
    renavam: text(row['Renavam']),
    empresaBase: text(row['Empresa base']),
    clienteDashboard: text(row['Cliente dashboard']),
    modelo: text(row['Modelo']),
    ano: text(row['Ano']),
    tipoFrota: text(row['Tipo frota']),
    contaComoCaminhao: num(row['Conta como caminhão']),
  })).filter((row) => row.placa && row.clienteDashboard);
}

function parseDaily(workbook: XLSX.WorkBook): DailyRow[] {
  const sheet = workbook.Sheets['Evolução'];
  if (!sheet) return [];
  const launches = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: true, defval: '' })
    .map((row) => ({
      data: toDate(row.Data),
      transportadora: text(row.Transportadora) as Transportadora,
      cliente: text(row.Cliente) || 'Predilecta',
      qtd: num(row['QTD de transportes']),
    }))
    .filter((row) => row.transportadora && row.qtd >= 0);

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

  const ordered = Array.from(dailyMap.values()).sort((a, b) => a.data.getTime() - b.data.getTime());
  let acumuladoTotal = 0;
  let acumuladoTerceiro = 0;

  return ordered.map((row) => {
    const proprio = row.frota + row.transpredi;
    const total = proprio + row.terceiro + row.fob;
    acumuladoTotal += total;
    acumuladoTerceiro += row.terceiro;
    return {
      ...row,
      proprio,
      total,
      shareFrotaDia: total === 0 ? 0 : row.frota / total,
      shareTransprediDia: total === 0 ? 0 : row.transpredi / total,
      shareProprioDia: total === 0 ? 0 : proprio / total,
      shareTerceiroDia: total === 0 ? 0 : row.terceiro / total,
      shareFobDia: total === 0 ? 0 : row.fob / total,
      shareTerceiroAcumulado: acumuladoTotal === 0 ? 0 : acumuladoTerceiro / acumuladoTotal,
    };
  });
}

export function useWorkbookData(): WorkbookData {
  const [data, setData] = useState<WorkbookData>({
    loading: true,
    monthly: [],
    daily: [],
    fleet: [],
    metaTerceiros: META_TERCEIROS,
  });

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error('Não foi possível carregar o arquivo XLSX.');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
        setData({
          loading: false,
          monthly: parseMonthly(workbook),
          daily: parseDaily(workbook),
          fleet: parseFleet(workbook),
          metaTerceiros: META_TERCEIROS,
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

  return data;
}
