import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  option: Record<string, unknown>;
  height?: number;
}

type LegendSelected = Record<string, boolean>;

type PercentSeries = {
  name?: string;
  data?: unknown[];
  custom?: {
    recalculatePercent?: boolean;
    rawValues?: number[];
  };
  [key: string]: unknown;
};

const brNumber = new Intl.NumberFormat('pt-BR');

function pct(value: number) {
  return `${value.toFixed(1).replace('.', ',')}%`;
}

function isPercentSeries(series: PercentSeries) {
  return series.custom?.recalculatePercent === true && Array.isArray(series.custom.rawValues);
}

function getLegendSelected(option: Record<string, unknown>): LegendSelected {
  if (Array.isArray(option.legend)) {
    return option.legend.reduce<LegendSelected>((acc, item) => ({
      ...acc,
      ...(((item as Record<string, unknown>).selected as LegendSelected | undefined) ?? {}),
    }), {});
  }

  return ((option.legend as Record<string, unknown> | undefined)?.selected as LegendSelected | undefined) ?? {};
}

function buildPercentTooltip(params: unknown) {
  const items = Array.isArray(params) ? params : [params];
  const visibleItems = items.filter((item) => {
    if (!item || typeof item !== 'object') return false;
    const param = item as { data?: { value?: number } };
    return typeof param.data?.value === 'number';
  });

  if (!visibleItems.length) return '';

  const first = visibleItems[0] as { axisValueLabel?: string; name?: string };
  const title = first.axisValueLabel ?? first.name ?? '';
  const lines = visibleItems.map((item) => {
    const param = item as {
      marker?: string;
      seriesName?: string;
      data?: { value?: number; rawValue?: number; fullPercent?: number };
    };
    const value = Number(param.data?.value ?? 0);
    const fullPercent = Number(param.data?.fullPercent ?? 0);
    const rawValue = Number(param.data?.rawValue ?? 0);

    return `${param.marker ?? ''}${param.seriesName ?? ''}: <strong>${pct(value)}</strong> filtrado<br/><span style="padding-left:16px">${pct(fullPercent)} do total · ${brNumber.format(rawValue)} viagens</span>`;
  });

  return [`<strong>${title}</strong>`, ...lines].join('<br/>');
}

function recalculateVisiblePercent(option: Record<string, unknown>, selected: LegendSelected): Record<string, unknown> {
  const optionSeries = Array.isArray(option.series) ? (option.series as PercentSeries[]) : [];
  const percentSeries = optionSeries.filter(isPercentSeries);

  if (!percentSeries.length) return option;

  const defaultSelected = getLegendSelected(option);
  const effectiveSelected = { ...defaultSelected, ...selected };
  const maxLength = Math.max(...percentSeries.map((series) => series.custom?.rawValues?.length ?? 0));
  const fullTotals = Array.from({ length: maxLength }, (_, index) =>
    percentSeries.reduce((sum, series) => sum + Number(series.custom?.rawValues?.[index] ?? 0), 0)
  );
  const visibleTotals = Array.from({ length: maxLength }, (_, index) =>
    percentSeries.reduce((sum, series) => {
      if (series.name && effectiveSelected[series.name] === false) return sum;
      return sum + Number(series.custom?.rawValues?.[index] ?? 0);
    }, 0)
  );

  const legend = Array.isArray(option.legend)
    ? option.legend.map((item) => ({
        ...(item as Record<string, unknown>),
        selected: {
          ...(((item as Record<string, unknown>).selected as LegendSelected | undefined) ?? {}),
          ...effectiveSelected,
        },
      }))
    : {
        ...((option.legend as Record<string, unknown> | undefined) ?? {}),
        selected: {
          ...(((option.legend as Record<string, unknown> | undefined)?.selected as LegendSelected | undefined) ?? {}),
          ...effectiveSelected,
        },
      };

  return {
    ...option,
    legend,
    tooltip: {
      ...((option.tooltip as Record<string, unknown> | undefined) ?? {}),
      formatter: buildPercentTooltip,
    },
    series: optionSeries.map((series) => {
      if (!isPercentSeries(series)) return series;

      const rawValues = series.custom?.rawValues ?? [];
      return {
        ...series,
        data: rawValues.map((rawValue, index) => {
          const visibleTotal = visibleTotals[index] ?? 0;
          const fullTotal = fullTotals[index] ?? 0;
          return {
            value: visibleTotal > 0 ? (rawValue / visibleTotal) * 100 : 0,
            rawValue,
            fullPercent: fullTotal > 0 ? (rawValue / fullTotal) * 100 : 0,
          };
        }),
      };
    }),
  };
}

export function ChartPanel({ title, subtitle, option, height = 360 }: ChartPanelProps) {
  const [legendSelected, setLegendSelected] = useState<LegendSelected>({});
  const chartOption = useMemo(
    () => recalculateVisiblePercent(option, legendSelected),
    [option, legendSelected]
  );

  return (
    <section className="chart-panel">
      <div className="chart-panel__header">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <ReactECharts
        option={chartOption}
        style={{ height, width: '100%' }}
        notMerge
        lazyUpdate
        onEvents={{
          legendselectchanged: (params: { selected?: LegendSelected }) => {
            setLegendSelected(params.selected ?? {});
          },
        }}
      />
    </section>
  );
}
