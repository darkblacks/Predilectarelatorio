import { motion } from 'framer-motion';
import { SlideWrapper } from '../components/layout/SlideWrapper';

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.45 },
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
    why: 'Reduzir a indisponibilidade por interjornada e permitir que o veículo seja empenhado no retorno.',
    where: 'SD, SF, MM e SS',
    who: 'Gestão de Transportes + RH',
    when: 'Curto prazo',
    how: 'Mapear veículos parados por falta de motorista, dimensionar necessidade por unidade e acionar banco de motoristas extras.',
    howMuch: 'Comparar custo do motorista extra contra custo evitado de terceiros.',
  },
  {
    what: 'Carregar veículos na data prevista',
    why: 'Evitar perda de oportunidade de executar mais serviços com o mesmo veículo.',
    where: 'Bases Predilecta e unidades de maior atuação',
    who: 'Operação de Base + Programação',
    when: 'Diário',
    how: 'Criar rotina de conferência dos veículos empenhados e travar prioridade de carregamento na janela planejada.',
    howMuch: 'Indicador: % de veículos carregados dentro da janela.',
  },
  {
    what: 'Reduzir permanência nos clientes',
    why: 'Liberar o veículo em menor tempo para retornar à rota e aumentar produtividade.',
    where: 'Clientes com maior tempo de descarga',
    who: 'Comercial + Transportes',
    when: 'Semanal',
    how: 'Atuar com comunicação comercial, alinhando janelas de descarga e escalonando gargalos recorrentes.',
    howMuch: 'Indicador: horas médias de permanência por cliente.',
  },
  {
    what: 'Monitorar veículos nas bases',
    why: 'Identificar gargalos de carregamento e descarregamento antes que virem perda de viagem.',
    where: 'Bases próprias',
    who: 'Torre de Controle + Operação',
    when: 'Contínuo',
    how: 'Acompanhar status dos veículos, tempo parado, motivo da parada e próxima ação responsável.',
    howMuch: 'Indicador: veículos parados há mais de X horas.',
  },
  {
    what: 'Otimizar pontos de coleta',
    why: 'Agilizar a liberação dos veículos e antecipar retorno para base.',
    where: 'Pontos de coleta críticos',
    who: 'Programação + Coleta',
    when: 'Semanal',
    how: 'Priorizar coletas por janela, agrupar rotas compatíveis e medir tempo de espera por ponto.',
    howMuch: 'Indicador: tempo médio de espera na coleta.',
  },
  {
    what: 'Acompanhar retorno dos motoristas',
    why: 'Melhorar descanso, disponibilidade e produtividade, preservando também o ganho do motorista.',
    where: 'Rotas de retorno para base',
    who: 'Torre de Controle + Liderança de Frota',
    when: 'Diário',
    how: 'Monitorar retorno após descarga, evitar desvios improdutivos e orientar prioridade de retorno quando houver nova programação.',
    howMuch: 'Indicador: tempo entre descarga e retorno à base.',
  },
  {
    what: 'Reforçar manutenção preventiva',
    why: 'Aumentar disponibilidade de frota e reduzir corretivas emergenciais.',
    where: 'Frota própria',
    who: 'Gestão de Manutenção + Transportes',
    when: 'Mensal',
    how: 'Programar preventivas fora dos picos, antecipar corretivas conhecidas e acompanhar veículos indisponíveis.',
    howMuch: 'Indicador: disponibilidade da frota e % de corretivas emergenciais.',
  },
  {
    what: 'Identificar ofensores de produtividade',
    why: 'Atacar as causas que impedem maior uso da frota própria.',
    where: 'Unidades, clientes, coletas e manutenção',
    who: 'Gestão de Transportes',
    when: 'Quinzenal',
    how: 'Criar lista de ofensores por impacto, responsável e prazo; revisar evolução em reunião de performance.',
    howMuch: 'Indicador: ganho em p.p. no uso interno e redução em p.p. de terceiros.',
  },
];

