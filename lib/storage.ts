export interface GeneratedImage {
  id: string
  prompt: string
  style: string
  imageUrl: string
  timestamp: number
  isFavorite: boolean
}

export class ImageStorage {
  private static HISTORY_KEY = "text-to-image-history"
  private static FAVORITES_KEY = "text-to-image-favorites"

  static saveImage(image: Omit<GeneratedImage, "id" | "timestamp">): GeneratedImage {
    const newImage: GeneratedImage = {
      ...image,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }

    const history = this.getHistory()
    history.unshift(newImage)

    // Keep only last 50 images
    const trimmedHistory = history.slice(0, 50)
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(trimmedHistory))

    return newImage
  }

  static getHistory(): GeneratedImage[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.HISTORY_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  static getFavorites(): GeneratedImage[] {
    return this.getHistory().filter((img) => img.isFavorite)
  }

  static toggleFavorite(imageId: string): void {
    const history = this.getHistory()
    const imageIndex = history.findIndex((img) => img.id === imageId)

    if (imageIndex !== -1) {
      history[imageIndex].isFavorite = !history[imageIndex].isFavorite
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history))
    }
  }

  static deleteImage(imageId: string): void {
    const history = this.getHistory()
    const filteredHistory = history.filter((img) => img.id !== imageId)
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(filteredHistory))
  }

  static clearHistory(): void {
    localStorage.removeItem(this.HISTORY_KEY)
  }
}
