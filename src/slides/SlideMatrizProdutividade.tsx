import { motion } from 'framer-motion';
import { ChartPanel } from '../components/ui/ChartPanel';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import { CURRENT_MONTH_LABEL, UnitSummary } from './useProductivityWorkbook';

interface SlideMatrizProdutividadeProps { units: UnitSummary[] }

const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45 },
};

const PRODUCTIVITY_REF = 10;
const THIRD_PARTY_REF = 0.38;
const ink = '#2e1a20';
const muted = '#7c6570';
const line = '#f1dce2';
const soft = '#fff1f4';
const blue = '#2563eb';
const red = '#da0d0d';
const orange = '#f59e0b';
const green = '#37a169';

function tone(item: UnitSummary) {
  if (item.productivity < PRODUCTIVITY_REF && item.thirdPartyShare >= THIRD_PARTY_REF) return red;
  if (item.productivity >= PRODUCTIVITY_REF && item.thirdPartyShare >= THIRD_PARTY_REF) return orange;
  if (item.productivity >= PRODUCTIVITY_REF && item.thirdPartyShare < THIRD_PARTY_REF) return green;
  return blue;
}

const pct = (value: number) => `${(value * 100).toFixed(1).replace('.', ',')}%`;
const dec1 = (value: number) => value.toFixed(1).replace('.', ',');
const integer = (value: number) => Math.round(value).toLocaleString('pt-BR');