export function SlidePlanoAcao() {
  return (
    <SlideWrapper
      eyebrow="Plano de ação"
      title="Plano de ação 5W2H"
      subtitle="Ações para sustentar a redução de terceiros e aumentar a produtividade da frota própria."
    >
      <div className="story-page">
        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Justificativa</span>
            <h2>Resultado alcançado e causa operacional</h2>
            <p>
              A meta definida foi reduzir a contratação de terceiros de 40% para 25% no resultado da Predilecta.
              O resultado alcançado foi 28%, ficando próximo da meta, mas impactado pelo dia 29/06, quando o jogo
              do Brasil prejudicou o ciclo de descarga e retorno dos veículos para nova viagem.
            </p>
          </div>

          <div className="metric-grid metric-grid--3">
            <div className="metric-card metric-card--brand">
              <span>Meta de terceiros</span>
              <strong>25%</strong>
              <small>referência definida para a operação</small>
            </div>

            <div className="metric-card">
              <span>Resultado alcançado</span>
              <strong style={{ color: colorTerceiro }}>28%</strong>
              <small>impactado pelo gargalo operacional de 29/06</small>
            </div>

            <div className="metric-card">
              <span>Uso da frota própria</span>
              <strong style={{ color: colorProprio }}>+7 p.p.</strong>
              <small>134 serviços a mais com frota própria</small>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 18,
            }}
          >
            <div
              style={{
                background: '#fff',
                border: `1px solid ${line}`,
                borderRadius: 30,
                padding: 24,
                boxShadow: '0 18px 56px rgba(129, 0, 27, 0.10)',
              }}
            >
              <strong style={{ color: colorTerceiro, fontSize: 28, letterSpacing: '-0.04em' }}>
                -8 p.p. em terceiros
              </strong>
              <p style={{ color: muted, fontWeight: 750, lineHeight: 1.45, marginBottom: 0 }}>
                Representa 197 contratações a menos, com potencial de impacto econômico relevante para a operação.
              </p>
            </div>

            <div
              style={{
                background: '#fff',
                border: `1px solid ${line}`,
                borderRadius: 30,
                padding: 24,
                boxShadow: '0 18px 56px rgba(129, 0, 27, 0.10)',
              }}
            >
              <strong style={{ color: colorFob, fontSize: 28, letterSpacing: '-0.04em' }}>
                Evolução por unidade
              </strong>
              <p style={{ color: muted, fontWeight: 750, lineHeight: 1.45, marginBottom: 0 }}>
                Nas unidades com maior atuação, a evolução chega a aproximadamente 10 p.p. de melhoria no uso da frota
                própria e redução da contratação de terceiros.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">5W2H</span>
            <h2>Ações prioritárias</h2>
            <p>
              O plano abaixo transforma os pontos observados em ações executáveis, com responsável, prazo e indicador
              de acompanhamento.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 14,
            }}
          >
            {actions.slice(0, 4).map((item) => (
              <div
                key={item.what}
                style={{
                  background: '#fff',
                  border: `1px solid ${line}`,
                  borderRadius: 26,
                  padding: 18,
                  boxShadow: '0 14px 42px rgba(129, 0, 27, 0.08)',
                }}
              >
                <strong style={{ display: 'block', color: ink, fontSize: 20, letterSpacing: '-0.03em', marginBottom: 8 }}>
                  {item.what}
                </strong>
                <div style={{ display: 'grid', gap: 6, color: muted, fontWeight: 700, lineHeight: 1.35 }}>
                  <span><b>Por quê:</b> {item.why}</span>
                  <span><b>Onde:</b> {item.where}</span>
                  <span><b>Quem:</b> {item.who}</span>
                  <span><b>Quando:</b> {item.when}</span>
                  <span><b>Como:</b> {item.how}</span>
                  <span><b>Quanto/Indicador:</b> {item.howMuch}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Continuidade</span>
            <h2>Monitoramento e sustentação</h2>
            <p>
              A melhoria precisa ser acompanhada continuamente para não depender apenas de volume pontual ou ação isolada.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 14,
            }}
          >
            {actions.slice(4).map((item) => (
              <div
                key={item.what}
                style={{
                  background: '#fff',
                  border: `1px solid ${line}`,
                  borderRadius: 26,
                  padding: 18,
                  boxShadow: '0 14px 42px rgba(129, 0, 27, 0.08)',
                }}
              >
                <strong style={{ display: 'block', color: ink, fontSize: 20, letterSpacing: '-0.03em', marginBottom: 8 }}>
                  {item.what}
                </strong>
                <div style={{ display: 'grid', gap: 6, color: muted, fontWeight: 700, lineHeight: 1.35 }}>
                  <span><b>Por quê:</b> {item.why}</span>
                  <span><b>Onde:</b> {item.where}</span>
                  <span><b>Quem:</b> {item.who}</span>
                  <span><b>Quando:</b> {item.when}</span>
                  <span><b>Como:</b> {item.how}</span>
                  <span><b>Quanto/Indicador:</b> {item.howMuch}</span>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 18,
              background: soft,
              border: `1px solid ${line}`,
              borderRadius: 30,
              padding: 24,
            }}
          >
            <strong style={{ color: ink, fontSize: 24, letterSpacing: '-0.03em' }}>
              Indicadores de acompanhamento
            </strong>
            <p style={{ color: muted, fontWeight: 750, lineHeight: 1.45, marginBottom: 0 }}>
              Acompanhar semanalmente: % de terceiros, % de próprio + Transpredi, serviços executados por frota própria,
              veículos indisponíveis, tempo de permanência em cliente, tempo de retorno à base e causas de perda de viagem.
            </p>
          </div>
        </motion.section>
      </div>
    </SlideWrapper>
  );
}
