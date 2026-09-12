import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '../../lib/utils'

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center py-2', className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2.5 w-full grow overflow-hidden rounded-full bg-slate-200/80 shadow-inner">
      <SliderPrimitive.Range className="absolute h-full bg-[linear-gradient(90deg,#EE4D2D,#FFB199,#06B6D4)]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-white bg-shopee shadow-brand outline-none transition-transform focus-visible:ring-2 focus-visible:ring-shopee focus-visible:ring-offset-2 hover:scale-110" />
  </SliderPrimitive.Root>
))

Slider.displayName = SliderPrimitive.Root.displayName
