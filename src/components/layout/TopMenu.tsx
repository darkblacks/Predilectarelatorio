import { ChevronLeft, ChevronRight, Download, FileSpreadsheet } from 'lucide-react';

interface TopMenuProps {
  index: number;
  total: number;
  labels: string[];
  onGoTo: (index: number) => void;
}

const DATA_FILE = '/data/predilecta_banco_dados_frota.xlsx';

export function TopMenu({ index, total, labels, onGoTo }: TopMenuProps) {
  return (
    <nav className="top-menu">
      <div className="top-menu__brand">
        <img src="/assets/logo-predilecta.png" alt="Predilecta" />
        <div>
          <strong>Predilecta</strong>
          <span>Apresentação operacional</span>
        </div>
      </div>
      <div className="top-menu__slides" aria-label="Navegação dos slides">
        {labels.map((label, itemIndex) => (
          <button key={label} className={itemIndex === index ? 'active' : ''} onClick={() => onGoTo(itemIndex)}>
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
