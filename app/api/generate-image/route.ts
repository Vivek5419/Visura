import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt, style } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const apiKey = process.env.CLIPDROP_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Enhance prompt with style
    const enhancedPrompt = `${prompt}, ${style} style, high quality, detailed`

    const formData = new FormData()
    formData.append("prompt", enhancedPrompt)

    const response = await fetch("https://clipdrop-api.co/text-to-image/v1", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Clipdrop API error:", errorText)
      return NextResponse.json({ error: "Failed to generate image" }, { status: response.status })
    }

    const imageBuffer = await response.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString("base64")
    const imageDataUrl = `data:image/png;base64,${base64Image}`

    return NextResponse.json({
      success: true,
      imageUrl: imageDataUrl,
      prompt,
      style,
    })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
