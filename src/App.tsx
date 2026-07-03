import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TopMenu } from './components/layout/TopMenu';
import { useWorkbookData } from './hooks/useWorkbookData';
import { SlideCapa } from './slides/SlideCapa';
import { SlideResultado } from './slides/SlideResultado';
import { SlideEvolucao } from './slides/SlideEvolucao';
import { SlidePlanoAcao } from './slides/SlidePlanoAcao';
import { SlideAgradecimento } from './slides/SlideAgradecimento';

const labels = ['Apresentação', 'Resultado', 'Evolução', 'Plano de ação', 'Agradecimento'];

function Loading() {
  return (
    <div className="loading-screen">
      <img src="/assets/logo-predilecta.png" alt="Predilecta" />
      <span>Carregando dados do XLSX...</span>
    </div>
  );
}

export default function App() {
  const [index, setIndex] = useState(0);

  const {
    loading,
    error,
    monthly,
    daily,
    metaTerceiros,
  } = useWorkbookData();

  const slides = useMemo(
    () => [
      <SlideCapa key="capa" meta={metaTerceiros} />,
      <SlideResultado key="resultado" rows={monthly} meta={metaTerceiros} />,
      <SlideEvolucao key="evolucao" rows={daily} meta={metaTerceiros} />,
      <SlidePlanoAcao key="plano-acao" />,
      <SlideAgradecimento key="agradecimento" meta={metaTerceiros} />,
    ],
    [monthly, daily, metaTerceiros]
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        setIndex((current) => Math.min(labels.length - 1, current + 1));
      }

      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        setIndex((current) => Math.max(0, current - 1));
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [index]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="loading-screen">
        <img src="/assets/logo-predilecta.png" alt="Predilecta" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <TopMenu
        index={index}
        total={slides.length}
        labels={labels}
        onGoTo={setIndex}
      />

      <AnimatePresence mode="wait">
        {slides[index]}
      </AnimatePresence>
    </div>
  );
}
