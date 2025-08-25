import { NextResponse } from "next/server"

const surprisePrompts = [
  "A majestic dragon soaring through aurora-filled skies",
  "A cyberpunk cityscape with neon reflections in rain puddles",
  "A cozy library inside a giant tree with glowing books",
  "An underwater palace made of coral and pearls",
  "A steampunk airship floating above Victorian London",
  "A magical forest with bioluminescent mushrooms and fairy lights",
  "A space station orbiting a purple nebula",
  "A medieval castle built on floating islands",
  "A futuristic city on Mars with glass domes",
  "A phoenix rising from crystal flames",
  "An ancient temple hidden in misty mountains",
  "A robot garden with mechanical flowers",
  "A floating island with waterfalls cascading into clouds",
  "A neon-lit street market in Tokyo at night",
  "A crystal cave with glowing stalactites",
  "A pirate ship sailing through a storm of stars",
  "A treehouse village connected by rope bridges",
  "A desert oasis with palm trees and ancient ruins",
  "A lighthouse on a cliff during a thunderstorm",
  "A magical potion shop with floating ingredients",
]

export async function GET() {
  try {
    const randomPrompt = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)]

    return NextResponse.json({
      success: true,
      prompt: randomPrompt,
    })
  } catch (error) {
    console.error("Error getting surprise prompt:", error)
    return NextResponse.json({ error: "Failed to get surprise prompt" }, { status: 500 })
  }
}
