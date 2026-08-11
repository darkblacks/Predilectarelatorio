import { ChevronLeft, ChevronRight, Download, FileSpreadsheet } from 'lucide-react';

interface TopMenuProps {
  index: number;
  total: number;
  labels: string[];
  onGoTo: (index: number) => void;
}

const DATA_FILE = '/data/Controle%20Di%C3%A1rio%20de%20Aproveitamento%20da%20Frota%20Julho_26.xlsx';

export function TopMenu({ index, total, labels, onGoTo }: TopMenuProps) {
  return (
    <nav className="top-menu">
      <div className="top-menu__brand">
        <img src="/assets/logo-predilecta.png" alt="Predilecta" />
        <div>
          <strong>Predilecta</strong>
          <span>Produtividade da frota</span>
        </div>
      </div>

      <div className="top-menu__slides" aria-label="Navegação dos slides" style={{ justifyContent: 'flex-start', overflowX: 'auto', scrollbarWidth: 'thin' }}>
        {labels.map((label, itemIndex) => (
          <button key={label} className={itemIndex === index ? 'active' : ''} onClick={() => onGoTo(itemIndex)} style={{ padding: '7px 10px' }}>
            <span>{itemIndex + 1}</span>
            <em>{label}</em>
          </button>
        ))}
      </div>

      <div className="top-menu__actions">
        <a href={DATA_FILE} download title="Baixar XLSX usado no dashboard">
          <FileSpreadsheet size={18} />
        </a>
        <button onClick={() => onGoTo(Math.max(0, index - 1))} disabled={index === 0}>
          <ChevronLeft size={18} />
        </button>
        <strong>{index + 1}/{total}</strong>
        <button onClick={() => onGoTo(Math.min(total - 1, index + 1))} disabled={index === total - 1}>
          <ChevronRight size={18} />
        </button>
        <a href={DATA_FILE} download className="download-label">
          <Download size={16} /> Dados
        </a>
      </div>
    </nav>
  );
}
