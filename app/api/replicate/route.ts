import { NextResponse } from "next/server";
import Replicate from "replicate";

// Initialize Replicate with API key from environment variables
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY || "",
});

export async function POST(request: Request) {
  console.log("Replicate API called");
  try {
    const body = await request.json();
    console.log("Request body:", body);
    const { jobTitle, jobDescription } = body;

    // Create a prompt that includes job title and key elements from the description
    // Limit description length for the prompt
    const shortDescription = jobDescription
      ? jobDescription.substring(0, 100) + "..."
      : "";

    const prompt = `Generate a close-up headshot portrait of an assistant for a ${jobTitle} position. The assistant should look professional, approachable, and trustworthy - designed to help candidates with this job: ${shortDescription}. Give them a friendly, helpful expression with a slight smile. The background should be softly blurred. Professional quality, realistic photo with detailed facial features.`;

    console.log("Using prompt:", prompt);

    // Run the image generation through Replicate using Flux Schnell model
    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt: prompt,
        negative_prompt:
          "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, cartoon, anime, unrealistic",
        width: 512,
        height: 512,
        num_inference_steps: 4, // Maximum allowed for Flux Schnell
        seed: Math.floor(Math.random() * 1000000),
      },
    });

    console.log("Raw Replicate output:", output);

    // Process the output - Flux Schnell may return a string instead of an array
    let imageUrl;
    if (typeof output === "string") {
      // Direct string output
      imageUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      // Array output
      imageUrl = String(output[0]);
    } else {
      console.error("Unexpected output format:", output);
      return NextResponse.json(
        {
          success: false,
          error: "Unexpected output format from image generation service",
        },
        { status: 500 }
      );
    }

    console.log("Generated image URL:", imageUrl);

    // Simple URL validation
    try {
      new URL(imageUrl);
      return NextResponse.json({ success: true, imageUrl: imageUrl });
    } catch (e) {
      console.error("Invalid URL returned from Replicate:", imageUrl);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid URL returned from image generation service",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating avatar:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to generate avatar: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
