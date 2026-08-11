import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TopMenu } from './components/layout/TopMenu';
import { SlideCapa } from './slides/SlideCapa';
import { SlidePergunta } from './slides/SlidePergunta';
import { SlideJunhoJulho } from './slides/SlideJunhoJulho';
import { SlideProdutividadeUnidades } from './slides/SlideProdutividadeUnidades';
import { SlideMatrizProdutividade } from './slides/SlideMatrizProdutividade';
import { SlidePicosOperacao } from './slides/SlidePicosOperacao';
import { SlideOportunidades } from './slides/SlideOportunidades';
import { SlideKPIs } from './slides/SlideKPIs';
import { useProductivityWorkbook } from './slides/useProductivityWorkbook';

const labels = [
  'Produtividade',
  'Pergunta',
  'Junho × Julho',
  'Por fábrica',
  'Matriz',
  'Picos',
  'Oportunidades',
  'KPIs',
];

function Loading() {
  return (
    <div className="loading-screen">
      <img src="/assets/logo-predilecta.png" alt="Predilecta" />
      <span>Carregando Controle Diário de Aproveitamento da Frota Julho_26.xlsx...</span>
    </div>
  );
}

export default function App() {
  const [index, setIndex] = useState(0);

  const {
    loading,
    error,
    june,
    july,
    units,
    daily,
    dailyByUnit,
    groupVehicles,
    metaTerceiros,
    dataNotes,
  } = useProductivityWorkbook();

  const slides = useMemo(
    () => [
      <SlideCapa key="capa" />,
      <SlidePergunta key="pergunta" meta={metaTerceiros} june={june} july={july} units={units} />,
      <SlideJunhoJulho key="junho-julho" june={june} july={july} />,
      <SlideProdutividadeUnidades key="produtividade-unidades" units={units} dataNotes={dataNotes} />,
      <SlideMatrizProdutividade key="matriz" units={units} />,
      <SlidePicosOperacao key="picos" daily={daily} dailyByUnit={dailyByUnit} />,
      <SlideOportunidades key="oportunidades" units={units} />,
      <SlideKPIs key="kpis" july={july} groupVehicles={groupVehicles} meta={metaTerceiros} dataNotes={dataNotes} />,
    ],
    [june, july, units, daily, dailyByUnit, groupVehicles, metaTerceiros, dataNotes]
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
      <TopMenu index={index} total={slides.length} labels={labels} onGoTo={setIndex} />
      <AnimatePresence mode="wait">{slides[index]}</AnimatePresence>
    </div>
  );
}
