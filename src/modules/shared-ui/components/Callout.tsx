import { Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@lib/utils';

export type CalloutTone = 'info' | 'amber' | 'green' | 'crimson';

interface CalloutProps {
  tone?: CalloutTone;
  className?: string;
  children: ReactNode;
}

const ICON_BY_TONE: Record<CalloutTone, typeof Info> = {
  info: Info,
  amber: AlertTriangle,
  green: CheckCircle2,
  crimson: AlertTriangle,
};

export function Callout({ tone = 'info', className, children }: CalloutProps) {
  const Icon = ICON_BY_TONE[tone];
  return (
    <div className={cn('callout', tone, className)} role="status">
      <Icon aria-hidden />
      <span>{children}</span>
    </div>
  );
}
