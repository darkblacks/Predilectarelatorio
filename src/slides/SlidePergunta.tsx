import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChartPanel } from '../components/ui/ChartPanel';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import {
  executiveOwnVolume,
  executiveThirdPartyVolume,
  MonthSummary,
  UnitSummary,
} from './useProductivityWorkbook';

interface SlidePerguntaProps {
  meta: number;
  june: MonthSummary;
  july: MonthSummary;
  units: UnitSummary[];
}

type ViewMode = 'produtividade' | 'resultado';

type InfluenceTone = 'gerenciavel' | 'parcial' | 'estrutural';

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
const amber = '#b7791f';

const brNumber = new Intl.NumberFormat('pt-BR');
const pctFmt = (value: number) => `${(value * 100).toFixed(1).replace('.', ',')}%`;
const pctPointFmt = (value: number) => `${(value * 100).toFixed(1).replace('.', ',')} p.p.`;
const chartPctFmt = (value: number) => `${Number(value).toFixed(1).replace('.', ',')}%`;

function safeShare(value: number, total: number) {
  return total > 0 ? value / total : 0;
}

function ToggleButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1px solid ${active ? blue : line}`,
        background: active ? blue : '#fff',
        color: active ? '#fff' : muted,
        borderRadius: 999,
        padding: '11px 18px',
        fontWeight: 900,
        cursor: 'pointer',
        boxShadow: active ? '0 10px 26px rgba(37, 99, 235, 0.20)' : 'none',
        transition: 'all .2s ease',
      }}
    >
      {children}
    </button>
  );
}

function ResultMetric({
  label,
  value,
  helper,
  color,
}: {
  label: string;
  value: string;
  helper: string;
  color: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${line}`,
        background: '#fff',
        borderRadius: 24,
        padding: '18px 20px',
        boxShadow: '0 12px 34px rgba(129, 0, 27, 0.07)',
      }}
    >
      <span
        style={{
          display: 'block',
          color: muted,
          fontWeight: 900,
          fontSize: 11,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <strong
        style={{
          display: 'block',
          color,
          marginTop: 7,
          fontSize: 38,
          letterSpacing: '-0.055em',
          lineHeight: 1,
        }}
      >
        {value}
      </strong>
      <small style={{ display: 'block', color: muted, marginTop: 8, fontWeight: 740 }}>
        {helper}
      </small>
    </div>
  );
}

