import { SlideWrapper } from '../components/layout/SlideWrapper';
import { MonthlyRow } from '../types';
import {
  brPercent,
  monthLabelTitle,
  operationalTotals,
  share,
} from '../utils/metrics';

interface SlideCapaProps {
  rows: MonthlyRow[];
  selectedMonth: string;
  previousMonth?: string;
  meta: number;
}

export function SlideCapa({ rows, selectedMonth, previousMonth, meta }: SlideCapaProps) {
  const totals = operationalTotals(rows, selectedMonth);
  const thirdShare = share(totals.terceirosOperacional, totals.baseOperacional);
  const gap = thirdShare - meta;

  const previousShare = previousMonth
    ? (() => {
        const previous = operationalTotals(rows, previousMonth);
        return share(previous.terceirosOperacional, previous.baseOperacional);
      })()
    : undefined;

  const improvement = previousShare === undefined ? undefined : previousShare - thirdShare;
  const reached = thirdShare <= meta;

  return (
    <SlideWrapper
      title="Dashboard Operacional"
      subtitle={`Grupo Predilecta · ${previousMonth ? `${monthLabelTitle(previousMonth)} x ` : ''}${monthLabelTitle(selectedMonth)}`}
      footer="Indicador: Frota x Terceiros. O FOB é exibido à parte e não entra na base percentual."
    >
      <div className="cover-grid cover-grid--simple">
        <div className="cover-logo-card">
          <img src="./assets/logo-predilecta.png" alt="Predilecta" />
        </div>
        <div className="cover-copy">
          <span className="pill">Apresentação executiva</span>
          <h2>Frota contra terceiros</h2>
          <p>
            A partir de julho de 2026, os carregamentos da Transpredi passam a compor
            o grupo de terceiros. A meta permanece em 25% da base operacional.
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
