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
  operationalTotals,
  share,
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
const colorFrota = '#2563eb';
const colorTerceiro = '#da0d0d';
const colorFob = '#f59e0b';
const green = '#37a169';
const muted = '#7c6570';
const ink = '#2e1a20';

export function SlideResultado({
  rows,
  selectedMonth,
  previousMonth,
  meta,
}: SlideResultadoProps) {
  const current = operationalTotals(rows, selectedMonth);
  const currentThirdShare = share(current.terceirosOperacional, current.baseOperacional);
  const currentFrotaShare = share(current.frotaOperacional, current.baseOperacional);

  const previous = previousMonth
    ? operationalTotals(rows, previousMonth)
    : {
        Frota: 0,
        Transpredi: 0,
        Terceiro: 0,
        FOB: 0,
        frotaOperacional: 0,
        terceirosOperacional: 0,
        baseOperacional: 0,
        totalGeral: 0,
        transprediEmTerceiros: false,
      };
  const previousThirdShare = share(previous.terceirosOperacional, previous.baseOperacional);
  const previousFrotaShare = share(previous.frotaOperacional, previous.baseOperacional);

  const gapToTarget = currentThirdShare - meta;
  const thirdImprovement = previousMonth ? previousThirdShare - currentThirdShare : 0;
  const baseVolumeChange = previous.baseOperacional
    ? current.baseOperacional / previous.baseOperacional - 1
    : 0;
  const thirdVolumeChange = previous.terceirosOperacional
    ? current.terceirosOperacional / previous.terceirosOperacional - 1
    : 0;

  const improvedAgainstPrevious = Boolean(previousMonth) && thirdImprovement > 0;
  const worsenedAgainstPrevious = Boolean(previousMonth) && thirdImprovement < 0;
  const frotaGainedShare = !previousMonth || currentFrotaShare >= previousFrotaShare;

  const executiveTitle = gapToTarget <= 0
    ? 'Meta atingida'
    : improvedAgainstPrevious
      ? 'Melhoramos, mas a meta ainda não foi atingida'
      : worsenedAgainstPrevious
        ? 'O indicador piorou e segue acima da meta'
        : 'O resultado segue acima da meta';

  const companies = companiesForMonth(rows, selectedMonth)
    .map((company) => {
      const currentCompany = companyMonthTotals(rows, selectedMonth, company);
      const previousCompany = previousMonth
        ? companyMonthTotals(rows, previousMonth, company)
        : {
            frota: 0,
            transpredi: 0,
            terceiro: 0,
            fob: 0,
            frotaOperacional: 0,
            terceirosOperacional: 0,
            baseOperacional: 0,
            total: 0,
            transprediEmTerceiros: false,
          };

      const currentShare = share(
        currentCompany.terceirosOperacional,
        currentCompany.baseOperacional,
      );
      const previousShare = share(
        previousCompany.terceirosOperacional,
        previousCompany.baseOperacional,
      );

      return {
        company,
        previousShare,
        currentShare,
        current: currentCompany,
        improved:
          previousCompany.baseOperacional > 0 && currentShare < previousShare,
      };
    })
    .sort((a, b) => b.currentShare - a.currentShare);

  const compositionLabels = previousMonth
    ? [monthLabelTitle(previousMonth), monthLabelTitle(selectedMonth)]
    : [monthLabelTitle(selectedMonth)];

  const optionComposition = {
    color: [colorFrota, colorTerceiro],
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
      max: 100,
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [
      {
        name: 'Frota',
        type: 'bar',
        stack: 'base',
        data: previousMonth
          ? [pct(previousFrotaShare), pct(currentFrotaShare)]
          : [pct(currentFrotaShare)],
        itemStyle: { color: colorFrota },
      },
      {
        name: 'Terceiros',
        type: 'bar',
        stack: 'base',
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
      max: Math.max(
        100,
        Math.ceil(Math.max(...companies.map((item) => pct(item.currentShare)), 0) / 10) * 10,
      ),
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
          itemStyle: {
            color: item.currentShare <= meta ? green : colorTerceiro,
            borderRadius: [0, 8, 8, 0],
          },
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
    color: [colorFrota, colorTerceiro, colorFob],
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
        name: 'Frota',
        type: 'bar',
        stack: 'total',
        data: previousMonth
          ? [previous.frotaOperacional, current.frotaOperacional]
          : [current.frotaOperacional],
        itemStyle: { color: colorFrota },
      },
      {
        name: 'Terceiros',
        type: 'bar',
        stack: 'total',
        data: previousMonth
          ? [previous.terceirosOperacional, current.terceirosOperacional]
          : [current.terceirosOperacional],
        itemStyle: { color: colorTerceiro },
      },
      {
        name: 'FOB',
        type: 'bar',
        stack: 'total',
        data: previousMonth ? [previous.FOB, current.FOB] : [current.FOB],
        itemStyle: { color: colorFob, borderRadius: [10, 10, 0, 0] },
      },
    ],
  };

  return (
    <SlideWrapper
      eyebrow="Resultado"
      title="Resultado consolidado"
      subtitle={`Resultado mensal de ${monthLabelTitle(selectedMonth)} a partir da aba Resultado do Excel.`}
      footer={`Meta de terceiros: ${Math.round(meta * 100)}% · Base do indicador: Frota + Terceiros, sem FOB.`}
    >
      <div className="story-page">
        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Resultado</span>
            <h2>Como fomos no mês?</h2>
            <p>
              Frota contra terceiros. Desde julho/2026, Transpredi está somada a terceiros.
            </p>
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
                    <strong>{(Math.abs(thirdImprovement) * 100).toFixed(1).replace('.', ',')} p.p.</strong>. A base operacional{' '}
                    {baseVolumeChange >= 0 ? 'cresceu' : 'recuou'} <strong>{brPercent.format(Math.abs(baseVolumeChange))}</strong>,
                    enquanto o volume de terceiros {thirdVolumeChange <= 0 ? 'recuou' : 'cresceu'}{' '}
                    <strong>{brPercent.format(Math.abs(thirdVolumeChange))}</strong>.
                  </>
                ) : (
                  <>O mês selecionado possui {brNumber.format(current.baseOperacional)} carregamentos na base operacional.</>
                )}
              </p>
            </div>
          </div>

          <div className="metric-grid">
            <MetricCard
              label="Meta de terceiros"
              value={brPercent.format(meta)}
              helper="Referência da base operacional"
              tone="brand"
            />
            <MetricCard
              label="Frota"
              value={brPercent.format(currentFrotaShare)}
              helper={`${brNumber.format(current.frotaOperacional)} carregamentos`}
              tone="good"
            />
            <MetricCard
              label="Terceiros"
              value={brNumber.format(current.terceirosOperacional)}
              helper={`${brPercent.format(currentThirdShare)} da base · inclui Transpredi`}
              tone={gapToTarget <= 0 ? 'good' : 'alert'}
            />
            <MetricCard
              label="Total do grupo"
              value={brNumber.format(current.totalGeral)}
              helper={`${brNumber.format(current.FOB)} FOB fora do indicador`}
              tone="neutral"
            />
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Composição</span>
            <h2>{frotaGainedShare ? 'A frota ganhou participação' : 'A frota perdeu participação'}</h2>
            <p>Comparação percentual e em quantidade entre Frota e Terceiros.</p>
          </div>
          <div className="charts-grid charts-grid--two">
            <ChartPanel
              title="Composição da base operacional"
              subtitle="Frota x Terceiros · FOB não entra no percentual"
              option={optionComposition}
              height={390}
            />
            <ChartPanel
              title="Volume por grupo"
              subtitle="Frota, terceiros e FOB"
              option={optionVolume}
              height={390}
            />
          </div>
          <div className="insight-row">
            <div className="insight-box">
              <strong>Frota:</strong> {brNumber.format(current.frotaOperacional)} carregamentos, equivalente a{' '}
              {brPercent.format(currentFrotaShare)} da base operacional.
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
            <p>Participação de terceiros sobre Frota + Terceiros em cada filial.</p>
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
