import { motion } from 'framer-motion';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import { CURRENT_MONTH_LONG_LABEL } from './useProductivityWorkbook';

const ink = '#2e1a20';
const muted = '#7c6570';
const line = '#f1dce2';
const soft = '#fff1f4';
const blue = '#2563eb';

export function SlideAgradecimento() {
  return (
    <SlideWrapper
      eyebrow="Encerramento"
      title="Obrigado"
      subtitle="Dashboard Operacional · Grupo Predilecta"
      footer={`Dashboard Operacional Predilecta · ${CURRENT_MONTH_LONG_LABEL}`}
    >
      <div
        style={{
          minHeight: 560,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            width: 'min(900px, 100%)',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #fff, #fff1f4)',
            border: `1px solid ${line}`,
            borderRadius: 38,
            padding: '54px 44px',
            boxShadow: '0 24px 70px rgba(129, 0, 27, 0.10)',
          }}
        >
          <div
            style={{
              width: 180,
              height: 100,
              margin: '0 auto 24px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: 28,
              background: '#fff',
              border: `1px solid ${line}`,
              boxShadow: '0 12px 34px rgba(129, 0, 27, 0.08)',
            }}
          >
            <img
              src="/assets/logo-predilecta.png"
              alt="Predilecta"
              style={{ width: 118, maxHeight: 66, objectFit: 'contain' }}
            />
          </div>

          <span
            style={{
              display: 'inline-flex',
              padding: '7px 12px',
              borderRadius: 999,
              background: soft,
              color: blue,
              fontWeight: 950,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
            }}
          >
            Produtividade da Frota
          </span>

          <h2
            style={{
              color: ink,
              fontSize: 46,
              margin: '18px 0 10px',
              letterSpacing: '-0.055em',
            }}
          >
            Obrigado pela atenção.
          </h2>

          <p
            style={{
              color: muted,
              fontSize: 19,
              lineHeight: 1.55,
              fontWeight: 730,
              maxWidth: 680,
              margin: '0 auto',
            }}
          >
            Acompanhar a evolução da demanda, da produção própria e da utilização de Terceiros permite direcionar as decisões para onde existe oportunidade real de ganho operacional.
          </p>
        </motion.div>
      </div>
    </SlideWrapper>
  );
}
