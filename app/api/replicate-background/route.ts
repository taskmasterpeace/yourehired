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

    // Run the image generation through Replicate with Flux Schnell model
    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt: prompt,
        aspect_ratio: "16:9", // Attempt to specify a custom aspect ratio
        num_inference_steps: 4,
        seed: Math.floor(Math.random() * 1000000),
        megapixels: "1", // Default value
        num_outputs: 1, // Default value
        output_format: "webp", // Default value
        output_quality: 80, // Default value
        go_fast: true, // Default value
        disable_safety_checker: false, // Default value
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
