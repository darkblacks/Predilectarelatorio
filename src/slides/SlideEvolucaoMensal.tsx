import { motion } from 'framer-motion';
import { ChartPanel } from '../components/ui/ChartPanel';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import {
  executiveOwnVolume,
  executiveThirdPartyVolume,
  MonthSummary,
} from './useProductivityWorkbook';

interface SlideEvolucaoMensalProps {
  may: MonthSummary;
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

const pct = (value: number) => `${(value * 100).toFixed(1).replace('.', ',')}%`;
const signedPct = (value: number) => `${value >= 0 ? '+' : ''}${pct(value)}`;
const share = (value: number, total: number) => (total ? value / total : 0);
const variation = (from: number, to: number) => (from ? (to - from) / from : 0);
const br = (value: number) => value.toLocaleString('pt-BR');

export function SlideEvolucaoMensal({ may, june, july }: SlideEvolucaoMensalProps) {
  const mayOwn = executiveOwnVolume(may, 'may');
  const juneOwn = executiveOwnVolume(june, 'june');
  const julyOwn = executiveOwnVolume(july, 'july');

  const mayThirdParty = executiveThirdPartyVolume(may, 'may');
  const juneThirdParty = executiveThirdPartyVolume(june, 'june');
  const julyThirdParty = executiveThirdPartyVolume(july, 'july');

  const cards = [
    {
      label: 'Demanda total',
      values: [may.total, june.total, july.total],
      mayJune: variation(may.total, june.total),
      juneJuly: variation(june.total, july.total),
      positiveIsGood: null as boolean | null,
    },
    {
      label: 'Viagens da Frota',
      values: [may.frota, june.frota, july.frota],
      mayJune: variation(may.frota, june.frota),
      juneJuly: variation(june.frota, july.frota),
      positiveIsGood: true,
    },
    {
      label: 'Próprio',
      values: [mayOwn, juneOwn, julyOwn],
      mayJune: variation(mayOwn, juneOwn),
      juneJuly: variation(juneOwn, julyOwn),
      positiveIsGood: true,
    },
    {
      label: 'Terceiro',
      values: [mayThirdParty, juneThirdParty, julyThirdParty],
      mayJune: variation(mayThirdParty, juneThirdParty),
      juneJuly: variation(juneThirdParty, julyThirdParty),
      positiveIsGood: false,
    },
  ];

  const cardDeltaColor = (value: number, positiveIsGood: boolean | null) => {
    if (positiveIsGood === null) return orange;
    const good = positiveIsGood ? value >= 0 : value <= 0;
    return good ? green : red;
  };

  const monthLabels = ['Maio/26', 'Junho/26', 'Julho/26'];

  const optionVolumes = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
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
        name: 'Demanda total',
        type: 'bar',
        data: [may.total, june.total, july.total],
        itemStyle: { color: orange, borderRadius: [9, 9, 0, 0] },
      },
      {
        name: 'Próprio',
        type: 'bar',
        data: [mayOwn, juneOwn, julyOwn],
        itemStyle: { color: blue, borderRadius: [9, 9, 0, 0] },
      },
      {
        name: 'Terceiro',
        type: 'bar',
        data: [mayThirdParty, juneThirdParty, julyThirdParty],
        itemStyle: { color: red, borderRadius: [9, 9, 0, 0] },
      },
    ],
  };

  const optionShares = {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => `${value.toFixed(1).replace('.', ',')}%`,
    },
    legend: { bottom: 0, textStyle: { color: muted, fontWeight: 700 } },
    grid: { left: 52, right: 18, top: 28, bottom: 54 },
    xAxis: {
      type: 'category',
      data: monthLabels,
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 70,
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [
      {
        name: 'Próprio',
        type: 'line',
        smooth: true,
        symbolSize: 10,
        data: [share(mayOwn, may.total) * 100, share(juneOwn, june.total) * 100, share(julyOwn, july.total) * 100],
        lineStyle: { width: 4, color: blue },
        itemStyle: { color: blue },
        areaStyle: { color: 'rgba(37,99,235,.07)' },
      },
      {
        name: 'Terceiro',
        type: 'line',
        smooth: true,
        symbolSize: 10,
        data: [
          share(mayThirdParty, may.total) * 100,
          share(juneThirdParty, june.total) * 100,
          share(julyThirdParty, july.total) * 100,
        ],
        lineStyle: { width: 4, color: red },
        itemStyle: { color: red },
        areaStyle: { color: 'rgba(218,13,13,.05)' },
      },
      {
        name: 'FOB',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        data: [share(may.fob, may.total) * 100, share(june.fob, june.total) * 100, share(july.fob, july.total) * 100],
        lineStyle: { width: 3, color: orange },
        itemStyle: { color: orange },
      },
    ],
  };

  const demandMayJune = variation(may.total, june.total);
  const demandJuneJuly = variation(june.total, july.total);
  const ownMayJune = variation(mayOwn, juneOwn);
  const ownJuneJuly = variation(juneOwn, julyOwn);
  const thirdMayJune = variation(mayThirdParty, juneThirdParty);
  const thirdJuneJuly = variation(juneThirdParty, julyThirdParty);

  return (
    <SlideWrapper
      eyebrow="Evolução mensal"
      title="Evolução mensal da operação"
      subtitle="Maio → Junho → Julho/2026, acompanhando demanda, produção própria e Terceiros."
      footer="Dashboard Operacional Predilecta · Julho/2026"
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
                    color: ink,
                    fontSize: 24,
                    marginTop: 9,
                    letterSpacing: '-0.04em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {br(card.values[0])} → {br(card.values[1])} → {br(card.values[2])}
                </strong>

                <div style={{ display: 'grid', gap: 5, marginTop: 10 }}>
                  <span
                    style={{
                      color: cardDeltaColor(card.mayJune, card.positiveIsGood),
                      fontSize: 16,
                      fontWeight: 950,
                    }}
                  >
                    Mai → Jun: {signedPct(card.mayJune)}
                  </span>
                  <span
                    style={{
                      color: cardDeltaColor(card.juneJuly, card.positiveIsGood),
                      fontSize: 16,
                      fontWeight: 950,
                    }}
                  >
                    Jun → Jul: {signedPct(card.juneJuly)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18 }}>
            <div
              style={{
                padding: '24px 26px',
                borderRadius: 30,
                background: 'linear-gradient(135deg, #fff, #fff1f4)',
                border: `1px solid ${line}`,
              }}
            >
              <span className="pill">Maio → Junho</span>
              <strong style={{ display: 'block', color: ink, fontSize: 25, marginTop: 14, letterSpacing: '-0.04em' }}>
                Frota própria ganhou espaço mesmo com leve retração da demanda.
              </strong>
              <p style={{ color: muted, margin: '10px 0 0', fontWeight: 740, lineHeight: 1.48 }}>
                Demanda {signedPct(demandMayJune)}, Próprio {signedPct(ownMayJune)} e Terceiro {signedPct(thirdMayJune)}.
                O período mostra crescimento da produção própria acompanhado de redução do volume de Terceiros.
              </p>
            </div>

            <div
              style={{
                padding: '24px 26px',
                borderRadius: 30,
                background: soft,
                border: `1px solid ${line}`,
              }}
            >
              <span className="pill">Junho → Julho</span>
              <strong style={{ display: 'block', color: ink, fontSize: 25, marginTop: 14, letterSpacing: '-0.04em' }}>
                Julho trouxe nova expansão de demanda e maior produção da Frota.
              </strong>
              <p style={{ color: muted, margin: '10px 0 0', fontWeight: 740, lineHeight: 1.48 }}>
                Demanda {signedPct(demandJuneJuly)}, Próprio {signedPct(ownJuneJuly)} e Terceiro {signedPct(thirdJuneJuly)}.
                A leitura mensal permite acompanhar simultaneamente crescimento da operação e resposta dos ativos próprios.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div className="charts-grid charts-grid--two">
            <ChartPanel
              title="Volume mensal"
              subtitle="Demanda total, Próprio e Terceiro de maio a julho/26."
              option={optionVolumes}
              height={370}
            />
            <ChartPanel
              title="Participação na demanda"
              subtitle="Evolução percentual de Próprio, Terceiro e FOB ao longo dos três meses."
              option={optionShares}
              height={370}
            />
          </div>
        </motion.section>
      </div>
    </SlideWrapper>
  );
}
