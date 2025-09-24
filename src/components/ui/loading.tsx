import { cn } from "@/lib/utils"

interface LoadingProps {
  className?: string
  text?: string
  fullScreen?: boolean
}

export function Loading({ className, text = "Generating your travel photo...", fullScreen = true }: LoadingProps) {
  const content = (
    <>
      <div className="relative">
        <svg
          className="w-12 h-12 text-primary animate-paper-plane"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
        <div className="absolute inset-0 w-12 h-12 border-2 border-primary/20 rounded-full animate-ping" />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {text}
        </p>
      )}
    </>
  )

  if (fullScreen) {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center space-y-4 bg-background", className)}>
        {content}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      {content}
    </div>
  )
}

export function LoadingOverlay({ children, isLoading, loadingText }: {
  children: React.ReactNode
  isLoading: boolean
  loadingText?: string
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Loading text={loadingText} fullScreen={false} />
        </div>
      )}
    </div>
  )
}