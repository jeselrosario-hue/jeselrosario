import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[transform,box-shadow,background-color,border-color] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-navy aria-disabled:cursor-not-allowed aria-disabled:opacity-80 [&_svg]:size-5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-sky text-navy shadow-[0_0_40px_-8px_var(--color-sky)] hover:-translate-y-0.5 hover:shadow-[0_0_56px_-6px_var(--color-sky)]',
        glass: 'border border-white/25 bg-white/10 text-white backdrop-blur-md hover:-translate-y-0.5 hover:border-sky/70 hover:bg-white/15',
      },
      size: { md: 'px-6 text-base', lg: 'px-8 text-lg min-h-14', sm: 'px-4 text-sm' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type Props = React.ComponentProps<'a'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }

export function Button({ className, variant, size, asChild, ...props }: Props) {
  const Comp = asChild ? Slot : 'a'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
