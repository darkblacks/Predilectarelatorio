import { motion } from 'framer-motion';
import { SlideWrapper } from '../components/layout/SlideWrapper';

const reveal = {
  initial: { opacity: 0, x: 46 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 },
};

const colorProprio = '#2563eb';
const colorTerceiro = '#da0d0d';
const colorFob = '#f59e0b';
const muted = '#7c6570';
const ink = '#2e1a20';
const line = '#f1dce2';
const soft = '#fff1f4';

const actions = [
  {
    what: 'Contratar motoristas extras',
    why: 'Reduzir indisponibilidade por interjornada e permitir novo empenho no retorno.',
    where: 'SD, SF, MM e SS',
    who: 'Transportes + RH',
    when: 'Curto prazo',
    how: 'Mapear veículos parados por falta de motorista e acionar banco de motoristas extras.',
    howMuch: 'Comparar custo do motorista extra contra custo evitado de terceiros.',
  },
  {
    what: 'Carregar na data prevista',
    why: 'Não perder oportunidade de executar mais serviços com o mesmo veículo.',
    where: 'Bases Predilecta e unidades de maior atuação',
    who: 'Operação de Base + Programação',
    when: 'Diário',
    how: 'Criar rotina de conferência dos veículos empenhados e prioridade de carregamento.',
    howMuch: '% de veículos carregados dentro da janela.',
  },
  {
    what: 'Reduzir permanência nos clientes',
    why: 'Liberar o veículo mais rápido para retorno e nova rota.',
    where: 'Clientes com maior tempo de descarga',
    who: 'Comercial + Transportes',
    when: 'Semanal',
    how: 'Alinhar janelas de descarga e escalar gargalos recorrentes com o cliente.',
    howMuch: 'Horas médias de permanência por cliente.',
  },
  {
    what: 'Monitorar veículos nas bases',
    why: 'Atacar gargalos antes que virem perda de viagem.',
    where: 'Bases próprias',
    who: 'Torre de Controle + Operação',
    when: 'Contínuo',
    how: 'Acompanhar status, tempo parado, motivo da parada e próxima ação responsável.',
    howMuch: 'Veículos parados acima do limite definido.',
  },
  {
    what: 'Otimizar pontos de coleta',
    why: 'Agilizar liberação e antecipar retorno para base.',
    where: 'Pontos de coleta críticos',
    who: 'Programação + Coleta',
    when: 'Semanal',
    how: 'Priorizar coletas por janela, agrupar rotas compatíveis e medir tempo de espera.',
    howMuch: 'Tempo médio de espera na coleta.',
  },
  {
    what: 'Acompanhar retorno dos motoristas',
    why: 'Melhorar descanso, disponibilidade e produtividade.',
    where: 'Rotas de retorno para base',
    who: 'Torre de Controle + Liderança de Frota',
    when: 'Diário',
    how: 'Monitorar retorno após descarga e orientar prioridade quando houver nova programação.',
    howMuch: 'Tempo entre descarga e retorno à base.',
  },
  {
    what: 'Reforçar manutenção preventiva',
    why: 'Aumentar disponibilidade e reduzir corretivas emergenciais.',
    where: 'Frota própria',
    who: 'Manutenção + Transportes',
    when: 'Mensal',
    how: 'Programar preventivas fora dos picos e antecipar corretivas conhecidas.',
    howMuch: 'Disponibilidade da frota e % de corretivas emergenciais.',
  },
  {
    what: 'Mapear ofensores de produtividade',
    why: 'Identificar causas que ainda limitam o uso da frota própria.',
    where: 'Unidades, clientes, coletas e manutenção',
    who: 'Gestão de Transportes',
    when: 'Quinzenal',
    how: 'Criar ranking de ofensores por impacto, responsável e prazo.',
    howMuch: 'Ganho em % e p.p. no uso interno; redução de terceiros.',
  },
];

