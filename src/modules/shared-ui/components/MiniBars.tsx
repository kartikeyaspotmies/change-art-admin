import { cn } from '@lib/utils';

export interface MiniBarsItem {
  label: string;
  value: number;
  max?: number;
  color?: string;
  display?: string;
}

interface MiniBarsProps {
  items: MiniBarsItem[];
  /** Implicit shared max — defaults to the largest value among items. */
  globalMax?: number;
  className?: string;
}

/**
 * Horizontal bar chart — used by analytics panels (rejection reasons,
 * category breakdown). Width is computed as value / max.
 */
export function MiniBars({ items, globalMax, className }: MiniBarsProps) {
  const ceiling = globalMax ?? Math.max(...items.map((i) => i.max ?? i.value), 1);
  return (
    <div className={cn('mini-bars', className)}>
      {items.map((b) => {
        const pct = Math.min(100, Math.round((b.value / ceiling) * 100));
        return (
          <div key={b.label} className="mini-bar">
            <div className="mb-label">{b.label}</div>
            <div className="mb-track">
              <div
                className="mb-fill"
                style={{ width: `${pct}%`, background: b.color ?? 'var(--color-crimson)' }}
              />
            </div>
            <div className="mb-val">{b.display ?? b.value}</div>
          </div>
        );
      })}
    </div>
  );
}
