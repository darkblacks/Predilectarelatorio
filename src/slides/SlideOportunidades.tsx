import { motion } from 'framer-motion';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import { UnitSummary } from './useProductivityWorkbook';

interface SlideOportunidadesProps { units: UnitSummary[] }

const PRODUCTIVITY_REF = 10;
const THIRD_PARTY_REF = 0.38;
const ink = '#2e1a20';
const muted = '#7c6570';
const line = '#f1dce2';
const red = '#da0d0d';
const orange = '#f59e0b';
const green = '#37a169';
const blue = '#2563eb';

const pct = (value: number) => `${(value * 100).toFixed(1).replace('.', ',')}%`;
const dec1 = (value: number) => value.toFixed(1).replace('.', ',');

function UnitChip({ item, color }: { item: UnitSummary; color: string }) {
  return (
    <div style={{ border: `1px solid ${color}32`, background: `${color}0d`, borderRadius: 18, padding: '13px 14px' }}>
      <strong style={{ display: 'block', color: ink, fontSize: 18 }}>{item.unit}</strong>
      <span style={{ display: 'block', color: muted, fontWeight: 800, marginTop: 4 }}>
        {dec1(item.productivity)} viagens/veículo · {pct(item.thirdPartyShare)} de Terceiros
      </span>
    </div>
  );
}

export function SlideOportunidades({ units }: SlideOportunidadesProps) {
  const priority = units.filter((i) => i.productivity < PRODUCTIVITY_REF && i.thirdPartyShare >= THIRD_PARTY_REF);
  const context = units.filter((i) => i.productivity >= PRODUCTIVITY_REF && i.thirdPartyShare >= THIRD_PARTY_REF);
  const reference = units.filter((i) => i.productivity >= PRODUCTIVITY_REF && i.thirdPartyShare < THIRD_PARTY_REF);
  const monitor = units.filter((i) => i.productivity < PRODUCTIVITY_REF && i.thirdPartyShare < THIRD_PARTY_REF);

  const sections = [
    {
      label: 'Prioridade de investigação',
      color: red,
      items: priority,
      message: 'Menor produção por ativo combinada com participação de Terceiros relevante. Aqui vale entender manutenção, rota, tempo de ciclo, programação e posicionamento.',
    },
    {
      label: 'Entender característica operacional',
      color: orange,
      items: context,
      message: 'A frota já produz em nível mais alto, mas a participação de Terceiros permanece elevada. O cenário pode indicar demanda acima da capacidade própria daquela base.',
    },
    {
      label: 'Referência de produtividade',
      color: green,
      items: reference,
      message: 'Boa produção por ativo com menor participação de Terceiros. Serve como referência para comparação de processo, não como meta universal.',
    },
    {
      label: 'Acompanhar',
      color: blue,
      items: monitor,
      message: 'Produção por ativo abaixo da referência, porém sem alta participação de Terceiros. Pode ser simplesmente uma unidade com menor demanda.',
    },
  ];

  return (
    <SlideWrapper eyebrow="Oportunidades" title="Onde vale investigar primeiro?" subtitle="Não perguntamos mais apenas quem passou de 25%. Cruzamos produção do ativo com participação de Terceiros.">
      <div className="story-page">
        <motion.section
          className="story-section"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18 }}>
            {sections.map((section) => (
              <div key={section.label} style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 30, padding: 22, boxShadow: '0 15px 44px rgba(129,0,27,.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 999, background: section.color }} />
                  <strong style={{ color: ink, fontSize: 23, letterSpacing: '-0.03em' }}>{section.label}</strong>
                </div>
                <p style={{ color: muted, fontWeight: 730, lineHeight: 1.4, margin: '9px 0 14px' }}>{section.message}</p>
                <div style={{ display: 'grid', gridTemplateColumns: section.items.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr', gap: 9 }}>
                  {section.items.length ? section.items.map((item) => <UnitChip key={item.unit} item={item} color={section.color} />) : (
                    <span style={{ color: muted, fontWeight: 760 }}>Nenhuma unidade neste quadrante.</span>
                  )}
                </div>
              </div>
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
          <div style={{ padding: '22px 24px', borderRadius: 28, background: '#fff1f4', border: `1px solid ${line}` }}>
            <strong style={{ color: red, fontSize: 22 }}>Importante: isso não prova ociosidade.</strong>
            <p style={{ color: muted, fontWeight: 750, lineHeight: 1.45, margin: '7px 0 0' }}>
              A base disponível não informa posição do caminhão, manutenção hora a hora, espera no cliente ou compatibilidade de rota. O cruzamento serve para direcionar a investigação operacional, não para afirmar que uma contratação específica poderia ter sido evitada.
            </p>
          </div>
        </motion.section>
      </div>
    </SlideWrapper>
  );
}
