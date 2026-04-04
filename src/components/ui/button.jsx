import React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-slate-900 text-white hover:bg-slate-800',
  outline: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
};

export const Button = React.forwardRef(function Button(
  { className, type = 'button', variant = 'default', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant] ?? variants.default,
        className
      )}
      {...props}
    />
  );
});
