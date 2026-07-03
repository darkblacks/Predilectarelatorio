export type Transportadora = 'Frota' | 'Transpredi' | 'Terceiro' | 'FOB';

export interface MonthlyRow {
  mes: Date;
  transportadora: Transportadora;
  cliente: string;
  qtd: number;
}

export interface DailyRow {
  data: Date;
  cliente: string;
  frota: number;
  transpredi: number;
  proprio: number;
  terceiro: number;
  fob: number;
  total: number;
  shareFrotaDia: number;
  shareTransprediDia: number;
  shareProprioDia: number;
  shareTerceiroDia: number;
  shareFobDia: number;
  shareTerceiroAcumulado: number;
}

export interface TruckRow {
  placa: string;
  chassi: string;
  renavam: string;
  empresaBase: string;
  clienteDashboard: string;
  modelo: string;
  ano: string;
  categoria: string;
  contaComoCaminhao: number;
}

export interface WorkbookData {
  loading: boolean;
  error?: string;
  monthly: MonthlyRow[];
  daily: DailyRow[];
  trucks: TruckRow[];
  metaTerceiros: number;
}

export interface MetricCardProps {
  label: string;
  value: string;
  helper?: string;
  tone?: 'good' | 'alert' | 'neutral' | 'brand';
}
