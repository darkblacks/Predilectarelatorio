import { motion } from 'framer-motion';
import { ChartPanel } from '../components/ui/ChartPanel';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import { DailyRow } from '../types';
import { dayLabel } from '../utils/metrics';

interface SlideEvolucaoProps {
  rows: DailyRow[];
  meta: number;

  /**
   * Compatibilidade: se alguma versão antiga do App ainda passar essas props,
   * o componente aceita, mas não usa.
   */
  monthlyRows?: unknown;
  fleet?: unknown;
}

/**
 * Animação padrão das seções da página.
 */
const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45 },
};

/**
 * Paleta pedida:
 * Próprio + Transpredi = azul
 * Terceiro = vermelho
 * FOB = laranja
 */
const colorProprio = '#2563eb'; // azul
const colorTerceiro = '#da0d0d'; // vermelho
const colorFob = '#f59e0b'; // laranja

const pct = (value: number) => value * 100;
const pctFmt = (value: number) => `${value.toFixed(1).replace('.', ',')}%`;

function safeShare(value: number, total: number) {
  return total === 0 ? 0 : value / total;
}

/**
 * Compatibilidade:
 * Dependendo da versão do seu hook, o DailyRow pode vir com:
 * - frota/transpredi/proprio/shareTerceiroAcumulado
 * ou
 * - interno/percTerceiroAcumulado
 */
type DailyRowCompat = DailyRow & {
  frota?: number;
  transpredi?: number;
  proprio?: number;
  interno?: number;
  terceiro?: number;
  fob?: number;
  total?: number;
  shareTerceiroAcumulado?: number;
  percTerceiroAcumulado?: number;
};

function getProprio(row: DailyRowCompat) {
  return Number(row.proprio ?? row.interno ?? ((row.frota ?? 0) + (row.transpredi ?? 0)));
}

function getTerceiro(row: DailyRowCompat) {
  return Number(row.terceiro ?? 0);
}

function getFob(row: DailyRowCompat) {
  return Number(row.fob ?? 0);
}

function getTotal(row: DailyRowCompat) {
  const proprio = getProprio(row);
  const terceiro = getTerceiro(row);
  const cif = getFob(row);

  return Number(row.total ?? proprio + terceiro + cif);
}

function getAcumuladoTerceiro(row: DailyRowCompat) {
  return Number(row.shareTerceiroAcumulado ?? row.percTerceiroAcumulado ?? 0);
}

export function SlideEvolucao({ rows, meta }: SlideEvolucaoProps) {
  /**
   * Ordena os dias para garantir que o gráfico fique em ordem cronológica.
   */
  const ordered = [...rows].sort((a, b) => a.data.getTime() - b.data.getTime()) as DailyRowCompat[];

  const labels = ordered.map((row) => dayLabel(row.data));

  /**
   * Pega o dia 29 para fazer o destaque piscando.
   */
  const day29 = ordered.find((row) => row.data.getDate() === 29);
  const day29Label = day29 ? dayLabel(day29.data) : '29/06';

  /**
   * Base já em percentual para alimentar os gráficos.
   * Frota + Transpredi ficam juntos em um único indicador:
   * Próprio + Transpredi.
   */
  const composicaoDiaria = ordered.map((row) => {
    const proprio = getProprio(row);
    const terceiro = getTerceiro(row);
    const cif = getFob(row);
    const total = getTotal(row);

    return {
      label: dayLabel(row.data),
      proprio: pct(safeShare(proprio, total)),
      terceiro: pct(safeShare(terceiro, total)),
      cif: pct(safeShare(cif, total)),
      acumuladoTerceiro: pct(getAcumuladoTerceiro(row)),
    };
  });

  const day29Data = composicaoDiaria.find((item) => item.label === day29Label);

  /**
   * Gráfico 1:
   * Composição diária por modalidade.
   * Apenas 3 linhas:
   * - Próprio + Transpredi
   * - Terceiro
   * - FOB
   */
  const optionComposicaoDiaria = {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => pctFmt(value),
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#675056', fontWeight: 700 },
    },
    grid: {
      left: 48,
      right: 24,
      top: 30,
      bottom: 54,
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { interval: 1 },
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
        name: 'Próprio + Transpredi',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: composicaoDiaria.map((item) => item.proprio),
        lineStyle: { width: 4, color: colorProprio },
        itemStyle: { color: colorProprio },
      },
      {
        name: 'Terceiro',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: composicaoDiaria.map((item) => item.terceiro),
        lineStyle: { width: 4, color: colorTerceiro },
        itemStyle: { color: colorTerceiro },
      },
      {
        name: 'FOB',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: composicaoDiaria.map((item) => item.cif),
        lineStyle: { width: 4, color: colorFob },
        itemStyle: { color: colorFob },
      },
      {
        name: 'Dia 29',
        type: 'effectScatter',
        coordinateSystem: 'cartesian2d',
        symbolSize: 20,
        rippleEffect: {
          brushType: 'stroke',
          scale: 4,
          period: 1.2,
        },
        itemStyle: { color: colorTerceiro },
        data: day29Data ? [[day29Label, day29Data.terceiro]] : [],
        z: 10,
      },
    ],
  };

  /**
   * Gráfico 2:
   * Percentual acumulado de terceiros.
   * Também destaca o dia 29 com ponto piscando.
   */
  const optionTerceirosAcumulado = {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => pctFmt(value),
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#675056', fontWeight: 700 },
    },
    grid: {
      left: 48,
      right: 24,
      top: 30,
      bottom: 54,
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { interval: 1 },
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 50,
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [
      {
        name: '% de terceiros acumulado',
        type: 'line',
        smooth: true,
        symbolSize: 7,
        data: composicaoDiaria.map((item) => item.acumuladoTerceiro),
        lineStyle: { width: 4, color: colorTerceiro },
        itemStyle: { color: colorTerceiro },
        areaStyle: { color: 'rgba(218, 13, 13, 0.08)' },
        markLine: {
          silent: true,
          symbol: 'none',
          label: {
            formatter: `Meta ${Math.round(meta * 100)}%`,
            color: '#7c6570',
            fontWeight: 900,
          },
          lineStyle: {
            color: '#8b5e34',
            width: 3,
            type: 'dashed',
          },
          data: [{ yAxis: meta * 100 }],
        },
      },
      {
        name: 'Dia 29',
        type: 'effectScatter',
        coordinateSystem: 'cartesian2d',
        symbolSize: 22,
        rippleEffect: {
          brushType: 'stroke',
          scale: 4,
          period: 1.2,
        },
        itemStyle: { color: colorTerceiro },
        data: day29Data ? [[day29Label, day29Data.acumuladoTerceiro]] : [],
        z: 10,
      },
    ],
  };

  return (
    <SlideWrapper
      eyebrow="Evolução"
      title="Evolução diária"
      subtitle="Leitura percentual diária da operação em junho/26."
    >
      <div className="story-page">
        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Evolução</span>
            <h2>Composição diária por modalidade</h2>
            <p>Próprio + Transpredi, Terceiro e FOB.</p>
          </div>

          <ChartPanel
            title="Composição diária por modalidade"
            subtitle="Percentual diário por modalidade. "
            option={optionComposicaoDiaria}
            height={440}
          />
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Indicador</span>
            <h2>% de terceiros acumulado</h2>
            <p>A linha mostra o acumulado do mês comparado com a meta.</p>
          </div>

          <ChartPanel
            title="% de terceiros acumulado"
            subtitle="A linha tracejada representa a meta de terceiros."
            option={optionTerceirosAcumulado}
            height={440}
          />
        </motion.section>
      </div>
    </SlideWrapper>
  );
}
