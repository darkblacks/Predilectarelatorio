import { motion } from 'framer-motion';
import { ChartPanel } from '../components/ui/ChartPanel';
import { MetricCard } from '../components/ui/MetricCard';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import { DailyRow } from '../types';
import {
  brNumber,
  brPercent,
  dayLabel,
  filterDailyByMonth,
  monthLabelTitle,
  peakDaily,
  share,
  totalDaily,
} from '../utils/metrics';

interface SlideEvolucaoProps {
  rows: DailyRow[];
  selectedMonth: string;
  meta: number;
}

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45 },
};

export function SlideEvolucao({ rows, selectedMonth, meta }: SlideEvolucaoProps) {
  const monthRows = filterDailyByMonth(rows, selectedMonth);
  const totals = totalDaily(monthRows);
  const thirdShare = share(totals.terceirosOperacional, totals.baseOperacional);
  const peakTotal = peakDaily(monthRows, 'total');
  const peakThird = peakDaily(monthRows, 'terceirosOperacional');
  const activeDays = monthRows.filter((row) => row.total > 0).length;
  const average = activeDays ? totals.total / activeDays : 0;

  if (!monthRows.length) {
    return (
      <SlideWrapper
        eyebrow="Evolução"
        title="Evolução diária"
        subtitle={`A aba Evolução não possui lançamentos para ${monthLabelTitle(selectedMonth)}.`}
        footer="Inclua os dados diários na aba Evolução usando o mesmo padrão da planilha."
      >
        <div className="empty-state">
          <img src="./assets/logo-predilecta.png" alt="Predilecta" />
          <h2>Sem dados diários para este mês</h2>
          <p>
            O resultado mensal continua disponível. Para habilitar esta página, adicione os dias do mês
            na aba <strong>Evolução</strong> da planilha.
          </p>
        </div>
      </SlideWrapper>
    );
  }

  const optionDailyVolume = {
    color: ['#2563eb', '#da0d0d', '#f59e0b'],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0, textStyle: { color: '#675056', fontWeight: 700 } },
    grid: { left: 48, right: 18, top: 28, bottom: 58 },
    xAxis: {
      type: 'category',
      data: monthRows.map((row) => dayLabel(row.data)),
      axisLabel: { interval: 2, rotate: 35 },
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [
      {
        name: 'Frota',
        type: 'bar',
        stack: 'volume',
        data: monthRows.map((row) => row.frotaOperacional),
        itemStyle: { color: '#2563eb' },
      },
      {
        name: 'Terceiros',
        type: 'bar',
        stack: 'volume',
        data: monthRows.map((row) => row.terceirosOperacional),
        itemStyle: { color: '#da0d0d' },
      },
      {
        name: 'FOB',
        type: 'bar',
        stack: 'volume',
        data: monthRows.map((row) => row.fob),
        itemStyle: { color: '#f59e0b', borderRadius: [5, 5, 0, 0] },
      },
    ],
  };

  const maxAccumulated = Math.max(
    ...monthRows.map((row) => row.shareTerceirosAcumulado * 100),
    meta * 100,
  );

  const optionAccumulated = {
    color: ['#da0d0d'],
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => `${value.toFixed(1).replace('.', ',')}%`,
    },
    grid: { left: 48, right: 24, top: 28, bottom: 54 },
    xAxis: {
      type: 'category',
      data: monthRows.map((row) => dayLabel(row.data)),
      axisLabel: { interval: 2, rotate: 35 },
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: Math.max(50, Math.ceil(maxAccumulated / 10) * 10),
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [
      {
        name: 'Terceiros acumulado',
        type: 'line',
        smooth: true,
        symbolSize: 7,
        data: monthRows.map((row) => row.shareTerceirosAcumulado * 100),
        lineStyle: { width: 4, color: '#da0d0d' },
        itemStyle: { color: '#da0d0d' },
        areaStyle: { color: 'rgba(218, 13, 13, 0.08)' },
        markLine: {
          symbol: 'none',
          lineStyle: { color: '#37a169', type: 'dashed', width: 2 },
          label: { formatter: `Meta ${Math.round(meta * 100)}%`, color: '#37a169' },
          data: [{ yAxis: meta * 100 }],
        },
      },
    ],
  };

  const optionDailyShare = {
    color: ['#da0d0d'],
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => `${value.toFixed(1).replace('.', ',')}%`,
    },
    grid: { left: 48, right: 24, top: 28, bottom: 54 },
    xAxis: {
      type: 'category',
      data: monthRows.map((row) => dayLabel(row.data)),
      axisLabel: { interval: 2, rotate: 35 },
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [
      {
        name: '% terceiros no dia',
        type: 'bar',
        data: monthRows.map((row) => ({
          value: row.shareTerceirosDia * 100,
          itemStyle: {
            color: row.shareTerceirosDia <= meta ? '#37a169' : '#da0d0d',
            borderRadius: [6, 6, 0, 0],
          },
        })),
        markLine: {
          symbol: 'none',
          lineStyle: { color: '#37a169', type: 'dashed', width: 2 },
          label: { formatter: `Meta ${Math.round(meta * 100)}%`, color: '#37a169' },
          data: [{ yAxis: meta * 100 }],
        },
      },
    ],
  };

  return (
    <SlideWrapper
      eyebrow="Evolução"
      title="Evolução diária"
      subtitle={`Ritmo operacional da unidade Predilecta em ${monthLabelTitle(selectedMonth)}.`}
      footer="Frota x Terceiros. Desde julho/2026, Transpredi integra terceiros; FOB fica fora do percentual."
    >
      <div className="story-page">
        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Ritmo do mês</span>
            <h2>O acumulado mostra a trajetória do indicador</h2>
            <p>Volume diário e participação de terceiros sobre a base operacional.</p>
          </div>

          <div className="metric-grid">
            <MetricCard
              label="Total no mês"
              value={brNumber.format(totals.total)}
              helper={`${activeDays} dias com movimento`}
              tone="brand"
            />
            <MetricCard
              label="Terceiros"
              value={brPercent.format(thirdShare)}
              helper={`${brNumber.format(totals.terceirosOperacional)} carregamentos · inclui Transpredi`}
              tone={thirdShare <= meta ? 'good' : 'alert'}
            />
            <MetricCard
              label="Média por dia ativo"
              value={average.toFixed(1).replace('.', ',')}
              helper="Carregamentos totais"
              tone="neutral"
            />
            <MetricCard
              label="Pico diário"
              value={peakTotal ? brNumber.format(peakTotal.total) : '—'}
              helper={peakTotal ? dayLabel(peakTotal.data) : 'Sem movimento'}
              tone="neutral"
            />
          </div>

          <ChartPanel
            title="Volume diário por grupo"
            subtitle="Frota, terceiros e FOB"
            option={optionDailyVolume}
            height={430}
          />
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Indicador</span>
            <h2>O acumulado encerrou em {brPercent.format(thirdShare)}</h2>
            <p>A linha tracejada representa a meta de terceiros sobre Frota + Terceiros.</p>
          </div>
          <div className="charts-grid charts-grid--two">
            <ChartPanel
              title="Participação acumulada de terceiros"
              subtitle="O indicador reinicia a cada mês"
              option={optionAccumulated}
              height={390}
            />
            <ChartPanel
              title="Participação diária de terceiros"
              subtitle="Dias verdes ficaram dentro da meta"
              option={optionDailyShare}
              height={390}
            />
          </div>
          <div className="insight-row">
            <div className="insight-box">
              <strong>Maior uso de terceiros:</strong>{' '}
              {peakThird
                ? `${brNumber.format(peakThird.terceirosOperacional)} carregamentos em ${dayLabel(peakThird.data)}.`
                : 'Sem dados.'}
            </div>
            <div className="insight-box">
              <strong>Frota:</strong> {brNumber.format(totals.frotaOperacional)} carregamentos no detalhamento diário.
            </div>
          </div>
        </motion.section>
      </div>
    </SlideWrapper>
  );
}