function InfluenceCard({
  title,
  description,
  tone,
}: {
  title: string;
  description: string;
  tone: InfluenceTone;
}) {
  const toneConfig = {
    gerenciavel: { label: 'Gerenciável', color: green, background: '#eefaf3' },
    parcial: { label: 'Parcialmente gerenciável', color: amber, background: '#fff8e8' },
    estrutural: { label: 'Estrutural / capacidade', color: red, background: '#fff1f4' },
  }[tone];

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${line}`,
        borderRadius: 24,
        padding: 20,
        boxShadow: '0 12px 34px rgba(129, 0, 27, 0.07)',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          borderRadius: 999,
          padding: '6px 10px',
          background: toneConfig.background,
          color: toneConfig.color,
          fontWeight: 950,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '.05em',
        }}
      >
        {toneConfig.label}
      </span>
      <strong style={{ display: 'block', color: ink, fontSize: 20, marginTop: 12, letterSpacing: '-0.03em' }}>
        {title}
      </strong>
      <p style={{ color: muted, fontWeight: 730, lineHeight: 1.42, margin: '7px 0 0' }}>{description}</p>
    </div>
  );
}

export function SlidePergunta({ meta, june, july, units }: SlidePerguntaProps) {
  const [view, setView] = useState<ViewMode>('produtividade');

  const steps = [
    {
      number: '01',
      title: 'Demanda',
      text: 'Quanto trabalho apareceu para as fábricas e quanto variou ao longo do período.',
      color: orange,
    },
    {
      number: '02',
      title: 'Produtividade da frota',
      text: 'Quanto cada conjunto de veículos próprios efetivamente produziu.',
      color: blue,
    },
    {
      number: '03',
      title: 'Terceiros',
      text: 'Quanto da demanda precisou ser atendida fora da frota própria.',
      color: red,
    },
  ];

  const influences: Array<{ title: string; description: string; tone: InfluenceTone }> = [
    {
      title: 'Produtividade da frota',
      description: 'Programação, retorno, carregamento e uso do ativo podem elevar as viagens produzidas por veículo.',
      tone: 'gerenciavel',
    },
    {
      title: 'Disponibilidade e manutenção',
      description: 'Preventiva, corretiva, motorista e tempo parado podem ser reduzidos, mas não eliminados completamente.',
      tone: 'parcial',
    },
    {
      title: 'Distribuição da frota entre bases',
      description: 'Reposicionar veículos pode melhorar cobertura, porém depende da operação, distância e necessidade de cada fábrica.',
      tone: 'parcial',
    },
    {
      title: 'Picos e variação da demanda',
      description: 'Planejamento ajuda a absorver parte dos picos, mas a demanda não é linear e pode superar a capacidade disponível.',
      tone: 'parcial',
    },
    {
      title: 'Quantidade de veículos na base',
      description: 'Define um limite físico de atendimento. Mudar esse limite exige redistribuição de frota ou decisão de investimento.',
      tone: 'estrutural',
    },
    {
      title: 'Distância e tempo de ciclo das rotas',
      description: 'Rotas longas e permanência em clientes limitam quantas viagens um mesmo veículo consegue executar no período.',
      tone: 'estrutural',
    },
  ];

  const juneOwn = executiveOwnVolume(june, 'june');
  const juneThirdParty = executiveThirdPartyVolume(june, 'june');
  const julyOwn = executiveOwnVolume(july, 'july');
  const julyThirdParty = executiveThirdPartyVolume(july, 'july');

  const juneOwnShare = safeShare(juneOwn, june.total);
  const juneThirdPartyShare = safeShare(juneThirdParty, june.total);
  const juneFobShare = safeShare(june.fob, june.total);

  const julyOwnShare = safeShare(julyOwn, july.total);
  const julyThirdPartyShare = safeShare(julyThirdParty, july.total);
  const julyFobShare = safeShare(july.fob, july.total);

  const distanceToMeta = julyThirdPartyShare - meta;
  const thirdPartyChange = julyThirdPartyShare - juneThirdPartyShare;
  const ownChange = julyOwnShare - juneOwnShare;

  const unitRows = [...units].sort((a, b) => b.thirdPartyShare - a.thirdPartyShare);

  const optionGrupoPercentual = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: number) => chartPctFmt(value),
    },
    legend: { bottom: 0, textStyle: { color: '#675056', fontWeight: 700 } },
    grid: { left: 52, right: 20, top: 30, bottom: 52 },
    xAxis: {
      type: 'category',
      data: ['Junho/26', 'Julho/26'],
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
        type: 'bar',
        data: [juneOwnShare * 100, julyOwnShare * 100],
        itemStyle: { color: blue, borderRadius: [10, 10, 0, 0] },
      },
      {
        name: 'Terceiro',
        type: 'bar',
        data: [juneThirdPartyShare * 100, julyThirdPartyShare * 100],
        itemStyle: { color: red, borderRadius: [10, 10, 0, 0] },
      },
      {
        name: 'FOB',
        type: 'bar',
        data: [juneFobShare * 100, julyFobShare * 100],
        itemStyle: { color: orange, borderRadius: [10, 10, 0, 0] },
      },
    ],
  };

  const optionGrupoQuantidade = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: number) => brNumber.format(value),
    },
    legend: { bottom: 0, textStyle: { color: '#675056', fontWeight: 700 } },
    grid: { left: 58, right: 20, top: 30, bottom: 52 },
    xAxis: {
      type: 'category',
      data: ['Junho/26', 'Julho/26'],
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (value: number) => brNumber.format(value) },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [
      {
        name: 'Próprio',
        type: 'bar',
        stack: 'total',
        data: [juneOwn, julyOwn],
        itemStyle: { color: blue },
      },
      {
        name: 'Terceiro',
        type: 'bar',
        stack: 'total',
        data: [juneThirdParty, julyThirdParty],
        itemStyle: { color: red },
      },
      {
        name: 'FOB',
        type: 'bar',
        stack: 'total',
        data: [june.fob, july.fob],
        itemStyle: { color: orange, borderRadius: [8, 8, 0, 0] },
      },
    ],
  };

  const optionRankingPercentual = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: number) => chartPctFmt(value),
    },
    legend: { bottom: 0, textStyle: { color: '#675056', fontWeight: 700 } },
    grid: { left: 102, right: 18, top: 28, bottom: 52 },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    yAxis: {
      type: 'category',
      data: unitRows.map((item) => item.unit),
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    series: [
      {
        name: 'Próprio',
        type: 'bar',
        stack: 'total',
        data: unitRows.map((item) => item.ownShare * 100),
        itemStyle: { color: blue },
      },
      {
        name: 'Terceiro',
        type: 'bar',
        stack: 'total',
        data: unitRows.map((item) => item.thirdPartyShare * 100),
        itemStyle: { color: red },
      },
      {
        name: 'FOB',
        type: 'bar',
        stack: 'total',
        data: unitRows.map((item) => safeShare(item.fob, item.total) * 100),
        itemStyle: { color: orange, borderRadius: [0, 8, 8, 0] },
      },
    ],
  };

  const optionRankingQuantidade = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: number) => brNumber.format(value),
    },
    legend: { bottom: 0, textStyle: { color: '#675056', fontWeight: 700 } },
    grid: { left: 102, right: 18, top: 28, bottom: 52 },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (value: number) => brNumber.format(value) },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    yAxis: {
      type: 'category',
      data: unitRows.map((item) => item.unit),
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    series: [
      {
        name: 'Próprio',
        type: 'bar',
        stack: 'total',
        data: unitRows.map((item) => item.frota),
        itemStyle: { color: blue },
      },
      {
        name: 'Terceiro',
        type: 'bar',
        stack: 'total',
        data: unitRows.map((item) => item.transpredi + item.terceiro),
        itemStyle: { color: red },
      },
      {
        name: 'FOB',
        type: 'bar',
        stack: 'total',
        data: unitRows.map((item) => item.fob),
        itemStyle: { color: orange, borderRadius: [0, 8, 8, 0] },
      },
    ],
  };

  return (
    <SlideWrapper
      eyebrow="Pergunta de gestão"
      title="O que realmente queremos responder?"
      subtitle={
        view === 'produtividade'
          ? 'Uma leitura de produtividade para complementar a meta de terceiros.'
          : 'Resultado de julho pela ótica tradicional da meta de terceiros.'
      }
    >
      <div className="story-page">
        <motion.section className="story-section" {...reveal}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 18,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <span className="pill">Escolha a leitura</span>
              <p style={{ color: muted, margin: '8px 0 0', fontWeight: 740 }}>
                Troque a visão durante a apresentação sem alterar os dados.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                padding: 6,
                borderRadius: 999,
                background: soft,
                border: `1px solid ${line}`,
              }}
            >
              <ToggleButton active={view === 'produtividade'} onClick={() => setView('produtividade')}>
                Leitura de produtividade
              </ToggleButton>
              <ToggleButton active={view === 'resultado'} onClick={() => setView('resultado')}>
                Resultado tradicional · Julho
              </ToggleButton>
            </div>
          </div>
        </motion.section>

        {view === 'produtividade' ? (
          <>
            <motion.section className="story-section" {...reveal}>
              <div
                style={{
                  padding: 30,
                  borderRadius: 32,
                  border: `1px solid ${line}`,
                  background: '#fff',
                  boxShadow: '0 18px 56px rgba(129, 0, 27, 0.09)',
                }}
              >
                <strong
                  style={{
                    display: 'block',
                    color: ink,
                    fontSize: 31,
                    lineHeight: 1.18,
                    letterSpacing: '-0.045em',
                  }}
                >
                  “Olhar apenas pela ótica dos 25% talvez não seja a melhor forma de medir se estamos tendo um bom desempenho.”
                </strong>
                <p
                  style={{
                    color: muted,
                    fontSize: 18,
                    lineHeight: 1.55,
                    fontWeight: 720,
                    margin: '14px 0 0',
                  }}
                >
                  A frota própria possui um limite físico de produção: quantidade de veículos, disponibilidade, tempo de ciclo,
                  localização entre fábricas e restrições operacionais. Quando a demanda supera essa capacidade, o uso de
                  terceiros cresce mesmo com os ativos próprios bem utilizados. Por isso, além do percentual de terceiros,
                  precisamos responder: <strong style={{ color: ink }}>estamos extraindo o máximo possível da frota que temos?</strong>
                </p>
              </div>
            </motion.section>

            <motion.section className="story-section" {...reveal}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18 }}>
                {steps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    style={{
                      background: '#fff',
                      border: `1px solid ${line}`,
                      borderRadius: 28,
                      padding: 24,
                      boxShadow: '0 14px 42px rgba(129, 0, 27, 0.08)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{ color: step.color, fontWeight: 950, fontSize: 14, letterSpacing: '.12em' }}>
                      {step.number}
                    </span>
                    <h3 style={{ color: ink, fontSize: 28, margin: '10px 0 8px', letterSpacing: '-0.04em' }}>
                      {step.title}
                    </h3>
                    <p style={{ color: muted, fontWeight: 730, lineHeight: 1.45, margin: 0 }}>{step.text}</p>
                    {index < 2 && (
                      <span
                        style={{
                          position: 'absolute',
                          right: 18,
                          top: 18,
                          color: line,
                          fontWeight: 950,
                          fontSize: 34,
                        }}
                      >
                        →
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.section>

            <motion.section className="story-section" {...reveal}>
              <div className="story-section__heading">
                <span className="pill">O que influencia o % de terceiros?</span>
                <h2>Nem todo fator tem o mesmo nível de controle</h2>
                <p>
                  A gestão deve atacar o que é gerenciável sem confundir limite físico de capacidade com baixo desempenho operacional.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
                {influences.map((item) => (
                  <InfluenceCard key={item.title} {...item} />
                ))}
              </div>

              <div
                style={{
                  marginTop: 16,
                  borderRadius: 26,
                  background: soft,
                  border: `1px solid ${line}`,
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 24,
                }}
              >
                <div>
                  <span className="pill">Referência da diretoria</span>
                  <h3 style={{ color: ink, margin: '10px 0 4px', fontSize: 24 }}>A meta continua existindo</h3>
                  <p style={{ color: muted, margin: 0, fontWeight: 740 }}>
                    Os 25% permanecem como referência, mas precisam ser explicados pela produtividade e pela capacidade disponível em cada operação.
                  </p>
                </div>
                <strong style={{ color: red, fontSize: 58, letterSpacing: '-0.07em', whiteSpace: 'nowrap' }}>
                  {Math.round(meta * 100)}%
                </strong>
              </div>
            </motion.section>
          </>
        ) : (
          <>
            <motion.section className="story-section" {...reveal}>
              <div className="story-section__heading">
                <span className="pill">Resultado</span>
                <h2>Big numbers · Julho/26</h2>
                <p>
                  Mesma leitura executiva de resultado, atualizada para julho. Próprio = Frota; Terceiro = Transpredi + Terceiros.
                </p>
              </div>

              <div
                style={{
                  background: `linear-gradient(135deg, ${red}, #a8001d)`,
                  color: '#fff',
                  borderRadius: 34,
                  padding: '30px 28px',
                  textAlign: 'center',
                  boxShadow: '0 18px 56px rgba(129, 0, 27, 0.16)',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '.14em', opacity: .82 }}>
                  Meta de terceiros
                </div>
                <div style={{ fontSize: 78, fontWeight: 950, letterSpacing: '-0.08em', lineHeight: .95, marginTop: 8 }}>
                  {pctFmt(meta)}
                </div>
                <div style={{ marginTop: 10, fontSize: 17, fontWeight: 800, opacity: .88 }}>
                  referência da diretoria para leitura do resultado
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginTop: 16 }}>
                <ResultMetric
                  label="Terceiro · Julho"
                  value={pctFmt(julyThirdPartyShare)}
                  helper={`${brNumber.format(julyThirdParty)} viagens`}
                  color={julyThirdPartyShare <= meta ? green : red}
                />
                <ResultMetric
                  label="Próprio · Julho"
                  value={pctFmt(julyOwnShare)}
                  helper={`${brNumber.format(julyOwn)} viagens`}
                  color={blue}
                />
                <ResultMetric
                  label="Distância da meta"
                  value={`${distanceToMeta > 0 ? '+' : ''}${pctPointFmt(distanceToMeta)}`}
                  helper="resultado de terceiros x meta de 25%"
                  color={distanceToMeta <= 0 ? green : red}
                />
                <ResultMetric
                  label="Total de viagens"
                  value={brNumber.format(july.total)}
                  helper={`FOB: ${brNumber.format(july.fob)} viagens`}
                  color={ink}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, marginTop: 14 }}>
                <ResultMetric
                  label="Terceiro · Junho → Julho"
                  value={`${pctFmt(juneThirdPartyShare)} → ${pctFmt(julyThirdPartyShare)}`}
                  helper={`${thirdPartyChange > 0 ? '+' : ''}${pctPointFmt(thirdPartyChange)} no indicador`}
                  color={thirdPartyChange <= 0 ? green : red}
                />
                <ResultMetric
                  label="Próprio · Junho → Julho"
                  value={`${pctFmt(juneOwnShare)} → ${pctFmt(julyOwnShare)}`}
                  helper={`${ownChange > 0 ? '+' : ''}${pctPointFmt(ownChange)} na participação própria`}
                  color={ownChange >= 0 ? green : blue}
                />
              </div>
            </motion.section>

            <motion.section className="story-section" {...reveal}>
              <div className="story-section__heading">
                <span className="pill">Resultado do grupo</span>
                <h2>Próprio x Terceiro x FOB</h2>
                <p>
                  Comparativo Junho → Julho usando o critério executivo de cada período.
                </p>
              </div>

              <div className="charts-grid charts-grid--two">
                <ChartPanel
                  title="Participação por classificação (%)"
                  subtitle="Percentual sobre o total de viagens do grupo."
                  option={optionGrupoPercentual}
                  height={360}
                />
                <ChartPanel
                  title="Quantidade de viagens"
                  subtitle="Volume absoluto de Próprio, Terceiro e FOB."
                  option={optionGrupoQuantidade}
                  height={360}
                />
              </div>

              <div
                style={{
                  marginTop: 14,
                  borderRadius: 20,
                  background: soft,
                  border: `1px solid ${line}`,
                  padding: '14px 18px',
                  color: muted,
                  fontWeight: 730,
                  lineHeight: 1.4,
                }}
              >
                <strong style={{ color: ink }}>Critério:</strong> em Junho, Transpredi compõe Próprio; em Julho, Transpredi compõe Terceiro. O XLSX bruto não é alterado.
              </div>
            </motion.section>

            <motion.section className="story-section" {...reveal}>
              <div className="story-section__heading">
                <span className="pill">Por fábrica</span>
                <h2>Resultado atual de Julho</h2>
                <p>% de Terceiro calculado sobre o total de viagens de cada fábrica.</p>
              </div>

              <div
                style={{
                  background: '#fff',
                  border: `1px solid ${line}`,
                  borderRadius: 28,
                  padding: 20,
                  boxShadow: '0 14px 42px rgba(129, 0, 27, 0.08)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.35fr .8fr .8fr .8fr .8fr',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 14,
                    background: soft,
                    color: muted,
                    fontSize: 11,
                    fontWeight: 950,
                    textTransform: 'uppercase',
                    letterSpacing: '.05em',
                  }}
                >
                  <span>Fábrica</span>
                  <span>Total</span>
                  <span>Próprio</span>
                  <span>Terceiro</span>
                  <span>% Terceiro</span>
                </div>

                <div style={{ display: 'grid', gap: 7, marginTop: 9 }}>
                  {unitRows.map((unit) => {
                    const terceiro = unit.transpredi + unit.terceiro;
                    return (
                      <div
                        key={unit.unit}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.35fr .8fr .8fr .8fr .8fr',
                          gap: 10,
                          alignItems: 'center',
                          padding: '10px 12px',
                          border: `1px solid ${line}`,
                          borderRadius: 14,
                        }}
                      >
                        <strong style={{ color: ink }}>{unit.unit}</strong>
                        <span style={{ color: muted, fontWeight: 800 }}>{brNumber.format(unit.total)}</span>
                        <span style={{ color: blue, fontWeight: 900 }}>{brNumber.format(unit.frota)}</span>
                        <span style={{ color: red, fontWeight: 900 }}>{brNumber.format(terceiro)}</span>
                        <strong style={{ color: unit.thirdPartyShare <= meta ? green : red, fontSize: 18 }}>
                          {pctFmt(unit.thirdPartyShare)}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.section>

            <motion.section className="story-section" {...reveal}>
              <div className="story-section__heading">
                <span className="pill">Ranking</span>
                <h2>Comparativo por fábrica · Julho/26</h2>
                <p>Mesma leitura em percentual e em quantidade de viagens.</p>
              </div>

              <div className="charts-grid charts-grid--two">
                <ChartPanel
                  title="Composição por fábrica (%)"
                  subtitle="Próprio, Terceiro e FOB sobre o total de cada fábrica."
                  option={optionRankingPercentual}
                  height={430}
                />
                <ChartPanel
                  title="Quantidade de viagens por fábrica"
                  subtitle="Volume absoluto de Julho/26."
                  option={optionRankingQuantidade}
                  height={430}
                />
              </div>
            </motion.section>
          </>
        )}
      </div>
    </SlideWrapper>
  );
}
