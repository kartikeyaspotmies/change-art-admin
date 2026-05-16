import type { ReactNode } from 'react';

interface GreetingHeroProps {
  title: string;
  subtitle?: ReactNode;
  /** Render the localized date strip above the title. */
  showDate?: boolean;
  /** Optional right-side slot (e.g. range selector, primary action). */
  action?: ReactNode;
}

const DATE_FMT = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
});

export function GreetingHero({ title, subtitle, showDate = true, action }: GreetingHeroProps) {
  return (
    <header className="greeting-hero flex items-end justify-between gap-4 flex-wrap">
      <div>
        {showDate ? <div className="greeting-date">{DATE_FMT.format(new Date())}</div> : null}
        <h1 className="greeting-title">{title}</h1>
        {subtitle ? <p className="greeting-sub mt-1">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </header>
  );
}
