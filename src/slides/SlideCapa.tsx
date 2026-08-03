import { SlideWrapper } from '../components/layout/SlideWrapper';
import { MonthlyRow } from '../types';
import {
  brPercent,
  monthLabelTitle,
  share,
  totalByMonth,
  transportadoraTotals,
} from '../utils/metrics';

interface SlideCapaProps {
  rows: MonthlyRow[];
  selectedMonth: string;
  previousMonth?: string;
  meta: number;
}

export function SlideCapa({ rows, selectedMonth, previousMonth, meta }: SlideCapaProps) {
  const totals = transportadoraTotals(rows, selectedMonth);
  const total = totalByMonth(rows, selectedMonth);
  const thirdShare = share(totals.Terceiro, total);
  const gap = thirdShare - meta;

  const previousShare = previousMonth
    ? share(
        transportadoraTotals(rows, previousMonth).Terceiro,
        totalByMonth(rows, previousMonth),
      )
    : undefined;

  const improvement = previousShare === undefined ? undefined : previousShare - thirdShare;
  const reached = thirdShare <= meta;

  return (
    <SlideWrapper
      title="Dashboard Operacional"
      subtitle={`Grupo Predilecta · ${previousMonth ? `${monthLabelTitle(previousMonth)} x ` : ''}${monthLabelTitle(selectedMonth)}`}
      footer="Use o seletor de mês no topo, as setas do teclado ou o scroll do mouse para navegar."
    >
      <div className="cover-grid cover-grid--simple">
        <div className="cover-logo-card">
          <img src="./assets/logo-predilecta.png" alt="Predilecta" />
        </div>
        <div className="cover-copy">
          <span className="pill">Apresentação executiva</span>
          <h2>Redução de terceiros</h2>
          <p>
            A apresentação mantém a identidade do projeto original e passa a ler qualquer mês
            disponível na planilha padronizada.
          </p>
          <div className={`cover-note ${reached ? 'cover-note--good' : ''}`}>
            {monthLabelTitle(selectedMonth)} fechou em {brPercent.format(thirdShare)} de terceiros.
            {' '}
            {reached
              ? `Meta de ${Math.round(meta * 100)}% atingida.`
              : `${brPercent.format(gap)} acima da meta de ${Math.round(meta * 100)}%.`}
            {improvement !== undefined && improvement > 0
              ? ` Houve melhora de ${(improvement * 100).toFixed(1).replace('.', ',')} p.p. contra o mês anterior.`
              : ''}
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
}
