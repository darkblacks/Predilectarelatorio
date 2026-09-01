import { motion } from 'framer-motion';
import { ChartPanel } from '../components/ui/ChartPanel';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import { MonthSummary } from './useProductivityWorkbook';

interface SlideEvolucaoMensalProps {
  months: MonthSummary[];
}

const reveal = {
  initial: { opacity: 0, y: 26 },
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
const brDecimal = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pct = (value: number) => `${(value * 100).toFixed(1).replace('.', ',')}%`;
const signedPct = (value: number) => `${value >= 0 ? '+' : ''}${pct(value)}`;
const share = (value: number, total: number) => (total ? value / total : 0);
const variation = (from: number, to: number) => (from ? (to - from) / from : 0);

export function SlideEvolucaoMensal({ months }: SlideEvolucaoMensalProps) {
  const rows = months.map((month) => {
    const operatingBase = month.own + month.thirdParty;
    const productivity = month.vehicles > 0 ? month.own / month.vehicles : 0;

    return {
      ...month,
      operatingBase,
      ownShare: share(month.own, operatingBase),
      thirdPartyShare: share(month.thirdParty, operatingBase),
      fobShare: share(month.fob, month.total),
      productivity,
    };
  });

  const first = rows[0];
  const current = rows[rows.length - 1];
  const previous = rows[rows.length - 2];
  const monthLabels = rows.map((item) => item.label);
  const productivityGain = current && first ? current.productivity - first.productivity : 0;
  const lastProductivityGain = current && previous ? current.productivity - previous.productivity : 0;
  const ownShareGain = current && first ? current.ownShare - first.ownShare : 0;
  const thirdPartyChange = current && first ? current.thirdPartyShare - first.thirdPartyShare : 0;
  const demandChange = current && first ? variation(first.total, current.total) : 0;

  const cards = [
    {
      label: 'Total',
      value: current ? brNumber.format(current.total) : '0',
      detail: `Variação vs. ${first?.label}: ${signedPct(demandChange)}`,
      color: orange,
    },
    {
      label: 'Frota própria',
      value: current ? pct(current.ownShare) : '0,0%',
      detail: `Ganho desde ${first?.label}: ${signedPct(ownShareGain)}`,
      color: blue,
    },
    {
      label: 'Terceiro',
      value: current ? pct(current.thirdPartyShare) : '0,0%',
      detail: `Mudança desde ${first?.label}: ${signedPct(thirdPartyChange)}`,
      color: thirdPartyChange <= 0 ? green : red,
    },
    {
      label: 'Viagens/veículo',
      value: current ? brDecimal.format(current.productivity) : '0,00',
      detail: `Última variação: ${lastProductivityGain >= 0 ? '+' : ''}${brDecimal.format(lastProductivityGain)}`,
      color: green,
    },
  ];

  const optionVolumes = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: number) => brNumber.format(value),
    },
    legend: { bottom: 0, textStyle: { color: muted, fontWeight: 700 } },
    grid: { left: 58, right: 18, top: 28, bottom: 54 },
    xAxis: {
      type: 'category',
      data: monthLabels,
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [
      {
        name: 'Total',
        type: 'bar',
        data: rows.map((item) => item.total),
        itemStyle: { color: orange, borderRadius: [9, 9, 0, 0] },
      },
      {
        name: 'Próprio',
        type: 'bar',
        data: rows.map((item) => item.own),
        itemStyle: { color: blue, borderRadius: [9, 9, 0, 0] },
      },
      {
        name: 'Terceiro',
        type: 'bar',
        data: rows.map((item) => item.thirdParty),
        itemStyle: { color: red, borderRadius: [9, 9, 0, 0] },
      },
    ],
  };

  const optionShares = {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => `${Number(value).toFixed(1).replace('.', ',')}%`,
    },
    legend: {
      bottom: 0,
      selected: { FOB: false },
      textStyle: { color: muted, fontWeight: 700 },
    },
    grid: { left: 52, right: 18, top: 28, bottom: 54 },
    xAxis: {
      type: 'category',
      data: monthLabels,
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [
      {
        name: 'Próprio',
        type: 'line',
        smooth: true,
        symbolSize: 10,
        data: rows.map((item) => item.ownShare * 100),
        custom: { recalculatePercent: true, rawValues: rows.map((item) => item.own) },
        lineStyle: { width: 4, color: blue },
        itemStyle: { color: blue },
        areaStyle: { color: 'rgba(37,99,235,.07)' },
      },
      {
        name: 'Terceiro',
        type: 'line',
        smooth: true,
        symbolSize: 10,
        data: rows.map((item) => item.thirdPartyShare * 100),
        custom: { recalculatePercent: true, rawValues: rows.map((item) => item.thirdParty) },
        lineStyle: { width: 4, color: red },
        itemStyle: { color: red },
        areaStyle: { color: 'rgba(218,13,13,.05)' },
      },
      {
        name: 'FOB',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        data: rows.map((item) => item.fobShare * 100),
        custom: { recalculatePercent: true, rawValues: rows.map((item) => item.fob) },
        lineStyle: { width: 3, color: orange },
        itemStyle: { color: orange },
      },
    ],
  };

  return (
    <SlideWrapper
      eyebrow="Evolução mensal"
      title="Resultado mês a mês"
      subtitle="Própria e Terceiro em base sem FOB; FOB acompanhado separado para não distorcer a produtividade."
      footer={`Dashboard Operacional Predilecta · ${current?.label ?? ''}`}
    >
      <div className="story-page">
        <motion.section className="story-section" {...reveal}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
            {cards.map((card) => (
              <div
                key={card.label}
                style={{
                  background: '#fff',
                  border: `1px solid ${line}`,
                  borderRadius: 26,
                  padding: 20,
                  boxShadow: '0 14px 42px rgba(129,0,27,.08)',
                }}
              >
                <span
                  style={{
                    color: muted,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    fontSize: 11,
                    letterSpacing: '.08em',
                  }}
                >
                  {card.label}
                </span>

                <strong
                  style={{
                    display: 'block',
                    color: card.color,
                    fontSize: 34,
                    marginTop: 9,
                    letterSpacing: '-0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {card.value}
                </strong>

                <small style={{ color: muted, fontWeight: 780 }}>
                  {card.detail}
                </small>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div className="charts-grid charts-grid--two">
            <ChartPanel
              title="Volume mensal"
              subtitle={`${first?.label} a ${current?.label}: total, própria e terceiros.`}
              option={optionVolumes}
              height={350}
            />
            <ChartPanel
              title="Participação correta"
              subtitle="FOB inicia desmarcado; ao alternar a legenda, os percentuais recalculam pela base visível."
              option={optionShares}
              height={350}
            />
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 30, padding: 20, boxShadow: '0 16px 48px rgba(129,0,27,.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr .8fr .8fr .7fr .8fr', gap: 10, color: muted, fontWeight: 900, fontSize: 12, textTransform: 'uppercase' }}>
              <span>Mês</span>
              <span>Total</span>
              <span>% Própria</span>
              <span>% FOB</span>
              <span>Viagens/veículo</span>
            </div>

            <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              {rows.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr .8fr .8fr .7fr .8fr',
                    gap: 10,
                    alignItems: 'center',
                    borderTop: `1px solid ${line}`,
                    paddingTop: 8,
                    color: ink,
                    fontWeight: 850,
                  }}
                >
                  <span>{item.label}</span>
                  <span>{brNumber.format(item.total)}</span>
                  <span>{pct(item.ownShare)}</span>
                  <span>{pct(item.fobShare)}</span>
                  <span>{brDecimal.format(item.productivity)}</span>
                </div>
              ))}
            </div>

            <p style={{ color: muted, fontWeight: 740, lineHeight: 1.45, margin: '14px 0 0' }}>
              Regra aplicada: Própria = Frota + Transpredi próprio; Terceiro = Transpredi contratado + Terceiros; participação própria/terceiro usa base sem FOB.
            </p>
          </div>
        </motion.section>
      </div>
    </SlideWrapper>
  );
}
