import * as React from 'react'
import { cn } from '../../lib/utils'

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-white/70 bg-white/72 px-2.5 py-1 text-xs font-black text-slate-700 shadow-sm backdrop-blur-md',
        className,
      )}
      {...props}
    />
  )
}
