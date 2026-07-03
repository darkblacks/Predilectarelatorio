import { SlideWrapper } from '../components/layout/SlideWrapper';

interface SlideAgradecimentoProps { meta: number }

export function SlideAgradecimento({ meta }: SlideAgradecimentoProps) {
  return (
    <SlideWrapper title="Obrigado" subtitle="Dashboard operacional · Grupo Predilecta" footer="Arquivo XLSX disponível no botão Dados.">
      <div className="thanks-card">
        <img src="/assets/logo-predilecta.png" alt="Predilecta" />
        <h2>Meta de terceiros: {Math.round(meta * 100)}%</h2>
        <p>
          Muito Obrigado por acompanhar nossa Analise.</p><p> Predilecta Feito com Amor
        </p>
      </div>
    </SlideWrapper>
  );
}
