import { MetricCardProps } from '../../types';

export function MetricCard({ label, value, helper, tone = 'neutral' }: MetricCardProps) {
  return (
    <div className={`metric-card metric-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </div>
  );
}
