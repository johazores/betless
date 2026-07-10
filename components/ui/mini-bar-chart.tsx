'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/class-names';

export type BarChartPoint = {
  label: string;
  value: number;
};

type MiniBarChartProps = {
  data: BarChartPoint[];
  height?: number;
  className?: string;
  emptyMessage?: string;
  valueLabel?: string;
};

function formatShortDate(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function MiniBarChart({
  data,
  height = 144,
  className,
  emptyMessage = 'No activity in this period',
  valueLabel = 'registrations',
}: MiniBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxValue = useMemo(() => Math.max(...data.map((point) => point.value), 1), [data]);
  const total = useMemo(() => data.reduce((sum, point) => sum + point.value, 0), [data]);

  const axisLabels = useMemo(() => {
    if (data.length === 0) return [];
    if (data.length <= 3) return data.map((point) => point.label);
    const mid = Math.floor(data.length / 2);
    return [data[0].label, data[mid].label, data[data.length - 1].label];
  }, [data]);

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center rounded-xl border border-dashed border-line bg-surface-muted/50 px-4 py-10 text-sm text-ink-muted', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <p className="text-sm text-ink-muted">
          <span className="text-2xl font-semibold tabular-nums tracking-tight text-ink">{total.toLocaleString()}</span>
          {' '}total {valueLabel}
        </p>
        {hoveredIndex !== null ? (
          <p className="text-sm tabular-nums text-ink-muted">
            <span className="font-semibold text-ink">{data[hoveredIndex].value.toLocaleString()}</span>
            {' '}on {formatShortDate(data[hoveredIndex].label)}
          </p>
        ) : null}
      </div>

      <div
        className="relative flex items-end gap-[3px] rounded-xl border border-line bg-surface-muted/40 px-2 pb-2 pt-3"
        style={{ height: height + 16 }}
        role="img"
        aria-label={`Bar chart showing ${total} ${valueLabel} over ${data.length} days`}
      >
        {data.map((point, index) => {
          const barHeight =
            point.value === 0 ? 2 : Math.max(4, Math.round((point.value / maxValue) * height));
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={point.label}
              className="group relative flex h-full flex-1 flex-col justify-end"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
            >
              <div
                className={cn(
                  'w-full rounded-[3px] transition-all duration-150',
                  point.value > 0 ? 'bg-brand-500' : 'bg-line',
                  isHovered && point.value > 0 && 'bg-brand-600 shadow-sm',
                )}
                style={{ height: barHeight }}
                title={`${formatShortDate(point.label)}: ${point.value}`}
                tabIndex={0}
                role="img"
                aria-label={`${formatShortDate(point.label)}: ${point.value} ${valueLabel}`}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-xs tabular-nums text-ink-muted">
        {axisLabels.map((label) => (
          <span key={label}>{formatShortDate(label)}</span>
        ))}
      </div>

      {total === 0 ? (
        <p className="mt-3 text-center text-sm text-ink-muted">{emptyMessage}</p>
      ) : null}
    </div>
  );
}
