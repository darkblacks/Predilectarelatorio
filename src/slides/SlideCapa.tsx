import { SlideWrapper } from '../components/layout/SlideWrapper';

interface SlideCapaProps { meta: number }

export function SlideCapa({ meta }: SlideCapaProps) {
  return (
    <SlideWrapper title="Dashboard Operacional" subtitle="Grupo Predilecta · Maio x Junho/2026" footer="Use as setas do teclado ou o scroll do mouse para navegar pelos slides.">
      <div className="cover-grid cover-grid--simple">
        <div className="cover-logo-card">
          <img src="/assets/logo-predilecta.png" alt="Predilecta" />
        </div>
        <div className="cover-copy">
          <span className="pill">Apresentação executiva</span>
          <h2>Redução de terceiros</h2>
          <p>
            Apresentação construída a partir do arquivo XLSX do projeto, com foco no resultado consolidado e na evolução diária da operação.
          </p>
          <div className="cover-note">Meta do indicador de terceiros: {Math.round(meta * 100)}%.</div>
        </div>
      </div>
    </SlideWrapper>
  );
}
