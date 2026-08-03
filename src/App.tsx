import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TopMenu } from './components/layout/TopMenu';
import { useWorkbookData } from './hooks/useWorkbookData';
import { SlideCapa } from './slides/SlideCapa';
import { SlideResultado } from './slides/SlideResultado';
import { SlideEvolucao } from './slides/SlideEvolucao';
import { SlidePlanoAcao } from './slides/SlidePlanoAcao';
import { SlideAgradecimento } from './slides/SlideAgradecimento';
import { getMonthKeys, previousMonthKey } from './utils/metrics';

const labels = ['Apresentação', 'Resultado', 'Evolução', 'Plano de ação', 'Agradecimento'];

function Loading() {
  return (
    <div className="loading-screen">
      <img src="./assets/logo-predilecta.png" alt="Predilecta" />
      <span>Carregando dados do XLSX...</span>
    </div>
  );
}

export default function App() {
  const [index, setIndex] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('');
  const {
    loading,
    error,
    monthly,
    daily,
    metaTerceiros,
    loadLocalFile,
    sourceName,
  } = useWorkbookData();

  const monthKeys = useMemo(() => getMonthKeys(monthly), [monthly]);

  useEffect(() => {
    if (!monthKeys.length) return;
    if (!selectedMonth || !monthKeys.includes(selectedMonth)) {
      setSelectedMonth(monthKeys[monthKeys.length - 1]);
    }
  }, [monthKeys, selectedMonth]);

  const previousMonth = useMemo(
    () => (selectedMonth ? previousMonthKey(monthKeys, selectedMonth) : undefined),
    [monthKeys, selectedMonth],
  );

  const slides = useMemo(
    () =>
      selectedMonth
        ? [
            <SlideCapa
              key="capa"
              rows={monthly}
              selectedMonth={selectedMonth}
              previousMonth={previousMonth}
              meta={metaTerceiros}
            />,
            <SlideResultado
              key="resultado"
              rows={monthly}
              selectedMonth={selectedMonth}
              previousMonth={previousMonth}
              meta={metaTerceiros}
            />,
            <SlideEvolucao
              key="evolucao"
              rows={daily}
              selectedMonth={selectedMonth}
              meta={metaTerceiros}
            />,
            <SlidePlanoAcao
              key="plano"
              rows={monthly}
              selectedMonth={selectedMonth}
              previousMonth={previousMonth}
              meta={metaTerceiros}
            />,
            <SlideAgradecimento
              key="agradecimento"
              rows={monthly}
              selectedMonth={selectedMonth}
              meta={metaTerceiros}
            />,
          ]
        : [],
    [monthly, daily, selectedMonth, previousMonth, metaTerceiros],
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        setIndex((current) => Math.min(labels.length - 1, current + 1));
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        setIndex((current) => Math.max(0, current - 1));
      }
      if (event.key === 'Home') setIndex(0);
      if (event.key === 'End') setIndex(labels.length - 1);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [index, selectedMonth]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="loading-screen loading-screen--error">
        <img src="./assets/logo-predilecta.png" alt="Predilecta" />
        <strong>Não foi possível ler a planilha</strong>
        <span>{error}</span>
        <p>
          Confirme as abas <b>Resultado</b>, <b>Evolução</b> e <b>Caminhoes</b> ou substitua o arquivo em
          <code> public/data/predilecta_banco_dados_com_caminhoes.xlsx</code>.
        </p>
      </div>
    );
  }

  if (!selectedMonth || !slides.length) return <Loading />;

  return (
    <div className="app-shell">
      <TopMenu
        index={index}
        total={slides.length}
        labels={labels}
        onGoTo={setIndex}
        monthKeys={monthKeys}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        onLoadFile={loadLocalFile}
        sourceName={sourceName}
      />
      <AnimatePresence mode="wait">{slides[index]}</AnimatePresence>
    </div>
  );
}
