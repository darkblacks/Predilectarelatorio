import { DailyRow, FleetRow, MonthlyRow, Transportadora } from '../types';

export const brNumber = new Intl.NumberFormat('pt-BR');
export const brPercent = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1, minimumFractionDigits: 1 });
export const brPercent0 = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 0, minimumFractionDigits: 0 });

export function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\+/g, '').replace(/[´'`]/g, '').trim().toLowerCase();
}

export function displayCompany(value: string): string {
  const clean = normalize(value);
  if (clean === 'sofruta' || clean === 'so fruta') return 'SóFruta';
  if (clean === 'stella' || clean === 'stelladoro' || clean === 'stella doro') return 'StellaDóro';
  if (clean === 'minas' || clean === 'minas mais' || clean === 'mm  gessi' || clean === 'mm gessi') return 'Minas+';
  if (clean === 'goias') return 'Goiás';
  if (clean === 'nordeste mais') return 'Nordeste';
  return value.trim();
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(mesKey: string): string {
  const [year, month] = mesKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: '2-digit' }).replace('.', '');
}

export function getMonthKeys(rows: MonthlyRow[]): string[] {
  return Array.from(new Set(rows.map((row) => monthKey(row.mes)))).sort();
}

export function sumRows(rows: MonthlyRow[], filter?: Partial<{ mesKey: string; cliente: string; transportadora: Transportadora }>): number {
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

export function transportadoraTotals(rows: MonthlyRow[], mesKey: string): Record<Transportadora, number> {
  return {
    Frota: sumRows(rows, { mesKey, transportadora: 'Frota' }),
    Transpredi: sumRows(rows, { mesKey, transportadora: 'Transpredi' }),
    Terceiro: sumRows(rows, { mesKey, transportadora: 'Terceiro' }),
    FOB: sumRows(rows, { mesKey, transportadora: 'FOB' }),
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
  const proprio = frota + transpredi;
  const total = proprio + terceiro + fob;
  return { frota, transpredi, terceiro, fob, proprio, total };
}

export function dayLabel(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function totalDaily(rows: DailyRow[]) {
  return rows.reduce((acc, row) => {
    acc.frota += row.frota;
    acc.transpredi += row.transpredi;
    acc.proprio += row.proprio;
    acc.terceiro += row.terceiro;
    acc.fob += row.fob;
    acc.total += row.total;
    return acc;
  }, { frota: 0, transpredi: 0, proprio: 0, terceiro: 0, fob: 0, total: 0 });
}

export function peakDaily(rows: DailyRow[], key: keyof Pick<DailyRow, 'proprio' | 'terceiro' | 'total'>): DailyRow | undefined {
  return [...rows].sort((a, b) => (b[key] as number) - (a[key] as number))[0];
}

export function fleetCountByCompany(fleet: FleetRow[], company: string): number {
  return fleet
    .filter((item) => item.contaComoCaminhao === 1)
    .filter((item) => normalize(item.clienteDashboard) === normalize(company))
    .length;
}

export function fleetTotalForCompanies(fleet: FleetRow[], companies: string[]): number {
  const keys = new Set(companies.map((company) => normalize(company)));
  return fleet
    .filter((item) => item.contaComoCaminhao === 1)
    .filter((item) => keys.has(normalize(item.clienteDashboard)))
    .length;
}