function VisualCube({ label, tone = colorProprio }: { label: string; tone?: string }) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: 280,
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        borderRadius: 36,
        border: `1px solid ${line}`,
        background: `radial-gradient(circle at 70% 25%, rgba(245, 158, 11, 0.18), transparent 30%), linear-gradient(135deg, #fff, ${soft})`,
        boxShadow: '0 18px 56px rgba(129, 0, 27, 0.10)',
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: 240,
          height: 240,
          borderRadius: 44,
          background: `linear-gradient(135deg, ${tone}, ${colorFob})`,
          opacity: 0.14,
          filter: 'blur(1px)',
        }}
      />

      <motion.div
        animate={{ y: [0, -14, 0], rotateZ: [-5, 4, -5] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 158,
          height: 158,
          transformStyle: 'preserve-3d',
          borderRadius: 32,
          background: `linear-gradient(145deg, rgba(255,255,255,0.96), ${tone}22)`,
          boxShadow: `0 26px 70px rgba(37, 99, 235, 0.20), inset -22px -22px 42px rgba(46, 26, 32, 0.13), inset 18px 18px 30px rgba(255,255,255,0.78)`,
          border: '1px solid rgba(255,255,255,0.72)',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 12,
            borderRadius: 24,
            background: `radial-gradient(circle at 50% 34%, ${tone}33, transparent 62%)`,
            opacity: 0.85,
          }}
        />

        <img
          src="/assets/logo-predilecta.png"
          alt="Predilecta"
          style={{
            width: 88,
            maxHeight: 58,
            objectFit: 'contain',
            position: 'relative',
            zIndex: 1,
            filter: 'drop-shadow(0 10px 16px rgba(46, 26, 32, 0.18))',
          }}
        />
      </motion.div>

      <div
        style={{
          position: 'absolute',
          right: 22,
          bottom: 22,
          maxWidth: 260,
          background: 'rgba(255,255,255,0.78)',
          border: `1px solid ${line}`,
          borderRadius: 24,
          padding: '16px 18px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <strong style={{ display: 'block', color: ink, fontSize: 18, letterSpacing: '-0.03em' }}>{label}</strong>
        <span style={{ color: muted, fontWeight: 800, fontSize: 13 }}>foco visual para guiar a leitura</span>
      </div>
    </div>
  );
}

