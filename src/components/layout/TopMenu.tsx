import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import { ChangeEvent, useRef } from 'react';
import { monthLabelTitle } from '../../utils/metrics';

interface TopMenuProps {
  index: number;
  total: number;
  labels: string[];
  onGoTo: (index: number) => void;
  monthKeys: string[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  onLoadFile: (file: File) => Promise<void>;
  sourceName: string;
}

const DATA_FILE = './data/predilecta_banco_dados_com_caminhoes.xlsx';

export function TopMenu({
  index,
  total,
  labels,
  onGoTo,
  monthKeys,
  selectedMonth,
  onSelectMonth,
  onLoadFile,
  sourceName,
}: TopMenuProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) await onLoadFile(file);
    event.target.value = '';
  }

  return (
    <nav className="top-menu">
      <div className="top-menu__brand">
        <img src="./assets/logo-predilecta.png" alt="Predilecta" />
        <div>
          <strong>Predilecta</strong>
          <span>Apresentação operacional</span>
        </div>
      </div>

      <div className="top-menu__slides" aria-label="Navegação dos slides">
        {labels.map((label, itemIndex) => (
          <button
            key={label}
            className={itemIndex === index ? 'active' : ''}
            onClick={() => onGoTo(itemIndex)}
          >
            <span>{itemIndex + 1}</span>
            <em>{label}</em>
          </button>
        ))}
      </div>

      <div className="top-menu__actions">
        <label className="month-picker" title="Escolher mês da apresentação">
          <span>Mês</span>
          <select value={selectedMonth} onChange={(event: ChangeEvent<HTMLSelectElement>) => onSelectMonth(event.target.value)}>
            {monthKeys.map((key) => (
              <option key={key} value={key}>
                {monthLabelTitle(key)}
              </option>
            ))}
          </select>
        </label>

        <input
          ref={fileInput}
          className="visually-hidden"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          title={`Trocar a planilha usada no dashboard. Atual: ${sourceName}`}
        >
          <Upload size={18} />
        </button>

        <a href={DATA_FILE} download title="Baixar XLSX usado no dashboard">
          <FileSpreadsheet size={18} />
        </a>

        <button onClick={() => onGoTo(Math.max(0, index - 1))} disabled={index === 0}>
          <ChevronLeft size={18} />
        </button>
        <strong>{index + 1}/{total}</strong>
        <button
          onClick={() => onGoTo(Math.min(total - 1, index + 1))}
          disabled={index === total - 1}
        >
          <ChevronRight size={18} />
        </button>

        <a href={DATA_FILE} download className="download-label">
          <Download size={16} /> Dados
        </a>
      </div>
    </nav>
  );
}
