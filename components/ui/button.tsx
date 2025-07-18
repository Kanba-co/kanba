import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary border border-input rounded-xl text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive rounded-xl text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input rounded-xl bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary rounded-xl text-secondary-foreground hover:bg-secondary/80",
        ghost: "rounded-xl hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 rounded-xl px-4 py-2 text-xs",
        xs: "h8 rounded-lg px-2 py-2 text-xs",
        sm: "h-9 rounded-xl px-2 text-xs",
        lg: "h-11 rounded-xl px-8 text-xs",
        icon: "h-10 rounded-lg px-3 w-10 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