function MiniMetric({ label, value, helper, color }: { label: string; value: string; helper: string; color: string }) {
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${line}`,
        borderRadius: 26,
        padding: 20,
        boxShadow: '0 14px 42px rgba(129, 0, 27, 0.08)',
      }}
    >
      <span style={{ display: 'block', color: muted, fontWeight: 900, textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.08em' }}>
        {label}
      </span>
      <strong style={{ display: 'block', marginTop: 8, color, fontSize: 38, lineHeight: 1, letterSpacing: '-0.06em' }}>{value}</strong>
      <small style={{ display: 'block', marginTop: 8, color: muted, fontWeight: 780, lineHeight: 1.35 }}>{helper}</small>
    </div>
  );
}

function ActionCard({ item, index }: { item: (typeof actions)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.38, delay: index * 0.04 }}
      style={{
        background: '#fff',
        border: `1px solid ${line}`,
        borderRadius: 26,
        padding: 18,
        boxShadow: '0 14px 42px rgba(129, 0, 27, 0.08)',
      }}
    >
      <strong style={{ display: 'block', color: ink, fontSize: 20, letterSpacing: '-0.03em', marginBottom: 10 }}>
        {item.what}
      </strong>

      <div style={{ display: 'grid', gridTemplateColumns: '82px 1fr', gap: '7px 10px', color: muted, fontWeight: 740, lineHeight: 1.32, fontSize: 14 }}>
        <b style={{ color: colorTerceiro }}>Por quê</b><span>{item.why}</span>
        <b>Onde</b><span>{item.where}</span>
        <b>Quem</b><span>{item.who}</span>
        <b>Quando</b><span>{item.when}</span>
        <b>Como</b><span>{item.how}</span>
        <b>Indicador</b><span>{item.howMuch}</span>
      </div>
    </motion.div>
  );
}

export function SlidePlanoAcao() {
  return (
    <SlideWrapper
      eyebrow="Plano de ação"
      title="Plano de ação 5W2H"
      subtitle="Ações para sustentar a redução de terceiros e aumentar a produtividade da frota própria."
    >
      <div className="story-page">
        <motion.section className="story-section" {...reveal}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.05fr) minmax(360px, 0.95fr)',
              gap: 24,
              alignItems: 'stretch',
            }}
          >
            <div>
              <div className="story-section__heading" style={{ marginBottom: 16 }}>
                <span className="pill">Justificativa</span>
                <h2>Resultado alcançado e causa operacional</h2>
                <p>
                  Na unidade Predilecta, a contratação de terceiros saiu de 40,4% em maio para 27,6% em junho.
                  A meta era chegar a 25,0%; o fechamento ficou próximo do alvo, mas foi impactado pelo jogo do Brasil em 29/06,
                  quando parte dos veículos não descarregou em tempo hábil para retornar e ser empenhada em nova viagem.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
                <MiniMetric label="Meta Predilecta" value="25,0%" helper="alvo de terceiros" color={colorTerceiro} />
                <MiniMetric label="Resultado Predilecta" value="27,6%" helper="fechamento de terceiros em junho" color={colorTerceiro} />
                <MiniMetric label="Ganho interno grupo" value="7,3%" helper="+7,3 p.p. | 134 serviços a mais" color={colorProprio} />
                <MiniMetric label="Redução terceiros grupo" value="8,1%" helper="-8,1 p.p. | 197 contratações a menos" color={colorTerceiro} />
              </div>
            </div>

            <VisualCube label="29/06 concentrou o principal gargalo de ciclo" tone={colorTerceiro} />
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.05fr) minmax(360px, 0.95fr)',
              gap: 24,
              alignItems: 'stretch',
            }}
          >
            <div>
              <div className="story-section__heading" style={{ marginBottom: 16 }}>
                <span className="pill">5W2H</span>
                <h2>Disponibilidade e programação</h2>
                <p>
                  Primeiro foco: aumentar a disponibilidade real da frota própria e evitar perda de janela. A leitura passa a ser operacional:
                  responsável, prazo, indicador e acompanhamento por rotina.
                </p>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                {actions.slice(0, 4).map((item, index) => (
                  <ActionCard key={item.what} item={item} index={index} />
                ))}
              </div>
            </div>

            <VisualCube label="Mais frota disponível, menos terceiro necessário" tone={colorProprio} />
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.05fr) minmax(360px, 0.95fr)',
              gap: 24,
              alignItems: 'stretch',
            }}
          >
            <div>
              <div className="story-section__heading" style={{ marginBottom: 16 }}>
                <span className="pill">Sustentação</span>
                <h2>Tempo de ciclo e ofensores</h2>
                <p>
                  Segundo foco: reduzir tempo parado, acelerar retorno e proteger disponibilidade com manutenção planejada.
                  A melhoria deve ser acompanhada semanalmente para não depender de ação pontual.
                </p>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                {actions.slice(4).map((item, index) => (
                  <ActionCard key={item.what} item={item} index={index} />
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <VisualCube label="Ciclo mais rápido: descarga, coleta, retorno e manutenção" tone={colorFob} />

              <div
                style={{
                  background: soft,
                  border: `1px solid ${line}`,
                  borderRadius: 30,
                  padding: 22,
                }}
              >
                <strong style={{ color: ink, fontSize: 24, letterSpacing: '-0.03em' }}>
                  Indicadores de acompanhamento
                </strong>
                <p style={{ color: muted, fontWeight: 750, lineHeight: 1.45, margin: '10px 0 0' }}>
                  Acompanhar semanalmente: % de terceiros, % de próprio + Transpredi, serviços executados pela frota própria,
                  veículos indisponíveis, permanência no cliente, retorno à base e causas de perda de viagem.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </SlideWrapper>
  );
}
