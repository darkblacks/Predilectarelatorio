import { motion } from 'framer-motion';
import { ChartPanel } from '../components/ui/ChartPanel';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import { UnitSummary } from './useProductivityWorkbook';

interface SlideProdutividadeUnidadesProps { units: UnitSummary[]; dataNotes: string[] }

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

const pct = (value: number) => `${(value * 100).toFixed(1).replace('.', ',')}%`;
const dec1 = (value: number) => value.toFixed(1).replace('.', ',');

export function SlideProdutividadeUnidades({ units, dataNotes }: SlideProdutividadeUnidadesProps) {
  const ordered = [...units].sort((a, b) => b.productivity - a.productivity);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: Array<{ name: string; value: number }>) => {
        const item = params?.[0];
        return item ? `<strong>${item.name}</strong><br/>${dec1(Number(item.value))} viagens por veículo` : '';
      },
    },
    grid: { left: 100, right: 30, top: 20, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { formatter: (value: number) => dec1(value) }, splitLine: { lineStyle: { color: '#f3e2e6' } } },
    yAxis: { type: 'category', data: ordered.map((item) => item.unit), axisLine: { lineStyle: { color: '#ead5db' } } },
    series: [{
      name: 'Viagens por veículo',
      type: 'bar',
      data: ordered.map((item) => item.productivity),
      itemStyle: { color: blue, borderRadius: [0, 10, 10, 0] },
      label: { show: true, position: 'right', formatter: (params: { value: number }) => dec1(Number(params.value)), color: ink, fontWeight: 900 },
    }],
  };

  return (
    <SlideWrapper eyebrow="Produtividade observada" title="Quanto cada fábrica está extraindo de seus veículos?" subtitle="Viagens da frota própria ÷ quantidade de veículos informada na base de julho.">
      <div className="story-page">
        <motion.section className="story-section" {...reveal}>
          <div className="charts-grid charts-grid--two" style={{ alignItems: 'start' }}>
            <ChartPanel title="Viagens por veículo" subtitle="Comparação da produção observada entre unidades." option={option} height={420} />

            <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 30, padding: 20, boxShadow: '0 18px 56px rgba(129,0,27,.09)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.25fr .7fr .7fr .85fr .85fr', gap: 8, padding: '10px 11px', background: soft, borderRadius: 14, color: muted, fontWeight: 950, fontSize: 11, textTransform: 'uppercase' }}>
                <span>Unidade</span><span>Próprio</span><span>Veíc.</span><span>Viag./veíc.</span><span>Terceiro</span>
              </div>
              <div style={{ display: 'grid', gap: 7, marginTop: 8 }}>
                {ordered.map((item) => (
                  <div key={item.unit} style={{ display: 'grid', gridTemplateColumns: '1.25fr .7fr .7fr .85fr .85fr', gap: 8, alignItems: 'center', padding: '11px', border: `1px solid ${line}`, borderRadius: 14 }}>
                    <strong style={{ color: ink }}>{item.unit}</strong>
                    <span style={{ color: muted, fontWeight: 850 }}>{item.frota}</span>
                    <span style={{ color: muted, fontWeight: 850 }}>{item.vehicles || '—'}</span>
                    <strong style={{ color: blue, fontSize: 19 }}>{dec1(item.productivity)}</strong>
                    <strong style={{ color: item.thirdPartyShare >= 0.38 ? red : muted }}>{pct(item.thirdPartyShare)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div style={{ padding: '20px 22px', borderRadius: 26, border: `1px solid ${line}`, background: soft }}>
            <strong style={{ color: ink, fontSize: 22 }}>Leitura correta do indicador</strong>
            <p style={{ color: muted, fontWeight: 740, lineHeight: 1.45, margin: '7px 0 0' }}>
              Não estamos dizendo quantas viagens o caminhão “deveria” fazer. Estamos comparando a produção realmente observada entre bases para identificar onde vale aprofundar a investigação.
            </p>
            {dataNotes.length > 0 && (
              <p style={{ color: red, fontWeight: 800, lineHeight: 1.4, margin: '10px 0 0' }}>
                Atenção à qualidade da base: {dataNotes.join(' ')}
              </p>
            )}
          </div>
        </motion.section>
      </div>
    </SlideWrapper>
  );
}
