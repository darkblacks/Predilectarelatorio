import { motion } from 'framer-motion';
import { ChartPanel } from '../components/ui/ChartPanel';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import { MonthSummary } from './useProductivityWorkbook';

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

const variation = (from: number, to: number) =>
  from > 0 ? (to - from) / from : 0;

const share = (value: number, total: number) =>
  total > 0 ? value / total : 0;

export function SlideJunhoJulho(
  _props: SlideJunhoJulhoProps
) {
  /*
   * CONSOLIDADO MENSAL VALIDADO
   *
   * Junho:
   * Demanda  = 2.153
   * Próprio  = 1.215
   * Terceiro = 828
   * FOB      = 110
   *
   * Julho:
   * Demanda  = 2.457
   * Próprio  = 1.344
   * Terceiro = 985
   * FOB      = 128
   *
   * Este slide usa o consolidado mensal.
   * Não utiliza o recorte comparativo de 01 a 17.
   */

  const june = {
    total: 2153,
    own: 1215,
    thirdParty: 828,
    fob: 110,
  };

  const july = {
    total: 2457,
    own: 1344,
    thirdParty: 985,
    fob: 128,
  };

  /*
   * VARIAÇÕES
   */

  const demandVariation = variation(
    june.total,
    july.total
  );

  const ownVariation = variation(
    june.own,
    july.own
  );

  const thirdPartyVariation = variation(
    june.thirdParty,
    july.thirdParty
  );

  const fobVariation = variation(
    june.fob,
    july.fob
  );

  /*
   * PARTICIPAÇÃO NA DEMANDA
   */

  const ownShareJune = share(
    june.own,
    june.total
  );

  const ownShareJuly = share(
    july.own,
    july.total
  );

  const thirdPartyShareJune = share(
    june.thirdParty,
    june.total
  );

  const thirdPartyShareJuly = share(
    july.thirdParty,
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

  /*
   * GRÁFICO — VOLUME
   */

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

      data: [
        'Junho/26',
        'Julho/26',
      ],

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
          june.own,
          july.own,
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
          june.thirdParty,
          july.thirdParty,
        ],

        itemStyle: {
          color: red,
          borderRadius: [9, 9, 0, 0],
        },
      },

      {
        name: 'FOB',
        type: 'bar',

        data: [
          june.fob,
          july.fob,
        ],

        itemStyle: {
          color: '#f6b73c',
          borderRadius: [9, 9, 0, 0],
        },
      },
    ],
  };

  /*
   * GRÁFICO — PARTICIPAÇÃO
   */

  const optionShares = {
    tooltip: {
      trigger: 'axis',

      valueFormatter: (value: number) =>
        `${Number(value)
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

      data: [
        'Junho/26',
        'Julho/26',
      ],

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

  /*
   * CARDS
   */

  const cards = [
    {
      label: 'Demanda total',

      value:
        `${june.total.toLocaleString('pt-BR')} → ` +
        `${july.total.toLocaleString('pt-BR')}`,

      delta: signedPct(
        demandVariation
      ),

      color: orange,
    },

    {
      label: 'Próprio',

      value:
        `${june.own.toLocaleString('pt-BR')} → ` +
        `${july.own.toLocaleString('pt-BR')}`,

      delta: signedPct(
        ownVariation
      ),

      color:
        ownVariation >= 0
          ? green
          : red,
    },

    {
      label: 'Terceiro',

      value:
        `${june.thirdParty.toLocaleString('pt-BR')} → ` +
        `${july.thirdParty.toLocaleString('pt-BR')}`,

      delta: signedPct(
        thirdPartyVariation
      ),

      color:
        thirdPartyVariation <= 0
          ? green
          : red,
    },

    {
      label: 'FOB',

      value:
        `${june.fob.toLocaleString('pt-BR')} → ` +
        `${july.fob.toLocaleString('pt-BR')}`,

      delta: signedPct(
        fobVariation
      ),

      color: orange,
    },
  ];

  return (
    <SlideWrapper
      eyebrow="Junho × Julho"
      title="Comparativo mensal da operação"
      subtitle="Evolução de Demanda, Próprio, Terceiro e FOB entre junho e julho/26."
    >
      <div className="story-page">

        {/* CARDS */}
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
            {cards.map((card) => (
              <div
                key={card.label}
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
                    fontSize: 27,
                    marginTop: 9,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {card.value}
                </strong>

                <span
                  style={{
                    display: 'block',
                    color: card.color,
                    fontSize: 22,
                    fontWeight: 950,
                    marginTop: 7,
                  }}
                >
                  {card.delta}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* LEITURA */}
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
                  letterSpacing: '-0.04em',
                }}
              >
                A demanda cresceu{' '}
                {pct(demandVariation)}
                {' '}e o Próprio cresceu{' '}
                {pct(ownVariation)}.
              </strong>

              <p
                style={{
                  color: muted,
                  margin: '10px 0 0',
                  fontWeight: 740,
                  lineHeight: 1.45,
                }}
              >
                No mesmo período, Terceiro passou de{' '}
                {june.thirdParty.toLocaleString('pt-BR')}
                {' '}para{' '}
                {july.thirdParty.toLocaleString('pt-BR')}
                {' '}({signedPct(thirdPartyVariation)})
                {' '}e FOB passou de{' '}
                {june.fob.toLocaleString('pt-BR')}
                {' '}para{' '}
                {july.fob.toLocaleString('pt-BR')}
                {' '}({signedPct(fobVariation)}).
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
                Produção própria
              </strong>

              <p
                style={{
                  color: muted,
                  fontWeight: 780,
                  margin: '6px 0 12px',
                }}
              >
                Evolução do volume de viagens
                absorvidas pela operação própria.
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
                Complementa a leitura da demanda
                e da capacidade da operação.
              </p>
            </div>
          </div>
        </motion.section>

        {/* GRÁFICOS */}
        <motion.section
          className="story-section"
          {...reveal}
        >
          <div className="charts-grid charts-grid--two">

            <ChartPanel
              title="Volume mensal"
              subtitle="Demanda total, Próprio, Terceiro e FOB."
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