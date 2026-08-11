import { motion } from 'framer-motion';
import { SlideWrapper } from '../components/layout/SlideWrapper';

const ink = '#2e1a20';
const muted = '#7c6570';
const line = '#f1dce2';
const soft = '#fff1f4';
const blue = '#2563eb';
const red = '#da0d0d';
const orange = '#f59e0b';

export function SlideCapa() {
  return (
    <SlideWrapper
      title="Produtividade da Frota"
      subtitle="Demanda, produção própria e apoio de terceiros"
      footer="Dashboard Operacional Predilecta · Julho/2026"
    >
      <div
        style={{
          minHeight: 620,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.08fr) minmax(360px, 0.92fr)',
          gap: 28,
          alignItems: 'center',
        }}
      >
        <div>
          <span className="pill">Apresentação executiva</span>
          <h2
            style={{
              margin: '18px 0 16px',
              maxWidth: 760,
              color: ink,
              fontSize: 'clamp(42px, 5vw, 76px)',
              lineHeight: 0.98,
              letterSpacing: '-0.065em',
            }}
          >
            Estamos extraindo o máximo dos ativos?
          </h2>
          <p
            style={{
              margin: 0,
              maxWidth: 720,
              color: muted,
              fontSize: 21,
              fontWeight: 720,
              lineHeight: 1.5,
            }}
          >
            O foco deixa de ser apenas “quanto usamos de terceiros” e passa a ser “quanto a frota própria está produzindo diante da demanda”.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginTop: 30 }}>
            {[
              ['Demanda', 'Quanto precisa ser transportado', orange],
              ['Frota', 'Quanto os ativos próprios entregam', blue],
              ['Apoio externo', 'Quanto complementa a operação', red],
            ].map(([title, helper, color], index) => (
              <motion.div
                key={String(title)}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: 0.08 * index }}
                style={{
                  background: '#fff',
                  border: `1px solid ${line}`,
                  borderRadius: 24,
                  padding: 18,
                  boxShadow: '0 14px 42px rgba(129, 0, 27, 0.08)',
                }}
              >
                <span style={{ width: 12, height: 12, borderRadius: 999, display: 'inline-block', background: color }} />
                <strong style={{ display: 'block', color: ink, fontSize: 20, marginTop: 10 }}>{title}</strong>
                <small style={{ display: 'block', color: muted, fontWeight: 760, lineHeight: 1.35, marginTop: 5 }}>{helper}</small>
              </motion.div>
            ))}
          </div>
        </div>

        <div
          style={{
            minHeight: 500,
            borderRadius: 38,
            border: `1px solid ${line}`,
            background: `radial-gradient(circle at 72% 20%, rgba(245,158,11,.18), transparent 30%), linear-gradient(145deg, #fff, ${soft})`,
            position: 'relative',
            overflow: 'hidden',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 24px 70px rgba(129, 0, 27, 0.11)',
          }}
        >
          <motion.div
            animate={{ rotate: [0, 5, 0, -5, 0], y: [0, -12, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 245,
              height: 245,
              borderRadius: 56,
              display: 'grid',
              placeItems: 'center',
              background: 'rgba(255,255,255,.92)',
              boxShadow: '0 30px 90px rgba(37,99,235,.16)',
              border: '1px solid rgba(255,255,255,.88)',
            }}
          >
            <img src="/assets/logo-predilecta.png" alt="Predilecta" style={{ width: 150, objectFit: 'contain' }} />
          </motion.div>

          <div
            style={{
              position: 'absolute',
              left: 26,
              right: 26,
              bottom: 26,
              padding: '18px 20px',
              borderRadius: 24,
              background: 'rgba(255,255,255,.82)',
              border: `1px solid ${line}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <strong style={{ color: ink, fontSize: 21 }}>Nova pergunta de gestão</strong>
            <p style={{ color: muted, fontWeight: 760, margin: '6px 0 0', lineHeight: 1.4 }}>
              Terceiros continuam necessários. O objetivo é garantir que o ativo próprio entregue produção compatível com sua presença na operação.
            </p>
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
}
