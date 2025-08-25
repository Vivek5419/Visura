"use client"
import BlurText from "@/components/BlurText";
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Download, RefreshCw, Sparkles, Moon, Sun, Wand2, AlertCircle, History, Heart, ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"
import { ImageHistory } from "@/components/history/image-history"
import { ImageStorage } from "@/lib/storage"
import { handleDownload } from "@/lib/download"

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  style: string
  timestamp: Date
  isFavorite?: boolean
}

const styles = [
  { value: "realistic", label: "Realistic" },
  { value: "comic", label: "Comic" },
  { value: "anime", label: "Anime" },
  { value: "digital-art", label: "Digital Art" },
  { value: "ghibli", label: "Ghibli Art" },
  { value: "minecraft", label: "Minecraft Style" },
  { value: "oil-painting", label: "Oil Painting" },
  { value: "watercolor", label: "Watercolor" },
]

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("realistic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [currentView, setCurrentView] = useState<"history" | "favorites">("history")
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const refreshRecentCreations = () => {
    const recentImages = ImageStorage.getHistory()
      .slice(0, 6)
      .map((img) => ({
        id: img.id,
        url: img.imageUrl,
        prompt: img.prompt,
        style: img.style,
        timestamp: new Date(img.timestamp),
        isFavorite: img.isFavorite,
      }))
    setGeneratedImages(recentImages)
  }

  useEffect(() => {
    refreshRecentCreations()
    const timer = setTimeout(() => setIsPageLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate an image.",
        variant: "destructive",
      })
      return
    }

    if (navigator.vibrate) {
      navigator.vibrate(42)
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedStyle,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image")
      }

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: data.imageUrl,
        prompt: data.prompt,
        style: data.style,
        timestamp: new Date(),
      }

      ImageStorage.saveImage({
        prompt: data.prompt,
        style: data.style,
        imageUrl: data.imageUrl,
        isFavorite: false,
      })

      setGeneratedImages((prev) => [newImage, ...prev.slice(0, 5)])

      toast({
        title: "Image Generated!",
        description: "Your AI artwork has been created successfully.",
      })
    } catch (error) {
      console.error("Error generating image:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSurpriseMe = async () => {
    if (navigator.vibrate) {
      navigator.vibrate(42)
    }

    try {
      const response = await fetch("/api/surprise-prompt")
      const data = await response.json()

      if (data.success) {
        setPrompt(data.prompt)
        toast({
          title: "Surprise!",
          description: "Here's a creative prompt for you to try.",
        })
      }
    } catch (error) {
      console.error("Error getting surprise prompt:", error)
      const fallbackPrompts = [
        "A majestic dragon soaring through aurora-filled skies",
        "A cyberpunk cityscape with neon reflections in rain puddles",
        "A cozy library inside a giant tree with glowing books",
      ]
      const randomPrompt = fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)]
      setPrompt(randomPrompt)
    }
  }

  const handleRegenerate = async (imagePrompt: string, imageStyle: string) => {
    setPrompt(imagePrompt)
    setSelectedStyle(imageStyle)
    setShowHistory(false)

    setTimeout(() => {
      handleGenerate()
    }, 100)
  }

  const handleToggleFavorite = (imageId: string) => {
    ImageStorage.toggleFavorite(imageId)
    refreshRecentCreations()
    toast({
      title: "Favorites Updated",
      description: "Image favorite status has been updated.",
    })
  }

  const handleHistoryUpdate = () => {
    refreshRecentCreations()
  }

  const handleStyleSelect = (styleValue: string) => {
    setSelectedStyle(styleValue)
    setIsStyleDropdownOpen(false)
  }

  const selectedStyleLabel = styles.find((style) => style.value === selectedStyle)?.label || "Realistic"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div
          className={`professional-card bg-background/80 backdrop-blur-md border border-border rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-500 transform ${
            isPageLoaded ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <Wand2 className="h-6 w-6 text-foreground transition-transform duration-300 hover:rotate-12" />
              <h1 className="text-lg font-semibold text-foreground">Visura</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="rounded-full border-border hover:bg-accent/10 transition-all duration-300 hover:scale-105 h-8 px-3"
              >
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (navigator.vibrate) {
                    navigator.vibrate(42)
                  }
                  setTheme(theme === "dark" ? "light" : "dark")
                }}
                className="rounded-full border-border hover:bg-accent/10 transition-all duration-300 hover:scale-105 h-8 w-8 p-0"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 pt-24">
        {showHistory ? (
          <div
            className={`space-y-6 transition-all duration-500 ${
              isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-center justify-between mb-8 px-4">
              <Button
                variant="outline"
                onClick={() => setShowHistory(false)}
                className="professional-card hover:bg-accent/5 border-border transition-all duration-300 hover:scale-105 rounded-full px-4 py-2 flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to home
              </Button>
  <div className="w-full flex justify-center mt-8">
    <h2 className="text-center text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 bg-clip-text text-transparent">
        Your Visura Collection
          </h2>
          </div>
              <div className="w-[140px]"></div> {/* Spacer for balance */}
            </div>

            <div className="flex gap-2 mb-6">
              <Button
                variant={currentView === "history" ? "default" : "outline"}
                onClick={() => setCurrentView("history")}
                className={
                  currentView === "history"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105"
                    : "professional-card hover:bg-accent/5 border-border transition-all duration-300 hover:scale-105"
                }
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button
                variant={currentView === "favorites" ? "default" : "outline"}
                onClick={() => setCurrentView("favorites")}
                className={
                  currentView === "favorites"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105"
                    : "professional-card hover:bg-accent/5 border-border transition-all duration-300 hover:scale-105"
                }
              >
                <Heart className="h-4 w-4 mr-2" />
                Favorites
              </Button>
            </div>
            <ImageHistory
              onRegenerate={handleRegenerate}
              onHistoryUpdate={handleHistoryUpdate}
              showFavoritesOnly={currentView === "favorites"}
            />
          </div>
        ) : (
          <>
            {!process.env.NEXT_PUBLIC_CLIPDROP_CONFIGURED && (
              <Card
                className={`professional-card border-destructive/20 bg-destructive/5 p-4 mb-6 max-w-4xl mx-auto transition-all duration-500 ${
                  isPageLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
              >
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm">
                    <strong>Setup Required:</strong> Add your Clipdrop API key to the .env file to enable image
                    generation.
                  </p>
                </div>
              </Card>
            )}

            <Card
              className={`professional-card p-8 mb-8 max-w-4xl mx-auto transition-all duration-700 ${
                isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="space-y-6">
                <div className="text-center">
                  <div className="blur-text-container" data-delay="100" data-animate-by="words" data-direction="top">
 <BlurText
  text="Create with Visura"
  delay={190}
  animateBy="words"
  direction="bottom"
  onAnimationComplete={() => console.log("Animation completed!")}
  className="text-4xl font-bold text-foreground"
/>             
                </div>
                  <p className="text-muted-foreground">Transform your imagination into stunning visuals</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Your Prompt</label>
                    <Input
                      placeholder="your wonderful prompt..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="professional-card border-border focus:border-primary/50 transition-all duration-300 focus:scale-[1.02]"
                      onKeyDown={(e) => e.key === "Enter" && !isGenerating && handleGenerate()}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Art Style</label>
                    <div className="relative">
                      <button
                        onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
                        className="w-full professional-card border-border focus:border-primary/50 bg-background text-foreground px-3 py-2 text-left flex items-center justify-between hover:bg-accent/5 transition-all duration-300 hover:scale-[1.02]"
                      >
                        <span>{selectedStyleLabel}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-300 ${
                            isStyleDropdownOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </button>

                      {isStyleDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xl animate-in fade-in-0 duration-300"
                            onClick={() => setIsStyleDropdownOpen(false)}
                          />

                          {/* Modal container */}
                          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div
                              className="bg-background/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 fade-in-0 duration-400 ease-out"
                              style={{
                                animationTimingFunction: "cubic-bezier(0.25, 1.25, 0.5, 1)",
                                transformOrigin: "center center",
                                backdropFilter: "blur(40px)",
                                WebkitBackdropFilter: "blur(40px)",
                              }}
                            >
                              <div className="p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
                                  Select Art Style
                                </h3>
                                <div className="space-y-2">
                                  {styles.map((style, index) => (
                                    <button
                                      key={style.value}
                                      onClick={() => handleStyleSelect(style.value)}
                                      className={`w-full px-4 py-3 text-left text-foreground hover:bg-white/10 transition-all duration-300 rounded-lg animate-in slide-in-from-bottom-2 fade-in-0 hover:scale-[1.02] ${
                                        selectedStyle === style.value ? "bg-white/20 font-medium" : ""
                                      }`}
                                      style={{
                                        animationDelay: `${index * 50}ms`,
                                        animationDuration: "300ms",
                                        animationFillMode: "both",
                                      }}
                                    >
                                      {style.label}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/10">
                                  <Button
                                    onClick={() => setIsStyleDropdownOpen(false)}
                                    variant="outline"
                                    className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-foreground backdrop-blur-sm transition-all duration-300 hover:scale-105"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center flex-wrap">
                  <Button
                    onClick={handleSurpriseMe}
                    variant="outline"
                    disabled={isGenerating}
                    className="professional-card hover:bg-accent/5 transition-all duration-300 border-border bg-transparent hover:scale-105"
                  >
                    <Sparkles className="h-4 w-4 mr-2 transition-transform duration-300 hover:rotate-12" />
                    Surprise Me
                  </Button>

                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {generatedImages.length > 0 && (
              <div
                className={`space-y-6 transition-all duration-700 delay-200 ${
                  isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">Recent Creations</h3>
                  <Button
                    variant="outline"
                    onClick={() => setShowHistory(true)}
                    className="professional-card hover:bg-accent/5 border-border transition-all duration-300 hover:scale-105"
                  >
                    <History className="h-4 w-4 mr-1" />
                    View All History
                  </Button>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {generatedImages.map((image, index) => (
                    <Card
                      key={image.id}
                      className={`professional-card overflow-hidden group hover:shadow-lg transition-all duration-500 hover:scale-[1.02] ${
                        isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                      }`}
                      style={{ transitionDelay: `${300 + index * 100}ms` }}
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.prompt}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <p className="font-medium text-sm line-clamp-2 text-foreground">{image.prompt}</p>
                          <p className="text-xs text-muted-foreground capitalize">{image.style.replace("-", " ")}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleDownload(image.url, image.prompt)}
                            className="flex-1 professional-card hover:bg-accent/5 transition-all duration-300 border-border hover:scale-105"
                            variant="outline"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleToggleFavorite(image.id)}
                            className={`professional-card hover:bg-accent/5 transition-all duration-300 border-border hover:scale-110 ${
                              image.isFavorite ? "text-red-500 hover:text-red-600" : "hover:text-red-500"
                            }`}
                            variant="outline"
                          >
                            <Heart
                              className={`h-3 w-3 transition-all duration-300 ${
                                image.isFavorite ? "fill-current animate-pulse" : ""
                              }`}
                            />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRegenerate(image.prompt, image.style)}
                            className="flex-1 professional-card hover:bg-accent/5 transition-all duration-300 border-border hover:scale-105"
                            variant="outline"
                            disabled={isGenerating}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Regenerate
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {generatedImages.length === 0 && !isGenerating && (
              <div
                className={`text-center py-16 transition-all duration-700 delay-300 ${
                  isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <Wand2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 transition-transform duration-300 hover:rotate-12" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">Ready to Create with Visura?</h3>
                <p className="text-muted-foreground">Enter a prompt above and watch AI bring your ideas to life</p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="py-8 text-center">
        <p className="text-sm animated-gradient-text">
            made with ♥️ by Vivek
              </p>
              </footer>

      {/* Custom CSS for Apple-style spring animations */}
      <style jsx>{`
        @keyframes apple-bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes apple-bounce-out {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          25% {
            transform: scale(1.05);
          }
          100% {
            opacity: 0;
            transform: scale(0.8);
          }
        }
        
        .animate-apple-bounce-in {
          animation: apple-bounce-in 0.4s cubic-bezier(0.25, 1.25, 0.5, 1) forwards;
        }
        
        .animate-apple-bounce-out {
          animation: apple-bounce-out 0.35s cubic-bezier(0.25, 1.25, 0.5, 1) forwards;
        }

        /* Added animated rainbow gradient text effect */
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animated-gradient-text {
          background: linear-gradient(
            -45deg,
            #ff6b6b,
            #4ecdc4,
            #45b7d1,
            #96ceb4,
            #feca57,
            #ff9ff3,
            #54a0ff,
            #5f27cd
          );
          background-size: 400% 400%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 4s ease infinite;
          font-weight: 700;
        }
      `}</style>
    </div>
  )
}
