"use client"

import { useState, useEffect } from "react"
import { ImageIcon, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  fallbackClassName?: string
  onLoad?: () => void
  onError?: () => void
}

export function ImageWithFallback({ src, alt, className, fallbackClassName, onLoad, onError }: ImageWithFallbackProps) {
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">("loading")
  const [imageSrc, setImageSrc] = useState(src)

  useEffect(() => {
    setImageState("loading")
    setImageSrc(src)
  }, [src])

  const handleLoad = () => {
    setImageState("loaded")
    onLoad?.()
  }

  const handleError = () => {
    setImageState("error")
    onError?.()
  }

  if (imageState === "error") {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/20 border border-dashed border-muted-foreground/20",
          fallbackClassName,
        )}
      >
        <div className="text-center p-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Failed to load image</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {imageState === "loading" && (
        <div className={cn("absolute inset-0 flex items-center justify-center bg-muted/20 animate-pulse", className)}>
          <ImageIcon className="h-8 w-8 text-muted-foreground animate-pulse" />
        </div>
      )}
      <img
        src={imageSrc || "/placeholder.svg"}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          imageState === "loaded" ? "opacity-100" : "opacity-0",
          className,
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}
