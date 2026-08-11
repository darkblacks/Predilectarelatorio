import { motion } from 'framer-motion';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import { MonthSummary } from './useProductivityWorkbook';

interface SlideKPIsProps {
  july: MonthSummary;
  groupVehicles: number;
  meta: number;
  dataNotes: string[];
}

const ink = '#2e1a20';
const muted = '#7c6570';
const line = '#f1dce2';
const soft = '#fff1f4';
const blue = '#2563eb';
const red = '#da0d0d';
const orange = '#f59e0b';

const pct = (value: number) => `${(value * 100).toFixed(1).replace('.', ',')}%`;
const dec1 = (value: number) => value.toFixed(1).replace('.', ',');

export function SlideKPIs({ july, groupVehicles, meta, dataNotes }: SlideKPIsProps) {
  const productivity = groupVehicles ? july.frota / groupVehicles : 0;
  const ownShare = july.total ? july.frota / july.total : 0;
  const thirdPartyShare = july.total ? (july.transpredi + july.terceiro) / july.total : 0;

  const kpis = [
    {
      index: '01',
      title: 'Produtividade do Próprio',
      value: `${dec1(productivity)} viag./veíc.`,
      formula: 'Viagens Próprio ÷ Veículos',
      helper: 'KPI principal: mede quanto de produção observada estamos extraindo dos ativos.',
      color: blue,
    },
    {
      index: '02',
      title: 'Participação de Próprio',
      value: pct(ownShare),
      formula: 'Viagens Próprio ÷ Total de viagens',
      helper: 'Mostra quanto da demanda total foi absorvida diretamente pela frota própria.',
      color: orange,
    },
    {
      index: '03',
      title: 'Participação de Terceiros',
      value: pct(thirdPartyShare),
      formula: 'Viagens Terceiro ÷ Total de viagens',
      helper: `Em julho, Transpredi é classificada como Terceiro. A meta de ${Math.round(meta * 100)}% segue como referência, mas não é analisada isoladamente.`,
      color: red,
    },
  ];

  return (
    <SlideWrapper eyebrow="Novo painel" title="Três KPIs para orientar a gestão" subtitle="Poucos indicadores, cada um respondendo uma pergunta operacional diferente." footer="Fonte: Controle Diário de Aproveitamento da Frota Julho_26.xlsx">
      <div className="story-page">
        <motion.section
          className="story-section"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18 }}>
            {kpis.map((kpi, index) => (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 30, padding: 24, boxShadow: '0 17px 50px rgba(129,0,27,.08)' }}
              >
                <span style={{ color: kpi.color, fontWeight: 950, letterSpacing: '.12em', fontSize: 13 }}>KPI {kpi.index}</span>
                <h3 style={{ color: ink, fontSize: 25, margin: '10px 0 0', letterSpacing: '-0.04em' }}>{kpi.title}</h3>
                <strong style={{ display: 'block', color: kpi.color, fontSize: 44, lineHeight: 1, marginTop: 18, letterSpacing: '-0.06em' }}>{kpi.value}</strong>
                <div style={{ marginTop: 18, padding: '12px 13px', borderRadius: 16, background: soft, color: ink, fontWeight: 850 }}>{kpi.formula}</div>
                <p style={{ color: muted, fontWeight: 730, lineHeight: 1.42, margin: '13px 0 0' }}>{kpi.helper}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="story-section"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, .8fr)', gap: 18 }}>
            <div style={{ background: 'linear-gradient(135deg, #fff, #fff1f4)', border: `1px solid ${line}`, borderRadius: 30, padding: 26 }}>
              <span className="pill">Conclusão</span>
              <h3 style={{ color: ink, fontSize: 30, margin: '14px 0 8px', letterSpacing: '-0.04em' }}>O terceiro passa a ser consequência, não a única régua.</h3>
              <p style={{ color: muted, fontWeight: 750, fontSize: 18, lineHeight: 1.5, margin: 0 }}>
                A gestão deve acompanhar se a frota própria aumenta produção, absorve uma parcela maior da demanda e quais unidades combinam baixa produtividade com alta participação de Terceiros.
              </p>
            </div>

            <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 30, padding: 24 }}>
              <img src="/assets/logo-predilecta.png" alt="Predilecta" style={{ width: 135, maxHeight: 72, objectFit: 'contain' }} />
              <strong style={{ display: 'block', color: ink, fontSize: 21, marginTop: 18 }}>Qualidade da base</strong>
              <p style={{ color: muted, fontWeight: 730, lineHeight: 1.42, margin: '8px 0 0' }}>
                {dataNotes.length ? dataNotes.join(' ') : 'Nenhuma divergência relevante foi identificada nas consolidações usadas pelos slides.'}
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </SlideWrapper>
  );
}
