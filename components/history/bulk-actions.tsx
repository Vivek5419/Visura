"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Download, Trash2, Heart, X } from "lucide-react"
import { ImageStorage, type GeneratedImage } from "@/lib/storage"
import { ImageUtils } from "@/lib/image-utils"
import { toast } from "sonner"

interface BulkActionsProps {
  images: GeneratedImage[]
  onUpdate: () => void
}

export function BulkActions({ images, onUpdate }: BulkActionsProps) {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)

  const toggleSelection = (imageId: string) => {
    const newSelection = new Set(selectedImages)
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId)
    } else {
      newSelection.add(imageId)
    }
    setSelectedImages(newSelection)
  }

  const clearSelection = () => {
    setSelectedImages(new Set())
  }

  const bulkDownload = async () => {
    if (selectedImages.size === 0) return

    setIsProcessing(true)
    try {
      const selectedImageData = images
        .filter((img) => selectedImages.has(img.id))
        .map((img) => ({ url: img.imageUrl, prompt: img.prompt }))

      await ImageUtils.downloadMultiple(selectedImageData)
      toast.success(`Downloaded ${selectedImages.size} images as ZIP`)
    } catch (error) {
      toast.error("Failed to download images")
    } finally {
      setIsProcessing(false)
    }
  }

  const bulkDelete = () => {
    if (selectedImages.size === 0) return

    selectedImages.forEach((imageId) => {
      ImageStorage.deleteImage(imageId)
    })

    setSelectedImages(new Set())
    onUpdate()
    toast.success(`Deleted ${selectedImages.size} images`)
  }

  const bulkFavorite = () => {
    if (selectedImages.size === 0) return

    selectedImages.forEach((imageId) => {
      const image = images.find((img) => img.id === imageId)
      if (image && !image.isFavorite) {
        ImageStorage.toggleFavorite(imageId)
      }
    })

    setSelectedImages(new Set())
    onUpdate()
    toast.success(`Added ${selectedImages.size} images to favorites`)
  }

  if (images.length === 0) return null

  return (
    <Card className="glass p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {selectedImages.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{selectedImages.size} selected</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </div>

        {selectedImages.size > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={bulkFavorite} disabled={isProcessing}>
              <Heart className="w-4 h-4 mr-1" />
              Favorite
            </Button>
            <Button variant="outline" size="sm" onClick={bulkDownload} disabled={isProcessing}>
              <Download className="w-4 h-4 mr-1" />
              Download ZIP
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={bulkDelete}
              disabled={isProcessing}
              className="text-destructive hover:text-destructive bg-transparent"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Selection checkboxes for images */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-4">
        {images.map((image) => (
          <div
            key={image.id}
            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
              selectedImages.has(image.id) ? "border-primary" : "border-transparent"
            }`}
            onClick={() => toggleSelection(image.id)}
          >
            <img src={image.imageUrl || "/placeholder.svg"} alt={image.prompt} className="w-full h-full object-cover" />
            <div className="absolute top-1 left-1">
              <Checkbox
                checked={selectedImages.has(image.id)}
                onChange={() => {}} // Handled by parent click
                className="bg-background/80 backdrop-blur-sm"
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
