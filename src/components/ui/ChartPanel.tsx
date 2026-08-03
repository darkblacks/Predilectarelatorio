import ReactECharts from 'echarts-for-react';

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  option: Record<string, unknown>;
  height?: number;
}

export function ChartPanel({ title, subtitle, option, height = 360 }: ChartPanelProps) {
  return (
    <section className="chart-panel">
      <div className="chart-panel__header">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <ReactECharts option={option} style={{ height, width: '100%' }} notMerge lazyUpdate />
    </section>
  );
}
