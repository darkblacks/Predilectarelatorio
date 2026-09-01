import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChartPanel } from '../components/ui/ChartPanel';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import { CURRENT_MONTH_LABEL, DailySummary } from './useProductivityWorkbook';

interface SlidePicosOperacaoProps {
  daily: DailySummary[];
  dailyByUnit: Record<string, DailySummary[]>;
}

const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.45 },
};

const ink = '#2e1a20';
const muted = '#7c6570';
const line = '#f1dce2';
const blue = '#2563eb';
const red = '#da0d0d';
const orange = '#f59e0b';
const soft = '#fff1f4';

const brNumber = new Intl.NumberFormat('pt-BR');
const oneDecimal = (value: number) => value.toFixed(1).replace('.', ',');

export function SlidePicosOperacao({ daily, dailyByUnit }: SlidePicosOperacaoProps) {
  const [selectedScope, setSelectedScope] = useState('Grupo');

  const filters = useMemo(() => ['Grupo', ...Object.keys(dailyByUnit)], [dailyByUnit]);

  const selectedDaily = selectedScope === 'Grupo'
    ? daily
    : dailyByUnit[selectedScope] ?? daily;

  const activeDays = selectedDaily.filter((item) => item.total > 0);
  const peak = [...activeDays].sort((a, b) => b.total - a.total)[0];
  const average = activeDays.length
    ? activeDays.reduce((sum, item) => sum + item.total, 0) / activeDays.length
    : 0;

  const isGroup = selectedScope === 'Grupo';
  const pressureDays = isGroup
    ? activeDays.filter((item) => item.total > 100).length
    : activeDays.filter((item) => item.total > average).length;

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: Array<{ dataIndex?: number }>) => {
        const dataIndex = params?.[0]?.dataIndex ?? 0;
        const item = selectedDaily[dataIndex];
        if (!item) return '';

        return [
          `<strong>${selectedScope} · ${item.label}</strong>`,
          `Total: <strong>${brNumber.format(item.total)}</strong>`,
          `Próprio: <strong>${brNumber.format(item.frota)}</strong>`,
          `Terceiro: <strong>${brNumber.format(item.terceiro)}</strong>`,
          `FOB: <strong>${brNumber.format(item.fob)}</strong>`,
        ].join('<br/>');
      },
    },
    legend: { bottom: 0, selected: { FOB: false }, textStyle: { color: muted, fontWeight: 700 } },
    grid: { left: 54, right: 22, top: 24, bottom: 62 },
    xAxis: {
      type: 'category',
      data: selectedDaily.map((item) => item.label),
      axisLabel: { interval: 1, rotate: 35 },
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [
      {
        name: 'Próprio',
        type: 'bar',
        stack: 'total',
        data: selectedDaily.map((item) => item.frota),
        itemStyle: { color: blue },
      },
      {
        name: 'Terceiro',
        type: 'bar',
        stack: 'total',
        data: selectedDaily.map((item) => item.terceiro),
        itemStyle: { color: red },
      },
      {
        name: 'FOB',
        type: 'bar',
        stack: 'total',
        data: selectedDaily.map((item) => item.fob),
        itemStyle: { color: orange, borderRadius: [5, 5, 0, 0] },
      },
      {
        name: 'Média diária',
        type: 'line',
        data: selectedDaily.map(() => average),
        symbol: 'none',
        lineStyle: { color: '#8b5e34', width: 2, type: 'dashed' },
        tooltip: { show: false },
      },
    ],
  };

  return (
    <SlideWrapper
      eyebrow="Demanda diária"
      title="O terceiro como pulmão da operação"
      subtitle="A demanda varia ao longo do mês; filtre o grupo ou uma fábrica para acompanhar a composição diária."
    >
      <div className="story-page">
        <motion.section className="story-section" {...reveal}>
          <div style={{ display: 'grid', gap: 22 }}>
            <div
              style={{
                padding: '16px 18px',
                borderRadius: 26,
                border: `1px solid ${line}`,
                background: '#fff',
                boxShadow: '0 12px 34px rgba(129, 0, 27, 0.07)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <span className="pill">Filtro por fábrica</span>
                  <strong style={{ display: 'block', color: ink, fontSize: 19, marginTop: 8, letterSpacing: '-0.02em' }}>
                    Visualizando: {selectedScope}
                  </strong>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {filters.map((filter) => {
                    const selected = selectedScope === filter;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setSelectedScope(filter)}
                        style={{
                          border: selected ? `2px solid ${red}` : `1px solid ${line}`,
                          background: selected ? red : soft,
                          color: selected ? '#fff' : muted,
                          borderRadius: 999,
                          padding: '9px 13px',
                          fontWeight: 900,
                          fontSize: 13,
                          cursor: 'pointer',
                          boxShadow: selected ? '0 8px 22px rgba(218, 13, 13, 0.18)' : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
              <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 26, padding: 20 }}>
                <span style={{ color: muted, fontWeight: 900, fontSize: 12, textTransform: 'uppercase' }}>Pico do mês</span>
                <strong style={{ display: 'block', color: ink, fontSize: 36, marginTop: 7 }}>{peak?.total ?? 0}</strong>
                <small style={{ color: muted, fontWeight: 760 }}>{peak ? `carregamentos em ${peak.label}` : '—'}</small>
              </div>

              <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 26, padding: 20 }}>
                <span style={{ color: muted, fontWeight: 900, fontSize: 12, textTransform: 'uppercase' }}>Média em dias ativos</span>
                <strong style={{ display: 'block', color: blue, fontSize: 36, marginTop: 7 }}>{oneDecimal(average)}</strong>
                <small style={{ color: muted, fontWeight: 760 }}>carregamentos por dia com operação</small>
              </div>

              <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 26, padding: 20 }}>
                <span style={{ color: muted, fontWeight: 900, fontSize: 12, textTransform: 'uppercase' }}>
                  {isGroup ? 'Dias acima de 100' : 'Dias acima da média'}
                </span>
                <strong style={{ display: 'block', color: red, fontSize: 36, marginTop: 7 }}>{pressureDays}</strong>
                <small style={{ color: muted, fontWeight: 760 }}>
                  {isGroup ? 'picos que pressionam a capacidade' : `dias acima de ${oneDecimal(average)} carregamentos`}
                </small>
              </div>
            </div>

            <ChartPanel
              key={selectedScope}
              title={isGroup ? 'Composição diária do grupo' : `Composição diária · ${selectedScope}`}
              subtitle={`Próprio, Terceiro e FOB ao longo de ${CURRENT_MONTH_LABEL} · ${selectedScope}.`}
              option={option}
              height={470}
            />

            <div style={{ padding: '20px 22px', borderRadius: 26, border: `1px solid ${line}`, background: soft }}>
              <strong style={{ color: ink, fontSize: 23 }}>
                A leitura muda: terceiro alto em um pico não é automaticamente ineficiência.
              </strong>
              <p style={{ color: muted, margin: '7px 0 0', fontWeight: 740, lineHeight: 1.42 }}>
                Use o filtro para comparar a dinâmica de cada fábrica. O gráfico separa Próprio, Terceiro e FOB para mostrar como a composição da demanda varia ao longo de {CURRENT_MONTH_LABEL}.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </SlideWrapper>
  );
}
