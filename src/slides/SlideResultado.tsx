import { motion } from 'framer-motion';
import { ChartPanel } from '../components/ui/ChartPanel';
import { MetricCard } from '../components/ui/MetricCard';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import { MonthlyRow } from '../types';
import {
  brNumber,
  brPercent,
  companiesForMonth,
  companyMonthTotals,
  monthLabelTitle,
  share,
  totalByMonth,
  transportadoraTotals,
} from '../utils/metrics';

interface SlideResultadoProps {
  rows: MonthlyRow[];
  selectedMonth: string;
  previousMonth?: string;
  meta: number;
}

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45 },
};

const pct = (value: number) => value * 100;
const colorProprio = '#2563eb';
const colorFrota = '#2563eb';
const colorTranspredi = '#60a5fa';
const colorTerceiro = '#da0d0d';
const colorFob = '#f59e0b';
const green = '#37a169';
const muted = '#7c6570';
const ink = '#2e1a20';
const line = '#f1dce2';
const soft = '#fff1f4';

export function SlideResultado({
  rows,
  selectedMonth,
  previousMonth,
  meta,
}: SlideResultadoProps) {
  const currentTotals = transportadoraTotals(rows, selectedMonth);
  const currentTotal = totalByMonth(rows, selectedMonth);
  const currentInternal = currentTotals.Frota + currentTotals.Transpredi;
  const currentThirdShare = share(currentTotals.Terceiro, currentTotal);
  const currentInternalShare = share(currentInternal, currentTotal);
  const currentFobShare = share(currentTotals.FOB, currentTotal);

  const previousTotals = previousMonth
    ? transportadoraTotals(rows, previousMonth)
    : { Frota: 0, Transpredi: 0, Terceiro: 0, FOB: 0 };
  const previousTotal = previousMonth ? totalByMonth(rows, previousMonth) : 0;
  const previousInternal = previousTotals.Frota + previousTotals.Transpredi;
  const previousThirdShare = share(previousTotals.Terceiro, previousTotal);
  const previousInternalShare = share(previousInternal, previousTotal);
  const previousFobShare = share(previousTotals.FOB, previousTotal);

  const gapToTarget = currentThirdShare - meta;
  const thirdImprovement = previousMonth ? previousThirdShare - currentThirdShare : 0;
  const volumeChange = previousTotal ? currentTotal / previousTotal - 1 : 0;
  const thirdVolumeChange = previousTotals.Terceiro
    ? currentTotals.Terceiro / previousTotals.Terceiro - 1
    : 0;

  const improvedAgainstPrevious = Boolean(previousMonth) && thirdImprovement > 0;
  const worsenedAgainstPrevious = Boolean(previousMonth) && thirdImprovement < 0;
  const internalGainedShare = !previousMonth || currentInternalShare >= previousInternalShare;

  const executiveTitle = gapToTarget <= 0
    ? 'Meta atingida'
    : improvedAgainstPrevious
      ? 'Melhoramos, mas a meta ainda não foi atingida'
      : worsenedAgainstPrevious
        ? 'O indicador piorou e segue acima da meta'
        : 'O resultado segue acima da meta';

  const companies = companiesForMonth(rows, selectedMonth)
    .map((company) => {
      const current = companyMonthTotals(rows, selectedMonth, company);
      const previous = previousMonth
        ? companyMonthTotals(rows, previousMonth, company)
        : { frota: 0, transpredi: 0, terceiro: 0, fob: 0, proprio: 0, total: 0 };

      return {
        company,
        previousShare: share(previous.terceiro, previous.total),
        currentShare: share(current.terceiro, current.total),
        current,
        improved: previous.total > 0 && share(current.terceiro, current.total) < share(previous.terceiro, previous.total),
      };
    })
    .sort((a, b) => b.currentShare - a.currentShare);

  const compositionLabels = previousMonth
    ? [monthLabelTitle(previousMonth), monthLabelTitle(selectedMonth)]
    : [monthLabelTitle(selectedMonth)];

  const optionComposition = {
    color: [colorFrota, colorTranspredi, colorTerceiro, colorFob],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0, textStyle: { color: '#675056', fontWeight: 700 } },
    grid: { left: 48, right: 18, top: 28, bottom: 52 },
    xAxis: {
      type: 'category',
      data: compositionLabels,
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: {
      type: 'value',
      max: 70,
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [
      {
        name: 'Frota',
        type: 'bar',
        data: previousMonth
          ? [pct(share(previousTotals.Frota, previousTotal)), pct(share(currentTotals.Frota, currentTotal))]
          : [pct(share(currentTotals.Frota, currentTotal))],
        itemStyle: { color: colorFrota, borderRadius: [10, 10, 0, 0] },
      },
      {
        name: 'Transpredi',
        type: 'bar',
        data: previousMonth
          ? [pct(share(previousTotals.Transpredi, previousTotal)), pct(share(currentTotals.Transpredi, currentTotal))]
          : [pct(share(currentTotals.Transpredi, currentTotal))],
        itemStyle: { color: colorTranspredi, borderRadius: [10, 10, 0, 0] },
      },
      {
        name: 'Terceiro',
        type: 'bar',
        data: previousMonth
          ? [pct(previousThirdShare), pct(currentThirdShare)]
          : [pct(currentThirdShare)],
        itemStyle: { color: colorTerceiro, borderRadius: [10, 10, 0, 0] },
        markLine: {
          symbol: 'none',
          lineStyle: { color: colorTerceiro, type: 'dashed', width: 2 },
          label: { formatter: `Meta ${Math.round(meta * 100)}%`, color: colorTerceiro },
          data: [{ yAxis: pct(meta) }],
        },
      },
      {
        name: 'FOB',
        type: 'bar',
        data: previousMonth
          ? [pct(previousFobShare), pct(currentFobShare)]
          : [pct(currentFobShare)],
        itemStyle: { color: colorFob, borderRadius: [10, 10, 0, 0] },
      },
    ],
  };

  const optionCompanyThird = {
    color: [colorTerceiro],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: number) => `${value.toFixed(1).replace('.', ',')}%`,
    },
    grid: { left: 96, right: 34, top: 24, bottom: 34 },
    xAxis: {
      type: 'value',
      max: Math.max(100, Math.ceil(Math.max(...companies.map((item) => pct(item.currentShare)), 0) / 10) * 10),
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: companies.map((item) => item.company),
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    series: [
      {
        type: 'bar',
        data: companies.map((item) => ({
          value: pct(item.currentShare),
          itemStyle: { color: item.currentShare <= meta ? green : colorTerceiro, borderRadius: [0, 8, 8, 0] },
        })),
        label: {
          show: true,
          position: 'right',
          formatter: ({ value }: { value: number }) => `${value.toFixed(1).replace('.', ',')}%`,
          color: ink,
          fontWeight: 800,
        },
        markLine: {
          symbol: 'none',
          lineStyle: { color: colorTerceiro, type: 'dashed', width: 2 },
          label: { formatter: `Meta ${Math.round(meta * 100)}%`, color: colorTerceiro },
          data: [{ xAxis: pct(meta) }],
        },
      },
    ],
  };

  const optionVolume = {
    color: [colorProprio, colorTerceiro, colorFob],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0, textStyle: { color: '#675056', fontWeight: 700 } },
    grid: { left: 48, right: 18, top: 28, bottom: 52 },
    xAxis: {
      type: 'category',
      data: compositionLabels,
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (value: number) => brNumber.format(value) },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [
      {
        name: 'Frota + Transpredi',
        type: 'bar',
        stack: 'total',
        data: previousMonth ? [previousInternal, currentInternal] : [currentInternal],
        itemStyle: { color: colorProprio },
      },
      {
        name: 'Terceiro',
        type: 'bar',
        stack: 'total',
        data: previousMonth ? [previousTotals.Terceiro, currentTotals.Terceiro] : [currentTotals.Terceiro],
        itemStyle: { color: colorTerceiro },
      },
      {
        name: 'FOB',
        type: 'bar',
        stack: 'total',
        data: previousMonth ? [previousTotals.FOB, currentTotals.FOB] : [currentTotals.FOB],
        itemStyle: { color: colorFob, borderRadius: [10, 10, 0, 0] },
      },
    ],
  };

  return (
    <SlideWrapper
      eyebrow="Resultado"
      title="Resultado consolidado"
      subtitle={`Resultado mensal de ${monthLabelTitle(selectedMonth)} a partir da aba Resultado do Excel.`}
      footer={`Meta de terceiros: ${Math.round(meta * 100)}% · Mês selecionado: ${monthLabelTitle(selectedMonth)}`}
    >
      <div className="story-page">
        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Resultado</span>
            <h2>Como fomos no mês?</h2>
            <p>Leitura do indicador de terceiros contra a meta de 25%.</p>
          </div>

          <div className="result-hero-grid">
            <div className={`target-card ${gapToTarget <= 0 ? 'target-card--good' : ''}`}>
              <span>Terceiros em {monthLabelTitle(selectedMonth)}</span>
              <strong>{brPercent.format(currentThirdShare)}</strong>
              <small>
                {gapToTarget <= 0
                  ? `${brPercent.format(Math.abs(gapToTarget))} abaixo da meta.`
                  : `${brPercent.format(gapToTarget)} acima da meta de ${Math.round(meta * 100)}%.`}
              </small>
            </div>

            <div className="result-summary-card">
              <span className="pill">Leitura executiva</span>
              <h3>{executiveTitle}</h3>
              <p>
                {previousMonth ? (
                  <>
                    A participação de terceiros {thirdImprovement >= 0 ? 'caiu' : 'subiu'} de{' '}
                    <strong>{brPercent.format(previousThirdShare)}</strong> para{' '}
                    <strong>{brPercent.format(currentThirdShare)}</strong>, uma {thirdImprovement >= 0 ? 'melhora' : 'piora'} de{' '}
                    <strong>{(Math.abs(thirdImprovement) * 100).toFixed(1).replace('.', ',')} p.p.</strong>. O volume total{' '}
                    {volumeChange >= 0 ? 'cresceu' : 'recuou'} <strong>{brPercent.format(Math.abs(volumeChange))}</strong>,
                    enquanto o volume absoluto de terceiros {thirdVolumeChange <= 0 ? 'recuou' : 'cresceu'}{' '}
                    <strong>{brPercent.format(Math.abs(thirdVolumeChange))}</strong>.
                  </>
                ) : (
                  <>O mês selecionado possui {brNumber.format(currentTotal)} carregamentos na base.</>
                )}
              </p>
            </div>
          </div>

          <div className="metric-grid">
            <MetricCard
              label="Meta de terceiros"
              value={brPercent.format(meta)}
              helper="Referência do indicador"
              tone="brand"
            />
            <MetricCard
              label="Frota + Transpredi"
              value={brPercent.format(currentInternalShare)}
              helper={`${brNumber.format(currentInternal)} carregamentos`}
              tone="good"
            />
            <MetricCard
              label="Terceiros"
              value={brNumber.format(currentTotals.Terceiro)}
              helper={`${brPercent.format(currentThirdShare)} do total`}
              tone={gapToTarget <= 0 ? 'good' : 'alert'}
            />
            <MetricCard
              label="Total do grupo"
              value={brNumber.format(currentTotal)}
              helper={`${brNumber.format(currentTotals.FOB)} FOB`}
              tone="neutral"
            />
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Composição</span>
            <h2>{internalGainedShare ? 'A operação interna ganhou participação' : 'A operação interna perdeu participação'}</h2>
            <p>Comparação percentual e em quantidade entre o mês selecionado e o anterior.</p>
          </div>
          <div className="charts-grid charts-grid--two">
            <ChartPanel
              title="Composição percentual"
              subtitle="Frota, Transpredi, terceiros e FOB"
              option={optionComposition}
              height={390}
            />
            <ChartPanel
              title="Volume por modalidade"
              subtitle="Quantidade de carregamentos"
              option={optionVolume}
              height={390}
            />
          </div>
          <div className="insight-row">
            <div className="insight-box">
              <strong>Operação interna:</strong> {brNumber.format(currentInternal)} carregamentos, equivalente a{' '}
              {brPercent.format(currentInternalShare)} do grupo.
            </div>
            <div className="insight-box">
              <strong>Distância da meta:</strong>{' '}
              {gapToTarget <= 0
                ? `${(Math.abs(gapToTarget) * 100).toFixed(1).replace('.', ',')} p.p. melhor que a meta.`
                : `${(gapToTarget * 100).toFixed(1).replace('.', ',')} p.p. ainda precisam ser eliminados.`}
            </div>
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Filiais</span>
            <h2>Resultado por empresa</h2>
            <p>Participação de terceiros no mês selecionado, comparada ao mês anterior.</p>
          </div>

          <div className="company-result-layout">
            <div className="company-table-card">
              <div className="company-table-card__header">
                <div>
                  <h3>Resultado atual por empresa</h3>
                  <p>% de terceiros — ordenado do maior para o menor.</p>
                </div>
                <strong>{previousMonth ? `${monthLabelTitle(previousMonth)} → ` : ''}{monthLabelTitle(selectedMonth)}</strong>
              </div>

              <div className="company-table company-table--header">
                <span>Empresa</span>
                <span>{previousMonth ? monthLabelTitle(previousMonth) : 'Anterior'}</span>
                <span>{monthLabelTitle(selectedMonth)}</span>
                <span>Serviços</span>
              </div>

              <div className="company-table-list">
                {companies.map((item) => (
                  <div className="company-table" key={item.company}>
                    <strong>{item.company}</strong>
                    <b style={{ color: item.improved ? colorTerceiro : muted }}>
                      {previousMonth ? brPercent.format(item.previousShare) : '—'}
                    </b>
                    <b style={{ color: item.currentShare <= meta || item.improved ? green : colorTerceiro }}>
                      {brPercent.format(item.currentShare)}
                    </b>
                    <span>{brNumber.format(item.current.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            <ChartPanel
              title="Terceiros por filial"
              subtitle={`Linha tracejada = meta de ${Math.round(meta * 100)}%`}
              option={optionCompanyThird}
              height={520}
            />
          </div>
        </motion.section>
      </div>
    </SlideWrapper>
  );
}
