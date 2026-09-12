import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shopee focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[linear-gradient(135deg,#EE4D2D,#FF7A45)] text-white shadow-brand hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(238,77,45,0.34)]',
        secondary:
          'bg-white/82 text-slate-900 shadow-soft ring-1 ring-white/70 hover:-translate-y-0.5 hover:bg-white',
        outline:
          'border border-white/70 bg-white/64 text-slate-800 shadow-soft backdrop-blur-md hover:-translate-y-0.5 hover:border-shopee/40 hover:text-shopee',
        ghost: 'text-slate-600 hover:bg-white/70 hover:text-slate-950',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-5 text-base',
        icon: 'h-10 w-10 px-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
)

Button.displayName = 'Button'
