import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Primary CTA — cyan pill with glow on hover
        default:
          'rounded-[100px] bg-primary text-primary-foreground shadow-sm hover:bg-[#292928] hover:text-white hover:shadow-glow',
        destructive:
          'rounded-[100px] bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'rounded-[100px] border border-input bg-background hover:bg-muted hover:text-foreground',
        secondary:
          'rounded-[100px] bg-secondary text-secondary-foreground hover:bg-[#292928] hover:text-white',
        ghost:
          'rounded-lg hover:bg-muted hover:text-foreground',
        link:
          'rounded-none text-primary underline-offset-4 hover:underline',
        gradient:
          'rounded-[100px] gradient-brand text-white shadow-sm hover:shadow-glow hover:opacity-95',
        dark:
          'rounded-[100px] bg-[#021f26] text-white hover:bg-[#292928]',
      },
      size: {
        default: 'h-11 px-6 py-2.5 text-sm',
        sm:      'h-8 px-4 text-xs',
        lg:      'h-13 px-8 text-base',
        xl:      'h-14 px-10 text-base',
        icon:    'h-10 w-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
