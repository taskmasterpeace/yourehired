import { NextResponse } from "next/server";
import Replicate from "replicate";

// Initialize Replicate with API key from environment variables
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY || "",
});

export async function POST(request: Request) {
  console.log("Replicate Background API called");
  try {
    const body = await request.json();
    console.log("Background request body:", body);
    const { jobTitle, jobDescription } = body;

    // Create prompt using the exact format requested
    const prompt = `Cinematic daytime shot of an empty work environment for a ${jobTitle} role. The workspace functional, and appropriate for the role. Wide  angle shot, realistic, detailed, HD quality.Shot by Spike Lee`;

    console.log("Using background prompt:", prompt);

    const width = 840;
    const height = 280;

    // Run the image generation through Replicate with Flux Schnell model
    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt: prompt,
        negative_prompt:
          "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, cartoon, anime, unrealistic, text, watermark, signature, caption, title, label",
        num_inference_steps: 4,
        seed: Math.floor(Math.random() * 1000000),
        width: width,
        height: height,
      },
    });

    console.log("Background raw output:", output);

    // Process output
    let imageUrl;
    if (typeof output === "string") {
      // For direct string output
      imageUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      // For array output
      imageUrl = String(output[0]);
    } else {
      console.error("No background image was generated", output);
      return NextResponse.json(
        { success: false, error: "No background image was generated" },
        { status: 500 }
      );
    }

    console.log("Generated background URL:", imageUrl);

    // Verify the URL and image accessibility
    try {
      const urlObj = new URL(imageUrl);

      // Verify URL is accessible via a HEAD request
      const response = await fetch(imageUrl, { method: "HEAD" });
      if (!response.ok) {
        throw new Error(`URL returned status ${response.status}`);
      }

      return NextResponse.json({ success: true, imageUrl: imageUrl });
    } catch (e) {
      console.error("Invalid or inaccessible background URL:", imageUrl, e);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid URL returned from image generation service",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating background:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to generate background: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
