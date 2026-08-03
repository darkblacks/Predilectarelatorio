import { DailyRow, MonthlyRow, Transportadora, TruckRow } from '../types';

export const brNumber = new Intl.NumberFormat('pt-BR');
export const brPercent = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});
export const brPercent0 = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** A partir de julho/2026, Transpredi passa a compor o grupo Terceiros. */
export const TRANSPREDI_EM_TERCEIROS_DESDE = '2026-07';

export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\+/g, '')
    .replace(/[´'`]/g, '')
    .trim()
    .toLowerCase();
}

export function displayCompany(value: string): string {
  const clean = normalize(value);
  if (clean === 'sofruta' || clean === 'so fruta') return 'SóFruta';
  if (clean === 'stella' || clean === 'stelladoro' || clean === 'stella doro') return 'StellaDóro';
  if (clean === 'minas' || clean === 'minas mais' || clean === 'mm  gessi') return 'Minas+';
  if (clean === 'goias') return 'Goiás';
  if (clean === 'nordeste mais') return 'Nordeste';
  return value.trim();
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: '2-digit' })
    .replace('.', '');
}

export function monthLabelTitle(key: string): string {
  const label = monthLabel(key);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function monthShortLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    .replace('.', '');
}

export function getMonthKeys(rows: MonthlyRow[]): string[] {
  return Array.from(new Set(rows.map((row) => monthKey(row.mes)))).sort();
}

export function previousMonthKey(keys: string[], current: string): string | undefined {
  const index = keys.indexOf(current);
  return index > 0 ? keys[index - 1] : undefined;
}

export function transprediContaComoTerceiro(mesKey: string): boolean {
  return mesKey >= TRANSPREDI_EM_TERCEIROS_DESDE;
}

export function sumRows(
  rows: MonthlyRow[],
  filter?: Partial<{ mesKey: string; cliente: string; transportadora: Transportadora }>,
): number {
  return rows
    .filter((row) => !filter?.mesKey || monthKey(row.mes) === filter.mesKey)
    .filter((row) => !filter?.cliente || normalize(row.cliente) === normalize(filter.cliente))
    .filter((row) => !filter?.transportadora || row.transportadora === filter.transportadora)
    .reduce((total, row) => total + row.qtd, 0);
}

export function totalByMonth(rows: MonthlyRow[], mesKey: string): number {
  return sumRows(rows, { mesKey });
}

export function share(value: number, total: number): number {
  return total === 0 ? 0 : value / total;
}

export function transportadoraTotals(
  rows: MonthlyRow[],
  mesKey: string,
): Record<Transportadora, number> {
  return {
    Frota: sumRows(rows, { mesKey, transportadora: 'Frota' }),
    Transpredi: sumRows(rows, { mesKey, transportadora: 'Transpredi' }),
    Terceiro: sumRows(rows, { mesKey, transportadora: 'Terceiro' }),
    FOB: sumRows(rows, { mesKey, transportadora: 'FOB' }),
  };
}

export function operationalTotals(rows: MonthlyRow[], mesKey: string) {
  const raw = transportadoraTotals(rows, mesKey);
  const transprediEmTerceiros = transprediContaComoTerceiro(mesKey);
  const frotaOperacional = raw.Frota + (transprediEmTerceiros ? 0 : raw.Transpredi);
  const terceirosOperacional = raw.Terceiro + (transprediEmTerceiros ? raw.Transpredi : 0);
  const baseOperacional = frotaOperacional + terceirosOperacional;
  const totalGeral = baseOperacional + raw.FOB;

  return {
    ...raw,
    frotaOperacional,
    terceirosOperacional,
    baseOperacional,
    totalGeral,
    transprediEmTerceiros,
  };
}

export function companiesForMonth(rows: MonthlyRow[], mesKey: string): string[] {
  const map = new Map<string, string>();
  rows
    .filter((row) => monthKey(row.mes) === mesKey)
    .forEach((row) => {
      const key = normalize(row.cliente);
      if (!map.has(key)) map.set(key, displayCompany(row.cliente));
    });
  return Array.from(map.values());
}

export function companyMonthTotals(rows: MonthlyRow[], mesKey: string, company: string) {
  const frota = sumRows(rows, { mesKey, cliente: company, transportadora: 'Frota' });
  const transpredi = sumRows(rows, { mesKey, cliente: company, transportadora: 'Transpredi' });
  const terceiro = sumRows(rows, { mesKey, cliente: company, transportadora: 'Terceiro' });
  const fob = sumRows(rows, { mesKey, cliente: company, transportadora: 'FOB' });
  const transprediEmTerceiros = transprediContaComoTerceiro(mesKey);
  const frotaOperacional = frota + (transprediEmTerceiros ? 0 : transpredi);
  const terceirosOperacional = terceiro + (transprediEmTerceiros ? transpredi : 0);
  const baseOperacional = frotaOperacional + terceirosOperacional;
  const total = baseOperacional + fob;

  return {
    frota,
    transpredi,
    terceiro,
    fob,
    frotaOperacional,
    terceirosOperacional,
    baseOperacional,
    total,
    transprediEmTerceiros,
  };
}

export function dayLabel(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function filterDailyByMonth(rows: DailyRow[], selectedMonth: string): DailyRow[] {
  return rows.filter((row) => monthKey(row.data) === selectedMonth);
}

export function totalDaily(rows: DailyRow[]) {
  return rows.reduce(
    (acc, row) => {
      acc.frota += row.frota;
      acc.transpredi += row.transpredi;
      acc.terceiro += row.terceiro;
      acc.fob += row.fob;
      acc.frotaOperacional += row.frotaOperacional;
      acc.terceirosOperacional += row.terceirosOperacional;
      acc.baseOperacional += row.baseOperacional;
      acc.total += row.total;
      return acc;
    },
    {
      frota: 0,
      transpredi: 0,
      terceiro: 0,
      fob: 0,
      frotaOperacional: 0,
      terceirosOperacional: 0,
      baseOperacional: 0,
      total: 0,
    },
  );
}

export function peakDaily(
  rows: DailyRow[],
  key: keyof Pick<DailyRow, 'frotaOperacional' | 'terceirosOperacional' | 'baseOperacional' | 'total'>,
): DailyRow | undefined {
  return [...rows].sort((a, b) => b[key] - a[key])[0];
}

export function truckCountByCompany(trucks: TruckRow[], company: string): number {
  return trucks
    .filter((truck) => truck.contaComoCaminhao === 1)
    .filter((truck) => normalize(truck.clienteDashboard) === normalize(company)).length;
}
