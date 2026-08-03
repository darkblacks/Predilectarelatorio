import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Gauge, Target, TrendingDown } from 'lucide-react';
import { ChartPanel } from '../components/ui/ChartPanel';
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

interface SlidePlanoAcaoProps {
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

export function SlidePlanoAcao({
  rows,
  selectedMonth,
  previousMonth,
  meta,
}: SlidePlanoAcaoProps) {
  const totals = transportadoraTotals(rows, selectedMonth);
  const total = totalByMonth(rows, selectedMonth);
  const thirdShare = share(totals.Terceiro, total);
  const targetThirdVolume = Math.floor(total * meta);
  const reductionNeeded = Math.max(0, totals.Terceiro - targetThirdVolume);
  const gap = thirdShare - meta;
  const reached = gap <= 0;

  const previousTotals = previousMonth ? transportadoraTotals(rows, previousMonth) : undefined;
  const previousTotal = previousMonth ? totalByMonth(rows, previousMonth) : 0;
  const previousShare = previousTotals ? share(previousTotals.Terceiro, previousTotal) : undefined;
  const improvement = previousShare === undefined ? undefined : previousShare - thirdShare;

  const companyGaps = companiesForMonth(rows, selectedMonth)
    .map((company) => {
      const item = companyMonthTotals(rows, selectedMonth, company);
      const companyShare = share(item.terceiro, item.total);
      const companyTarget = Math.floor(item.total * meta);
      return {
        company,
        share: companyShare,
        total: item.total,
        third: item.terceiro,
        excess: Math.max(0, item.terceiro - companyTarget),
      };
    })
    .filter((item) => item.total > 0)
    .sort((a, b) => b.excess - a.excess);

  const priorities = companyGaps.filter((item) => item.excess > 0).slice(0, 3);

  const optionGap = {
    color: ['#da0d0d'],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 96, right: 34, top: 26, bottom: 34 },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (value: number) => brNumber.format(value) },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: companyGaps.map((item) => item.company),
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    series: [
      {
        type: 'bar',
        data: companyGaps.map((item) => ({
          value: item.excess,
          itemStyle: { color: item.excess === 0 ? '#37a169' : '#da0d0d', borderRadius: [0, 8, 8, 0] },
        })),
        label: {
          show: true,
          position: 'right',
          formatter: ({ value }: { value: number }) => value === 0 ? 'Meta' : brNumber.format(value),
          color: '#2e1a20',
          fontWeight: 800,
        },
      },
    ],
  };

  return (
    <SlideWrapper
      eyebrow="Plano de ação"
      title={reached ? 'Sustentar o resultado' : 'Caminho para a meta'}
      subtitle={`Direcionamentos calculados com base em ${monthLabelTitle(selectedMonth)}.`}
      footer={`Meta de terceiros: ${Math.round(meta * 100)}% · Os volumes são recalculados ao trocar o mês.`}
    >
      <div className="story-page">
        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Direcionamento</span>
            <h2>{reached ? 'O desafio agora é manter a disciplina' : `Faltam ${(gap * 100).toFixed(1).replace('.', ',')} p.p. para a meta`}</h2>
            <p>O plano é atualizado automaticamente conforme o mês e a planilha selecionados.</p>
          </div>

          <div className="action-hero-grid">
            <div className={`target-card ${reached ? 'target-card--good' : ''}`}>
              {reached ? <CheckCircle2 size={42} /> : <Target size={42} />}
              <span>{reached ? 'Resultado dentro da meta' : 'Redução necessária'}</span>
              <strong>{reached ? brPercent.format(thirdShare) : brNumber.format(reductionNeeded)}</strong>
              <small>
                {reached
                  ? `${brPercent.format(Math.abs(gap))} abaixo da meta.`
                  : `carregamentos de terceiros a substituir, mantendo o mesmo volume total.`}
              </small>
            </div>

            <div className="action-list">
              <div className="action-card action-card--brand">
                <Gauge size={26} />
                <div>
                  <span>Limite mensal na base atual</span>
                  <strong>{brNumber.format(targetThirdVolume)} terceiros</strong>
                  <p>Equivale a {brPercent.format(meta)} de {brNumber.format(total)} carregamentos.</p>
                </div>
              </div>

              <div className="action-card">
                <TrendingDown size={26} />
                <div>
                  <span>Evolução contra o mês anterior</span>
                  <strong>
                    {improvement === undefined
                      ? 'Sem comparação'
                      : `${(Math.abs(improvement) * 100).toFixed(1).replace('.', ',')} p.p. ${improvement >= 0 ? 'melhor' : 'pior'}`}
                  </strong>
                  <p>{previousMonth ? `${monthLabelTitle(previousMonth)} x ${monthLabelTitle(selectedMonth)}` : 'Primeiro mês da base.'}</p>
                </div>
              </div>

              <div className="action-card">
                <AlertTriangle size={26} />
                <div>
                  <span>Prioridade operacional</span>
                  <strong>{priorities[0]?.company ?? 'Manutenção do resultado'}</strong>
                  <p>
                    {priorities[0]
                      ? `${brNumber.format(priorities[0].excess)} carregamentos acima do limite proporcional.`
                      : 'Nenhuma filial está acima da meta proporcional.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Foco por filial</span>
            <h2>Onde está o maior potencial de redução?</h2>
            <p>Excesso estimado de terceiros para cada filial chegar a 25%, mantendo o volume atual.</p>
          </div>

          <div className="company-result-layout">
            <ChartPanel
              title="Carregamentos acima da meta proporcional"
              subtitle="Barras verdes já estão dentro da meta"
              option={optionGap}
              height={500}
            />

            <div className="priority-card">
              <span className="pill">Três prioridades</span>
              <h3>{reached ? 'Pontos para sustentar' : 'Conversões com maior impacto'}</h3>
              <div className="priority-list">
                {(priorities.length ? priorities : companyGaps.slice(0, 3)).map((item, index) => (
                  <div key={item.company}>
                    <b>{index + 1}</b>
                    <div>
                      <strong>{item.company}</strong>
                      <p>
                        {brPercent.format(item.share)} de terceiros · {item.excess > 0 ? `${brNumber.format(item.excess)} acima do limite` : 'dentro da meta'}.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="priority-note">
                <strong>Leitura recomendada</strong>
                <p>
                  Priorizar as filiais com maior excesso absoluto reduz o indicador do grupo mais rápido
                  do que atuar apenas sobre os maiores percentuais.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </SlideWrapper>
  );
}
