import { motion } from 'framer-motion';
import { ChartPanel } from '../components/ui/ChartPanel';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import {
  MonthSummary,
  executiveOwnVolume,
  executiveThirdPartyVolume,
} from './useProductivityWorkbook';

interface SlideJunhoJulhoProps {
  june: MonthSummary;
  july: MonthSummary;
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

const share = (value: number, total: number) => (total ? value / total : 0);
const variation = (from: number, to: number) => (from ? (to - from) / from : 0);
const pct = (value: number) => `${(value * 100).toFixed(1).replace('.', ',')}%`;
const signedPct = (value: number) => `${value >= 0 ? '+' : ''}${pct(value)}`;
const signedPp = (value: number) => `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1).replace('.', ',')} p.p.`;
const br = (value: number) => value.toLocaleString('pt-BR');

export function SlideJunhoJulho({ june, july }: SlideJunhoJulhoProps) {
  const juneOwn = executiveOwnVolume(june, 'june');
  const julyOwn = executiveOwnVolume(july, 'july');
  const juneThird = executiveThirdPartyVolume(june, 'june');
  const julyThird = executiveThirdPartyVolume(july, 'july');

  const demandVariation = variation(june.total, july.total);
  const ownVariation = variation(juneOwn, julyOwn);
  const thirdVariation = variation(juneThird, julyThird);

  // O indicador Próprio x Terceiro usa somente essas duas categorias,
  // conforme a aba Comparativo Jun x Jul.
  const comparableJune = juneOwn + juneThird;
  const comparableJuly = julyOwn + julyThird;
  const ownShareJune = share(juneOwn, comparableJune);
  const ownShareJuly = share(julyOwn, comparableJuly);
  const thirdShareJune = share(juneThird, comparableJune);
  const thirdShareJuly = share(julyThird, comparableJuly);

  const cards = [
    {
      label: 'Demanda total',
      value: `${br(june.total)} → ${br(july.total)}`,
      delta: signedPct(demandVariation),
      color: orange,
    },
    {
      label: 'Próprio',
      value: `${br(juneOwn)} → ${br(julyOwn)}`,
      delta: signedPct(ownVariation),
      color: ownVariation >= 0 ? green : red,
    },
    {
      label: 'Terceiro',
      value: `${br(juneThird)} → ${br(julyThird)}`,
      delta: signedPct(thirdVariation),
      color: thirdVariation <= 0 ? green : red,
    },
    {
      label: '% de Terceiro',
      value: `${pct(thirdShareJune)} → ${pct(thirdShareJuly)}`,
      delta: signedPp(thirdShareJuly - thirdShareJune),
      color: thirdShareJuly <= thirdShareJune ? green : red,
    },
  ];

  const optionVolumes = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0, textStyle: { color: muted, fontWeight: 700 } },
    grid: { left: 58, right: 18, top: 28, bottom: 54 },
    xAxis: {
      type: 'category',
      data: ['01–17 Jun/26', '01–17 Jul/26'],
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f3e2e6' } } },
    series: [
      {
        name: 'Demanda total',
        type: 'bar',
        data: [june.total, july.total],
        itemStyle: { color: orange, borderRadius: [9, 9, 0, 0] },
      },
      {
        name: 'Próprio',
        type: 'bar',
        data: [juneOwn, julyOwn],
        itemStyle: { color: blue, borderRadius: [9, 9, 0, 0] },
      },
      {
        name: 'Terceiro',
        type: 'bar',
        data: [juneThird, julyThird],
        itemStyle: { color: red, borderRadius: [9, 9, 0, 0] },
      },
    ],
  };

  const optionShares = {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => `${Number(value).toFixed(1).replace('.', ',')}%`,
    },
    legend: { bottom: 0, textStyle: { color: muted, fontWeight: 700 } },
    grid: { left: 52, right: 18, top: 28, bottom: 54 },
    xAxis: {
      type: 'category',
      data: ['01–17 Jun/26', '01–17 Jul/26'],
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
        data: [ownShareJune * 100, ownShareJuly * 100],
        lineStyle: { width: 4, color: blue },
        itemStyle: { color: blue },
        areaStyle: { color: 'rgba(37,99,235,.07)' },
      },
      {
        name: 'Terceiro',
        type: 'line',
        smooth: true,
        symbolSize: 10,
        data: [thirdShareJune * 100, thirdShareJuly * 100],
        lineStyle: { width: 4, color: red },
        itemStyle: { color: red },
        areaStyle: { color: 'rgba(218,13,13,.05)' },
      },
    ],
  };

  return (
    <SlideWrapper
      eyebrow="Junho × Julho"
      title="Comparativo no mesmo período"
      subtitle="Predilecta · comparação de 01 a 17 de junho com 01 a 17 de julho/26."
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
                <span style={{ color: muted, fontWeight: 900, textTransform: 'uppercase', fontSize: 11, letterSpacing: '.08em' }}>
                  {card.label}
                </span>
                <strong style={{ display: 'block', color: ink, fontSize: 27, marginTop: 9, letterSpacing: '-0.04em' }}>
                  {card.value}
                </strong>
                <span style={{ display: 'block', color: card.color, fontSize: 22, fontWeight: 950, marginTop: 7 }}>
                  {card.delta}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div style={{ padding: '24px 26px', borderRadius: 30, background: soft, border: `1px solid ${line}` }}>
            <strong style={{ color: ink, fontSize: 27, letterSpacing: '-0.04em' }}>
              No período comparável, a demanda passou de {br(june.total)} para {br(july.total)} viagens.
            </strong>
            <p style={{ color: muted, margin: '10px 0 0', fontWeight: 740, lineHeight: 1.45 }}>
              Próprio passou de {br(juneOwn)} para {br(julyOwn)} ({signedPct(ownVariation)}), enquanto Terceiro passou de {br(juneThird)} para {br(julyThird)} ({signedPct(thirdVariation)}). A participação de Terceiro foi de {pct(thirdShareJune)} para {pct(thirdShareJuly)} ({signedPp(thirdShareJuly - thirdShareJune)}).
            </p>
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div className="charts-grid charts-grid--two">
            <ChartPanel
              title="Volume de viagens · 01 a 17"
              subtitle="Demanda total, Próprio e Terceiro no mesmo recorte de dias."
              option={optionVolumes}
              height={360}
            />
            <ChartPanel
              title="Próprio x Terceiro"
              subtitle="Participação percentual entre Próprio e Terceiro no período comparável."
              option={optionShares}
              height={360}
            />
          </div>
        </motion.section>
      </div>
    </SlideWrapper>
  );
}
