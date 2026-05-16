import { cn } from '@lib/utils';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  /** Big number in the center. */
  centerValue?: string | number;
  /** Caption under the center value. */
  centerLabel?: string;
  size?: number;
  className?: string;
}

/**
 * Conic-gradient donut chart with a center inset. Faithful to the demo's
 * inline-styled donut (CS Order Split, Admin Revenue Split).
 */
export function DonutChart({
  slices,
  centerValue,
  centerLabel,
  size = 110,
  className,
}: DonutChartProps) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  const stops = slices
    .map((s) => {
      const start = (acc / total) * 100;
      acc += s.value;
      const end = (acc / total) * 100;
      return `${s.color} ${start}% ${end}%`;
    })
    .join(', ');

  const inner = Math.max(0, size - 36);

  return (
    <div className={cn('flex items-center gap-5', className)}>
      <div
        role="img"
        aria-label="Donut chart"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `conic-gradient(${stops})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
        }}
      >
        <div
          style={{
            width: inner,
            height: inner,
            background: 'var(--color-navy-mid)',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.18)',
          }}
        >
          {centerValue !== undefined ? (
            <span className="font-sans text-[22px] font-extrabold leading-none text-text">
              {centerValue}
            </span>
          ) : null}
          {centerLabel ? (
            <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted mt-1">
              {centerLabel}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: s.color }}
                aria-hidden
              />
              <span className="text-[12.5px] text-text-muted font-medium">{s.label}</span>
            </div>
            <span className="text-[13px] font-bold text-text">
              {Math.round((s.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
