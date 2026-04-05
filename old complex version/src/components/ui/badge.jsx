import React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-slate-900 text-white',
  outline: 'border border-slate-200 bg-white text-slate-700',
  secondary: 'bg-slate-100 text-slate-700',
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant] ?? variants.default,
        className
      )}
      {...props}
    />
  );
}
