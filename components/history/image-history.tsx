"use client"

import { useState, useEffect } from "react"
import { ImageStorage, type GeneratedImage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Download, Trash2, RotateCcw, HeartCrack } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"
import { BulkActions } from "./bulk-actions"
import { ImageUtils } from "@/lib/image-utils"

interface ImageHistoryProps {
  onRegenerate: (prompt: string, style: string) => void
  onHistoryUpdate?: () => void
  showFavoritesOnly?: boolean
}

export function ImageHistory({ onRegenerate, onHistoryUpdate, showFavoritesOnly = false }: ImageHistoryProps) {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = () => {
    setImages(ImageStorage.getHistory())
  }

  const displayImages = showFavoritesOnly ? images.filter((img) => img.isFavorite) : images

  const toggleFavorite = (imageId: string) => {
    ImageStorage.toggleFavorite(imageId)
    loadImages()
    onHistoryUpdate?.()
    toast({
      title: "Favorites Updated",
      description: "Image favorite status has been updated.",
    })
  }

  const deleteImage = (imageId: string) => {
    ImageStorage.deleteImage(imageId)
    loadImages()
    onHistoryUpdate?.()
    toast({
      title: "Image Deleted",
      description: "Image has been removed from your collection.",
    })
  }

  const downloadImage = async (imageUrl: string, prompt: string) => {
    const filename = `${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "-")}.png`
    const success = await ImageUtils.downloadImage(imageUrl, filename)

    if (success) {
      toast({
        title: "Download Started",
        description: "Your image is being downloaded.",
      })
    } else {
      toast({
        title: "Download Failed",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const clearHistory = () => {
    ImageStorage.clearHistory()
    loadImages()
    onHistoryUpdate?.()
    toast({
      title: "History Cleared",
      description: "All images have been removed from your history.",
    })
  }

  return (
    <div className="space-y-6">
      {!showFavoritesOnly && images.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="text-destructive hover:text-destructive glass hover:glass-strong bg-transparent"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        </div>
      )}

      <BulkActions images={displayImages} onUpdate={loadImages} />

      {/* Images Grid */}
      {displayImages.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
            {showFavoritesOnly ? (
              <Heart className="w-8 h-8 text-muted-foreground" />
            ) : (
              <RotateCcw className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-medium mb-2">No {showFavoritesOnly ? "favorites" : "history"} yet</h3>
          <p className="text-muted-foreground">
            {showFavoritesOnly ? "Images you favorite will appear here" : "Generated images will appear here"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayImages.map((image) => (
            <Card key={image.id} className="group overflow-hidden glass hover:glass-strong transition-all duration-300">
              <div className="relative aspect-square">
                <ImageWithFallback
                  src={image.imageUrl || "/placeholder.svg"}
                  alt={image.prompt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => toggleFavorite(image.id)}
                    className="w-8 h-8 p-0 glass backdrop-blur-sm"
                  >
                    {showFavoritesOnly ? (
                      <HeartCrack className="w-4 h-4 text-red-500" />
                    ) : (
                      <Heart
                        className={`w-4 h-4 ${image.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                      />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => deleteImage(image.id)}
                    className="w-8 h-8 p-0 glass backdrop-blur-sm text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium line-clamp-2 mb-1">{image.prompt}</p>
                  <p className="text-xs text-muted-foreground capitalize">{image.style.replace("-", " ")}</p>
                  <p className="text-xs text-muted-foreground">{new Date(image.timestamp).toLocaleDateString()}</p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadImage(image.imageUrl, image.prompt)}
                    className="flex-1 glass hover:glass-strong"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  {showFavoritesOnly ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFavorite(image.id)}
                      className="flex-1 glass hover:glass-strong text-red-500 hover:text-red-600"
                    >
                      <HeartCrack className="w-4 h-4 mr-2" />
                      Remove from Favorites
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRegenerate(image.prompt, image.style)}
                      className="flex-1 glass hover:glass-strong"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
