import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        safe: "border-transparent bg-risk-safe/20 text-risk-safe border-risk-safe/50",
        medium: "border-transparent bg-risk-medium/20 text-risk-medium border-risk-medium/50",
        high: "border-transparent bg-risk-high/20 text-risk-high border-risk-high/50",
        severityInfo: "border-transparent bg-severity-info/20 text-severity-info border-severity-info/50",
        severityLow: "border-transparent bg-severity-low/20 text-severity-low border-severity-low/50",
        severityMedium: "border-transparent bg-severity-medium/20 text-severity-medium border-severity-medium/50",
        severityHigh: "border-transparent bg-severity-high/20 text-severity-high border-severity-high/50",
        severityCritical: "border-transparent bg-severity-critical/20 text-severity-critical border-severity-critical/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
