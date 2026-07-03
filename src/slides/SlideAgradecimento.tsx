import { SlideWrapper } from '../components/layout/SlideWrapper';

interface SlideAgradecimentoProps { meta: number }

export function SlideAgradecimento({ meta }: SlideAgradecimentoProps) {
  return (
    <SlideWrapper title="Obrigado" subtitle="Dashboard operacional · Grupo Predilecta" footer="Arquivo XLSX disponível no botão Dados.">
      <div className="thanks-card">
        <img src="/assets/logo-predilecta.png" alt="Predilecta" />
        <h2>Meta de terceiros: {Math.round(meta * 100)}%</h2>
        <p>
          Esta apresentação foi organizada em quatro páginas: Apresentação, Resultado, Evolução e Agradecimento, utilizando a planilha do projeto como base de dados.
        </p>
      </div>
    </SlideWrapper>
  );
}
