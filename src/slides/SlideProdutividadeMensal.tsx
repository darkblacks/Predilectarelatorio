import { motion } from 'framer-motion';
import { ChartPanel } from '../components/ui/ChartPanel';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import { MonthSummary } from './useProductivityWorkbook';

interface SlideProdutividadeMensalProps {
  months: MonthSummary[];
  groupVehicles: number;
}

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45 },
};

const ink = '#2e1a20';
const muted = '#7c6570';
const line = '#f1dce2';
const soft = '#fff1f4';
const blue = '#2563eb';
const red = '#da0d0d';
const orange = '#f59e0b';
const green = '#37a169';

const brNumber = new Intl.NumberFormat('pt-BR');
const dec1 = (value: number) => value.toFixed(1).replace('.', ',');
const signedDec1 = (value: number) => `${value >= 0 ? '+' : ''}${dec1(value)}`;
const pct = (value: number) => `${(value * 100).toFixed(1).replace('.', ',')}%`;
const signedPct = (value: number) => `${value >= 0 ? '+' : ''}${pct(value)}`;

export function SlideProdutividadeMensal({
  months,
  groupVehicles,
}: SlideProdutividadeMensalProps) {
  const rows = months.map((month) => ({
    month,
    vehicles: month.vehicles || groupVehicles,
    productivity: (month.vehicles || groupVehicles) > 0 ? month.own / (month.vehicles || groupVehicles) : 0,
  }));

  const first = rows[0];
  const current = rows[rows.length - 1];
  const previous = rows[rows.length - 2];
  const productivityGain = current && first ? current.productivity - first.productivity : 0;
  const productivityVariation = first?.productivity ? productivityGain / first.productivity : 0;
  const previousGain = current && previous ? current.productivity - previous.productivity : 0;
  const ownVolumeGain = current && first ? current.month.own - first.month.own : 0;

  const optionProductivity = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: Array<{ dataIndex?: number }>) => {
        const dataIndex = params?.[0]?.dataIndex ?? 0;
        const item = rows[dataIndex];
        if (!item) return '';

        return [
          `<strong>${item.month.label}</strong>`,
          `Produtividade: <strong>${dec1(item.productivity)} viagens/caminhão</strong>`,
          `Viagens próprias: <strong>${brNumber.format(item.month.own)}</strong>`,
          `Veículos: <strong>${brNumber.format(item.vehicles)}</strong>`,
        ].join('<br/>');
      },
    },
    grid: { left: 54, right: 28, top: 26, bottom: 42 },
    xAxis: {
      type: 'category',
      data: rows.map((item) => item.month.label),
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLabel: { formatter: (value: number) => dec1(value) },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [
      {
        name: 'Viagens por caminhão',
        type: 'line',
        smooth: true,
        symbolSize: 12,
        data: rows.map((item) => item.productivity),
        lineStyle: { color: blue, width: 5 },
        itemStyle: { color: blue },
        areaStyle: { color: 'rgba(37,99,235,.08)' },
        label: {
          show: true,
          position: 'top',
          formatter: (params: { value: number }) => dec1(Number(params.value)),
          color: ink,
          fontWeight: 900,
        },
      },
    ],
  };

  const optionVolume = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: number) => brNumber.format(value),
    },
    legend: { bottom: 0, textStyle: { color: muted, fontWeight: 700 } },
    grid: { left: 58, right: 18, top: 28, bottom: 54 },
    xAxis: {
      type: 'category',
      data: rows.map((item) => item.month.label),
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [
      {
        name: 'Viagens próprias',
        type: 'bar',
        data: rows.map((item) => item.month.own),
        itemStyle: { color: blue, borderRadius: [9, 9, 0, 0] },
      },
      {
        name: 'Demanda total',
        type: 'bar',
        data: rows.map((item) => item.month.total),
        itemStyle: { color: orange, borderRadius: [9, 9, 0, 0] },
      },
    ],
  };

  return (
    <SlideWrapper
      eyebrow="Resultado"
      title="Evolução de produtividade por caminhão"
      subtitle="A métrica central passa a ser viagens próprias por caminhão no mês, não a meta isolada de terceiros."
      footer="Produtividade = viagens próprias ÷ veículos de distribuição"
    >
      <div className="story-page">
        <motion.section className="story-section" {...reveal}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr .85fr', gap: 18, alignItems: 'stretch' }}>
            <ChartPanel
              title="Viagens por caminhão/mês"
              subtitle="Evolução mensal da produtividade dos veículos de distribuição."
              option={optionProductivity}
              height={430}
            />

            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 28, padding: 22, boxShadow: '0 16px 48px rgba(129,0,27,.08)' }}>
                <span style={{ color: muted, fontWeight: 900, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  Resultado atual
                </span>
                <strong style={{ display: 'block', color: blue, fontSize: 58, lineHeight: 1, marginTop: 10, letterSpacing: '-0.07em' }}>
                  {dec1(current?.productivity ?? 0)}
                </strong>
                <small style={{ color: muted, fontWeight: 780 }}>viagens próprias por caminhão em {current?.month.label}</small>
              </div>

              <div style={{ background: soft, border: `1px solid ${line}`, borderRadius: 28, padding: 22 }}>
                <strong style={{ color: ink, fontSize: 24, letterSpacing: '-0.04em' }}>
                  Ganho acumulado: {signedDec1(productivityGain)} viagens/caminhão
                </strong>
                <p style={{ color: muted, fontWeight: 750, lineHeight: 1.45, margin: '9px 0 0' }}>
                  Comparando {first?.month.label} com {current?.month.label}, a produtividade subiu {signedPct(productivityVariation)}.
                  Isso representa {brNumber.format(ownVolumeGain)} viagens próprias a mais no mês, considerando a base de veículos informada em cada período.
                </p>
              </div>

              <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 28, padding: 22 }}>
                <span style={{ color: muted, fontWeight: 900, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  Última variação
                </span>
                <strong style={{ display: 'block', color: previousGain >= 0 ? green : red, fontSize: 34, marginTop: 8 }}>
                  {signedDec1(previousGain)} viagens/caminhão
                </strong>
                <small style={{ color: muted, fontWeight: 780 }}>
                  {previous?.month.label} → {current?.month.label}
                </small>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div className="charts-grid charts-grid--two">
            <ChartPanel
              title="Volume que sustenta a produtividade"
              subtitle="Mostra se o ganho veio acompanhado de mais viagens próprias."
              option={optionVolume}
              height={360}
            />

            <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 30, padding: 22, boxShadow: '0 16px 48px rgba(129,0,27,.08)' }}>
              <span className="pill">Leitura executiva</span>
              <h2 style={{ color: ink, margin: '14px 0 8px', fontSize: 30, letterSpacing: '-0.05em' }}>
                A frota precisa mostrar evolução por ativo.
              </h2>
              <p style={{ color: muted, fontWeight: 760, lineHeight: 1.5, margin: 0 }}>
                A discussão deixa de ser apenas “bater 25% de terceiros” e passa a medir se cada caminhão está entregando mais viagens por mês.
                Terceiros continuam relevantes, mas entram como consequência da capacidade, dos picos e do ciclo operacional.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </SlideWrapper>
  );
}
