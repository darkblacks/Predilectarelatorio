import { SlideWrapper } from '../components/layout/SlideWrapper';
import { MonthlyRow } from '../types';
import {
  brPercent,
  monthLabelTitle,
  share,
  totalByMonth,
  transportadoraTotals,
} from '../utils/metrics';

interface SlideAgradecimentoProps {
  rows: MonthlyRow[];
  selectedMonth: string;
  meta: number;
}

export function SlideAgradecimento({ rows, selectedMonth, meta }: SlideAgradecimentoProps) {
  const totals = transportadoraTotals(rows, selectedMonth);
  const total = totalByMonth(rows, selectedMonth);
  const thirdShare = share(totals.Terceiro, total);

  return (
    <SlideWrapper
      title="Obrigado"
      subtitle={`Dashboard operacional · Grupo Predilecta · ${monthLabelTitle(selectedMonth)}`}
      footer="Arquivo XLSX disponível no botão Dados. Use o botão de planilha para testar outra base localmente."
    >
      <div className="thanks-card">
        <img src="./assets/logo-predilecta.png" alt="Predilecta" />
        <h2>Meta de terceiros: {Math.round(meta * 100)}%</h2>
        <p>
          {monthLabelTitle(selectedMonth)} encerrou com <strong>{brPercent.format(thirdShare)}</strong> de terceiros.
          A apresentação agora troca mês e dados sem alterar o código, mantendo a identidade visual original do projeto.
        </p>
      </div>
    </SlideWrapper>
  );
}