export function SlideMatrizProdutividade({ units }: SlideMatrizProdutividadeProps) {
  const ordered = [...units].sort((a, b) => b.total - a.total);

  const option = {
    tooltip: {
      formatter: (params: {
        data?: {
          name?: string;
          raw?: {
            total: number;
            productivity: number;
            thirdPartyShare: number;
            ownShare: number;
          };
        };
      }) => {
        const raw = params.data?.raw;
        if (!raw) return `<strong>${params.data?.name ?? ''}</strong>`;

        return `
          <div style="min-width:210px">
            <strong style="font-size:15px">${params.data?.name ?? ''}</strong><br/>
            <span>Total de Viagens: <b>${integer(raw.total)}</b></span><br/>
            <span>Viagens por Veículo: <b>${dec1(raw.productivity)}</b></span><br/>
            <span>% de Terceiros: <b>${pct(raw.thirdPartyShare)}</b></span><br/>
            <span>% de Próprio: <b>${pct(raw.ownShare)}</b></span>
          </div>
        `;
      },
    },
    grid: { left: 66, right: 34, top: 34, bottom: 62 },
    xAxis: {
      type: 'value',
      name: 'Viagens por veículo',
      nameLocation: 'middle',
      nameGap: 38,
      min: 8,
      max: 14,
      splitLine: { lineStyle: { color: '#f3e2e6' } },
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: {
      type: 'value',
      name: '% de Terceiros',
      min: 20,
      max: 70,
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [{
      type: 'scatter',
      data: units.map((item) => ({
        name: item.unit,
        value: [item.productivity, item.thirdPartyShare * 100],
        raw: {
          total: item.total,
          productivity: item.productivity,
          thirdPartyShare: item.thirdPartyShare,
          ownShare: item.ownShare,
        },
        symbolSize: Math.max(22, Math.min(50, item.total / 16)),
        itemStyle: { color: tone(item), opacity: 0.88 },
        label: { show: true, formatter: item.unit, position: 'top', color: ink, fontWeight: 900, fontSize: 12 },
      })),
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: { color: '#bca6ad', type: 'dashed', width: 2 },
        label: { color: muted, fontWeight: 800 },
        data: [
          { xAxis: PRODUCTIVITY_REF, label: { formatter: '10 viagens/veíc.' } },
          { yAxis: THIRD_PARTY_REF * 100, label: { formatter: '38% Terceiros' } },
        ],
      },
    }],
  };

  const groups = [
    {
      title: 'Referência',
      color: green,
      text: 'Produtividade mais alta com menor participação de Terceiros.',
      units: units.filter((i) => i.productivity >= PRODUCTIVITY_REF && i.thirdPartyShare < THIRD_PARTY_REF),
    },
    {
      title: 'Capacidade pressionada',
      color: orange,
      text: 'O Próprio produz bem, mas a participação de Terceiros continua alta.',
      units: units.filter((i) => i.productivity >= PRODUCTIVITY_REF && i.thirdPartyShare >= THIRD_PARTY_REF),
    },
    {
      title: 'Prioridade de investigação',
      color: red,
      text: 'Menor produtividade combinada com maior participação de Terceiros.',
      units: units.filter((i) => i.productivity < PRODUCTIVITY_REF && i.thirdPartyShare >= THIRD_PARTY_REF),
    },
    {
      title: 'Baixa pressão de Terceiros',
      color: blue,
      text: 'Produtividade menor sem participação elevada de Terceiros.',
      units: units.filter((i) => i.productivity < PRODUCTIVITY_REF && i.thirdPartyShare < THIRD_PARTY_REF),
    },
  ];

  return (
    <SlideWrapper
      eyebrow="Matriz executiva"
      title="Produtividade × % de Terceiros"
      subtitle={`${CURRENT_MONTH_LABEL}: Próprio = Frota + Transpredi; Terceiro = Transpredi contratado + Terceiros. FOB fica fora da base percentual operacional.`}
    >
      <div className="story-page">
        <motion.section className="story-section" {...reveal}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(330px, .75fr)', gap: 18, alignItems: 'stretch' }}>
            <ChartPanel
              title={`Matriz das unidades — ${CURRENT_MONTH_LABEL}`}
              subtitle="Passe o mouse nas bolhas para ver demanda, produtividade, % de Terceiros e % de Próprio."
              option={option}
              height={520}
            />

            <div style={{ display: 'grid', gap: 12 }}>
              {groups.map((group) => (
                <div key={group.title} style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 24, padding: 18, boxShadow: '0 12px 36px rgba(129,0,27,.07)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, display: 'inline-block', background: group.color, marginRight: 8 }} />
                  <strong style={{ color: ink, fontSize: 19 }}>{group.title}</strong>
                  <p style={{ color: muted, fontWeight: 730, margin: '7px 0 10px', lineHeight: 1.35 }}>{group.text}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {group.units.length ? group.units.map((item) => (
                      <span key={item.unit} style={{ background: `${group.color}12`, border: `1px solid ${group.color}35`, color: group.color, borderRadius: 999, padding: '7px 10px', fontSize: 12, fontWeight: 900 }}>
                        {item.unit} · {dec1(item.productivity)} · {pct(item.thirdPartyShare)}
                      </span>
                    )) : <span style={{ color: muted, fontWeight: 750 }}>Nenhuma unidade</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 30, padding: 22, boxShadow: '0 16px 48px rgba(129,0,27,.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 14 }}>
              <div>
                <span className="pill">Dados brutos</span>
                <h3 style={{ color: ink, margin: '10px 0 4px', fontSize: 26, letterSpacing: '-0.04em' }}>Produção e estrutura por fábrica</h3>
                <p style={{ color: muted, margin: 0, fontWeight: 730 }}>Mesmos dados usados para posicionar cada bolha na matriz.</p>
              </div>
              <strong style={{ color: blue, fontSize: 14, whiteSpace: 'nowrap' }}>{CURRENT_MONTH_LABEL}</strong>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.35fr .9fr .9fr .9fr .9fr .85fr',
                gap: 10,
                padding: '11px 12px',
                borderRadius: 15,
                background: soft,
                color: muted,
                fontSize: 11,
                fontWeight: 950,
                textTransform: 'uppercase',
                letterSpacing: '.04em',
              }}
            >
              <span>Fábrica</span>
              <span>Total viagens</span>
              <span>Viagens Próprio</span>
              <span>Viagens Terceiro</span>
              <span>Viagens/veíc.</span>
              <span style={{ color: blue }}>Veículos na base</span>
            </div>

            <div style={{ display: 'grid', gap: 7, marginTop: 8 }}>
              {ordered.map((item) => {
                const thirdPartyTrips = item.thirdParty;

                return (
                  <div
                    key={item.unit}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.35fr .9fr .9fr .9fr .9fr .85fr',
                      gap: 10,
                      alignItems: 'center',
                      padding: '12px',
                      border: `1px solid ${line}`,
                      borderRadius: 15,
                      background: '#fff',
                    }}
                  >
                    <strong style={{ color: ink }}>{item.unit}</strong>
                    <span style={{ color: muted, fontWeight: 850 }}>{integer(item.total)}</span>
                    <span style={{ color: blue, fontWeight: 900 }}>{integer(item.own)}</span>
                    <span style={{ color: red, fontWeight: 900 }}>{integer(thirdPartyTrips)}</span>
                    <strong style={{ color: ink, fontSize: 17 }}>{dec1(item.productivity)}</strong>
                    <strong style={{ color: blue, fontSize: 18 }}>{item.vehicles || '—'}</strong>
                  </div>
                );
              })}
            </div>

            <p style={{ color: muted, fontWeight: 720, margin: '12px 2px 0', fontSize: 12, lineHeight: 1.4 }}>
              % de Terceiros = (Transpredi + Terceiros) ÷ Total da fábrica. % de Próprio = Frota ÷ Total da fábrica. O total também contém FOB; por isso os dois percentuais podem não somar 100%.
            </p>
          </div>
        </motion.section>
      </div>
    </SlideWrapper>
  );
}
