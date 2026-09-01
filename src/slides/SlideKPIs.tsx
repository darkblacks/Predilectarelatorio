import { motion } from 'framer-motion';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import { CURRENT_MONTH_LONG_LABEL, MonthSummary } from './useProductivityWorkbook';

interface SlideKPIsProps {
  july: MonthSummary;
  groupVehicles: number;
  meta: number;

  /*
   * Mantemos essa prop porque o App.tsx atual ainda envia dataNotes.
   * Ela não é utilizada nesta página.
   */
  dataNotes?: string[];
}

const ink = '#2e1a20';
const muted = '#7c6570';
const line = '#f1dce2';
const soft = '#fff1f4';

const blue = '#2563eb';
const red = '#da0d0d';
const orange = '#f59e0b';

const pct = (value: number) =>
  `${(value * 100)
    .toFixed(1)
    .replace('.', ',')}%`;

const dec1 = (value: number) =>
  value
    .toFixed(1)
    .replace('.', ',');

export function SlideKPIs({
  july,
  groupVehicles,
  meta,
}: SlideKPIsProps) {
  /*
   * Mês atual:
   * Próprio = Frota + Transpredi
   *
   * A regra de classificação já está aplicada
   * na leitura dos indicadores.
   * Não precisamos explicar isso no slide.
   */

  const productivity =
    groupVehicles > 0
      ? july.own / groupVehicles
      : 0;

  const operationalTotal = july.own + july.thirdParty;

  const ownShare =
    operationalTotal > 0
      ? july.own / operationalTotal
      : 0;

    const thirdPartyVolume =
    july.thirdParty;

  const thirdPartyShare =
    operationalTotal > 0
      ? thirdPartyVolume / operationalTotal
      : 0;

  const kpis = [
    {
      index: '01',
      title: 'Produtividade do Próprio',
      value: `${dec1(productivity)} viag./veíc.`,
      formula: 'Viagens Próprio ÷ Veículos',
      helper:
        'Mede quanto de produção observada estamos extraindo dos ativos disponíveis.',
      color: blue,
    },

    {
      index: '02',
      title: 'Participação de Próprio',
      value: pct(ownShare),
      formula: 'Viagens Próprio ÷ Base sem FOB',
      helper:
        'Mostra quanto da demanda total foi absorvida pela frota própria.',
      color: orange,
    },

    {
      index: '03',
      title: 'Participação de Terceiros',
      value: pct(thirdPartyShare),
      formula: 'Viagens Terceiro ÷ Base sem FOB',
      helper:
        `A meta de ${Math.round(
          meta * 100
        )}% permanece como referência e deve ser analisada junto com a produtividade da frota.`,
      color: red,
    },
  ];

  return (
    <SlideWrapper
      eyebrow="Novo painel"
      title="Três KPIs para orientar a gestão"
      subtitle="Poucos indicadores, cada um respondendo uma pergunta operacional diferente."
      footer={`Dashboard Operacional Predilecta · ${CURRENT_MONTH_LONG_LABEL}`}
    >
      <div className="story-page">

        {/* KPIs */}
        <motion.section
          className="story-section"
          initial={{
            opacity: 0,
            y: 26,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.45,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(3, minmax(0, 1fr))',
              gap: 18,
            }}
          >
            {kpis.map((kpi, index) => (
              <motion.div
                key={kpi.title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                }}
                style={{
                  background: '#fff',
                  border: `1px solid ${line}`,
                  borderRadius: 30,
                  padding: 24,
                  boxShadow:
                    '0 17px 50px rgba(129,0,27,.08)',
                }}
              >
                <span
                  style={{
                    color: kpi.color,
                    fontWeight: 950,
                    letterSpacing: '.12em',
                    fontSize: 13,
                  }}
                >
                  KPI {kpi.index}
                </span>

                <h3
                  style={{
                    color: ink,
                    fontSize: 25,
                    margin: '10px 0 0',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {kpi.title}
                </h3>

                <strong
                  style={{
                    display: 'block',
                    color: kpi.color,
                    fontSize: 44,
                    lineHeight: 1,
                    marginTop: 18,
                    letterSpacing: '-0.06em',
                  }}
                >
                  {kpi.value}
                </strong>

                <div
                  style={{
                    marginTop: 18,
                    padding: '12px 13px',
                    borderRadius: 16,
                    background: soft,
                    color: ink,
                    fontWeight: 850,
                  }}
                >
                  {kpi.formula}
                </div>

                <p
                  style={{
                    color: muted,
                    fontWeight: 730,
                    lineHeight: 1.42,
                    margin: '13px 0 0',
                  }}
                >
                  {kpi.helper}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CONCLUSÃO */}
        <motion.section
          className="story-section"
          initial={{
            opacity: 0,
            y: 26,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.45,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'minmax(0, 1.25fr) minmax(300px, .75fr)',
              gap: 18,
            }}
          >

            {/* TEXTO */}
            <div
              style={{
                background:
                  'linear-gradient(135deg, #fff, #fff1f4)',
                border: `1px solid ${line}`,
                borderRadius: 30,
                padding: 26,
              }}
            >
              <span className="pill">
                Conclusão
              </span>

              <h3
                style={{
                  color: ink,
                  fontSize: 30,
                  margin: '14px 0 8px',
                  letterSpacing: '-0.04em',
                }}
              >
                O terceiro passa a ser consequência,
                não a única régua.
              </h3>

              <p
                style={{
                  color: muted,
                  fontWeight: 750,
                  fontSize: 18,
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                A gestão deve acompanhar se a frota
                própria aumenta produção, quanto da
                demanda consegue absorver e quais
                unidades combinam baixa produtividade
                com alta participação de Terceiros.
              </p>
            </div>

            {/* LOGO */}
            <div
              style={{
                background: '#fff',
                border: `1px solid ${line}`,
                borderRadius: 30,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <img
                src="/assets/logo-predilecta.png"
                alt="Predilecta"
                style={{
                  width: 145,
                  maxHeight: 75,
                  objectFit: 'contain',
                }}
              />

              <strong
                style={{
                  display: 'block',
                  color: ink,
                  fontSize: 24,
                  marginTop: 18,
                }}
              >
                {CURRENT_MONTH_LONG_LABEL}
              </strong>

              <p
                style={{
                  color: muted,
                  fontWeight: 730,
                  lineHeight: 1.42,
                  margin: '7px 0 0',
                }}
              >
                Produtividade, participação própria
                e utilização de terceiros.
              </p>
            </div>

          </div>
        </motion.section>

      </div>
    </SlideWrapper>
  );
}
