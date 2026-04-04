import React from 'react';
import { cn } from '@/lib/utils';

export const Card = React.forwardRef(function Card({ className, ...props }, ref) {
  return (
    <section
      ref={ref}
      className={cn('rounded-xl border border-slate-200 bg-white text-slate-950', className)}
      {...props}
    />
  );
});

export const CardHeader = React.forwardRef(function CardHeader({ className, ...props }, ref) {
  return <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
});

export const CardTitle = React.forwardRef(function CardTitle({ className, ...props }, ref) {
  return <h2 ref={ref} className={cn('font-semibold tracking-tight', className)} {...props} />;
});

export const CardDescription = React.forwardRef(function CardDescription(
  { className, ...props },
  ref
) {
  return <p ref={ref} className={cn('text-sm text-slate-500', className)} {...props} />;
});

export const CardContent = React.forwardRef(function CardContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />;
});
