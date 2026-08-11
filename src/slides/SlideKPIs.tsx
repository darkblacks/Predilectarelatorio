import { motion } from 'framer-motion';
import { ChartPanel } from '../components/ui/ChartPanel';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import {
  MonthSummary,
  executiveThirdPartyVolume,
  executiveOwnVolume,
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

const pct = (value: number) =>
  `${(value * 100).toFixed(1).replace('.', ',')}%`;

const signedPct = (value: number) =>
  `${value >= 0 ? '+' : ''}${pct(value)}`;

const pp = (value: number) =>
  `${value >= 0 ? '+' : ''}${(value * 100)
    .toFixed(1)
    .replace('.', ',')} p.p.`;

const share = (value: number, total: number) =>
  total ? value / total : 0;

const variation = (from: number, to: number) =>
  from ? (to - from) / from : 0;

export function SlideJunhoJulho({
  june,
  july,
}: SlideJunhoJulhoProps) {
  const juneOwn = executiveOwnVolume(june, 'june');
  const julyOwn = executiveOwnVolume(july, 'july');

  const juneThirdParty =
    executiveThirdPartyVolume(june, 'june');

  const julyThirdParty =
    executiveThirdPartyVolume(july, 'july');

  const demandVariation = variation(
    june.total,
    july.total
  );

  const fleetVariation = variation(
    june.frota,
    july.frota
  );

  const ownVariation = variation(
    juneOwn,
    julyOwn
  );

  const thirdPartyVariation = variation(
    juneThirdParty,
    julyThirdParty
  );

  const ownShareJune = share(
    juneOwn,
    june.total
  );

  const ownShareJuly = share(
    julyOwn,
    july.total
  );

  const thirdPartyShareJune = share(
    juneThirdParty,
    june.total
  );

  const thirdPartyShareJuly = share(
    julyThirdParty,
    july.total
  );

  const fobShareJune = share(
    june.fob,
    june.total
  );

  const fobShareJuly = share(
    july.fob,
    july.total
  );

  const optionVolumes = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },

    legend: {
      bottom: 0,
      textStyle: {
        color: muted,
        fontWeight: 700,
      },
    },

    grid: {
      left: 58,
      right: 18,
      top: 28,
      bottom: 54,
    },

    xAxis: {
      type: 'category',
      data: ['Junho/26', 'Julho/26'],
      axisLine: {
        lineStyle: {
          color: '#ead5db',
        },
      },
    },

    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: '#f3e2e6',
        },
      },
    },

    series: [
      {
        name: 'Demanda total',
        type: 'bar',
        data: [
          june.total,
          july.total,
        ],
        itemStyle: {
          color: orange,
          borderRadius: [9, 9, 0, 0],
        },
      },

      {
        name: 'Próprio',
        type: 'bar',
        data: [
          juneOwn,
          julyOwn,
        ],
        itemStyle: {
          color: blue,
          borderRadius: [9, 9, 0, 0],
        },
      },

      {
        name: 'Terceiro',
        type: 'bar',
        data: [
          juneThirdParty,
          julyThirdParty,
        ],
        itemStyle: {
          color: red,
          borderRadius: [9, 9, 0, 0],
        },
      },
    ],
  };

  const optionShares = {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) =>
        `${value
          .toFixed(1)
          .replace('.', ',')}%`,
    },

    legend: {
      bottom: 0,
      textStyle: {
        color: muted,
        fontWeight: 700,
      },
    },

    grid: {
      left: 52,
      right: 18,
      top: 28,
      bottom: 54,
    },

    xAxis: {
      type: 'category',
      data: ['Junho/26', 'Julho/26'],
      axisLine: {
        lineStyle: {
          color: '#ead5db',
        },
      },
    },

    yAxis: {
      type: 'value',
      min: 0,
      max: 70,
      axisLabel: {
        formatter: '{value}%',
      },
      splitLine: {
        lineStyle: {
          color: '#f3e2e6',
        },
      },
    },

    series: [
      {
        name: 'Próprio',
        type: 'line',
        smooth: true,
        symbolSize: 10,
        data: [
          ownShareJune * 100,
          ownShareJuly * 100,
        ],
        lineStyle: {
          width: 4,
          color: blue,
        },
        itemStyle: {
          color: blue,
        },
        areaStyle: {
          color: 'rgba(37,99,235,.07)',
        },
      },

      {
        name: 'Terceiro',
        type: 'line',
        smooth: true,
        symbolSize: 10,
        data: [
          thirdPartyShareJune * 100,
          thirdPartyShareJuly * 100,
        ],
        lineStyle: {
          width: 4,
          color: red,
        },
        itemStyle: {
          color: red,
        },
        areaStyle: {
          color: 'rgba(218,13,13,.05)',
        },
      },

      {
        name: 'FOB',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        data: [
          fobShareJune * 100,
          fobShareJuly * 100,
        ],
        lineStyle: {
          width: 3,
          color: orange,
        },
        itemStyle: {
          color: orange,
        },
      },
    ],
  };

  const cards = [
    [
      'Demanda total',
      `${june.total.toLocaleString('pt-BR')} → ${july.total.toLocaleString('pt-BR')}`,
      signedPct(demandVariation),
      demandVariation >= 0 ? orange : green,
    ],

    [
      'Frota · Maio → Junho',
      `${june.frota.toLocaleString('pt-BR')} → ${july.frota.toLocaleString('pt-BR')}`,
      signedPct(fleetVariation),
      fleetVariation >= 0 ? green : red,
    ],

    [
      'Próprio · Junho → Julho',
      `${juneOwn.toLocaleString('pt-BR')} → ${julyOwn.toLocaleString('pt-BR')}`,
      signedPct(ownVariation),
      ownVariation >= 0 ? green : red,
    ],

    [
      'Terceiro',
      `${juneThirdParty.toLocaleString('pt-BR')} → ${julyThirdParty.toLocaleString('pt-BR')}`,
      signedPct(thirdPartyVariation),
      thirdPartyVariation <= 0
        ? green
        : red,
    ],
  ];

  return (
    <SlideWrapper
      eyebrow="Junho × Julho"
      title="Julho teve mais demanda e a frota própria respondeu"
      subtitle="Evolução dos principais indicadores da operação."
    >
      <div className="story-page">

        <motion.section
          className="story-section"
          {...reveal}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(4, minmax(0, 1fr))',
              gap: 14,
            }}
          >
            {cards.map(
              ([label, value, delta, color]) => (
                <div
                  key={String(label)}
                  style={{
                    background: '#fff',
                    border: `1px solid ${line}`,
                    borderRadius: 26,
                    padding: 20,
                    boxShadow:
                      '0 14px 42px rgba(129,0,27,.08)',
                  }}
                >
                  <span
                    style={{
                      color: muted,
                      fontWeight: 900,
                      textTransform:
                        'uppercase',
                      fontSize: 11,
                      letterSpacing:
                        '.08em',
                    }}
                  >
                    {label}
                  </span>

                  <strong
                    style={{
                      display: 'block',
                      color: ink,
                      fontSize: 27,
                      marginTop: 9,
                      letterSpacing:
                        '-0.04em',
                    }}
                  >
                    {value}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      color,
                      fontSize: 22,
                      fontWeight: 950,
                      marginTop: 7,
                    }}
                  >
                    {delta}
                  </span>
                </div>
              )
            )}
          </div>
        </motion.section>

        <motion.section
          className="story-section"
          {...reveal}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'minmax(0, 1.2fr) minmax(330px, .8fr)',
              gap: 18,
            }}
          >
            <div
              style={{
                padding: '24px 26px',
                borderRadius: 30,
                background:
                  'linear-gradient(135deg, #fff, #fff1f4)',
                border: `1px solid ${line}`,
              }}
            >
              <strong
                style={{
                  color: ink,
                  fontSize: 27,
                  letterSpacing:
                    '-0.04em',
                }}
              >
                A demanda cresceu{' '}
                {pct(
                  demandVariation
                ).replace('-', '')}{' '}
                e as viagens da Frota
                cresceram{' '}
                {pct(
                  fleetVariation
                ).replace('-', '')}.
              </strong>

              <p
                style={{
                  color: muted,
                  margin: '10px 0 0',
                  fontWeight: 740,
                  lineHeight: 1.45,
                }}
              >
                O Próprio passa de{' '}
                {juneOwn.toLocaleString(
                  'pt-BR'
                )}{' '}
                para{' '}
                {julyOwn.toLocaleString(
                  'pt-BR'
                )}{' '}
                (
                {signedPct(
                  ownVariation
                )}
                ) e Terceiro de{' '}
                {juneThirdParty.toLocaleString(
                  'pt-BR'
                )}{' '}
                para{' '}
                {julyThirdParty.toLocaleString(
                  'pt-BR'
                )}{' '}
                (
                {signedPct(
                  thirdPartyVariation
                )}
                ).
              </p>
            </div>

            <div
              style={{
                padding: '22px 24px',
                borderRadius: 30,
                background: soft,
                border: `1px solid ${line}`,
              }}
            >
              <span className="pill">
                Leitura do comparativo
              </span>

              <strong
                style={{
                  display: 'block',
                  color: ink,
                  fontSize: 21,
                  marginTop: 14,
                }}
              >
                Produção da frota
              </strong>

              <p
                style={{
                  color: muted,
                  fontWeight: 780,
                  margin: '6px 0 12px',
                }}
              >
                Evolução da produção dos
                ativos ao longo do período.
              </p>

              <strong
                style={{
                  display: 'block',
                  color: ink,
                  fontSize: 21,
                }}
              >
                Participação de Terceiros
              </strong>

              <p
                style={{
                  color: muted,
                  fontWeight: 780,
                  margin: '6px 0 0',
                }}
              >
                Complementa a leitura da
                capacidade e da demanda da
                operação.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="story-section"
          {...reveal}
        >
          <div className="charts-grid charts-grid--two">

            <ChartPanel
              title="Volume mensal"
              subtitle="Demanda total, Próprio e Terceiro."
              option={optionVolumes}
              height={360}
            />

            <ChartPanel
              title="Participação na demanda"
              subtitle="Evolução percentual de Próprio, Terceiro e FOB."
              option={optionShares}
              height={360}
            />

          </div>
        </motion.section>

      </div>
    </SlideWrapper>
  );
}