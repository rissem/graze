import * as React from "react"
import { LuX } from "react-icons/lu"

export interface CloseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg"
}

export const CloseButton = React.forwardRef<
  HTMLButtonElement,
  CloseButtonProps
>(function CloseButton(
  { size = "md", className = "", children, ...props },
  ref,
) {
  const sizeClasses = {
    sm: "h-6 w-6 text-sm",
    md: "h-8 w-8 text-base",
    lg: "h-10 w-10 text-lg",
  }

  return (
    <button
      type="button"
      aria-label="Close"
      ref={ref}
      className={`rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 bg-transparent hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children ?? <LuX />}
    </button>
  )
})
