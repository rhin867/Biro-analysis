"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const variantStyles = {
  default: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-white/20 bg-transparent text-white hover:bg-white/10",
  secondary: "bg-white/10 text-white hover:bg-white/15",
  ghost: "text-white/70 hover:bg-white/10 hover:text-white",
  link: "text-blue-400 underline-offset-4 hover:underline",
}

const sizeStyles = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-12 rounded-xl px-8 text-base",
  icon: "h-10 w-10",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
