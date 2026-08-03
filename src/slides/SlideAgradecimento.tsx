import { SlideWrapper } from '../components/layout/SlideWrapper';
import { MonthlyRow } from '../types';
import {
  brPercent,
  monthLabelTitle,
  operationalTotals,
  share,
} from '../utils/metrics';

interface SlideAgradecimentoProps {
  rows: MonthlyRow[];
  selectedMonth: string;
  meta: number;
}

export function SlideAgradecimento({ rows, selectedMonth, meta }: SlideAgradecimentoProps) {
  const totals = operationalTotals(rows, selectedMonth);
  const thirdShare = share(totals.terceirosOperacional, totals.baseOperacional);

  return (
    <SlideWrapper
      title="Obrigado"
      subtitle={`Dashboard operacional · Grupo Predilecta · ${monthLabelTitle(selectedMonth)}`}
      footer="Frota x Terceiros · Transpredi classificada como terceiros a partir de julho/2026."
    >
      <div className="thanks-card">
        <img src="./assets/logo-predilecta.png" alt="Predilecta" />
        <h2>Meta de terceiros: {Math.round(meta * 100)}%</h2>
        <p>
          {monthLabelTitle(selectedMonth)} encerrou com <strong>{brPercent.format(thirdShare)}</strong> de terceiros
          sobre a base operacional. O FOB permanece apresentado separadamente.
        </p>
      </div>
    </SlideWrapper>
  );
}
