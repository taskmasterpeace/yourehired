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

    const { jobTitle, role, isAssistant, jobDescription } = body;

    // Create a dynamic prompt based on the job information
    let prompt =
      "Generate a professional close-up headshot portrait of a person";

    if (jobTitle) {
      prompt += ` working as ${
        isAssistant ? "an AI assistant for" : ""
      } ${jobTitle}`;
    }

    // Add role-specific details
    if (role === "technical") {
      prompt += `, dressed in smart casual attire, with ${
        isAssistant ? "neat" : "short"
      } hair ${
        isAssistant ? "" : "and glasses"
      }, sitting against a softly blurred office background. The image conveys intelligence and focus, with a serious yet approachable expression, and a slight smile that shows confidence. Professional quality, realistic photo, high-resolution, detailed facial features.`;
    } else if (role === "creative") {
      prompt += `, with ${
        isAssistant ? "stylish" : "long, wavy"
      } hair, dressed in a casual, artistic style, such as a ${
        isAssistant ? "colorful blouse" : "graphic tee and a cardigan"
      }, with a soft, blurred background of an office with abstract art on the walls. The individual has a friendly and inviting smile, with warm lighting emphasizing their expression. Professional quality, realistic photo, high-resolution, detailed facial features.`;
    } else if (role === "customer_service") {
      prompt += `, with a neat, polished appearance, wearing a ${
        isAssistant ? "professional outfit" : "button-up shirt"
      } and a professional but approachable look. The background is blurred with a light, neutral tone, showing a minimalistic office setup. The person has a calm and empathetic expression, with soft lighting that creates a welcoming and professional atmosphere. Professional quality, realistic photo, high-resolution, detailed facial features.`;
    } else {
      // Default professional look
      prompt += `, dressed appropriately for the job, presenting a confident, approachable demeanor. The background should be blurry, with the focus solely on the individual's face. Professional quality, realistic photo, high-resolution, detailed facial features.`;
    }

    // Focus on just face for the avatar to work better
    prompt += " Close-up portrait, focus on face only.";

    console.log("Using prompt:", prompt);

    // Run the image generation through Replicate
    const output = await replicate.run(
      "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478",
      {
        input: {
          prompt: prompt,
          negative_prompt:
            "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, cartoon, anime, unrealistic",
          width: 512,
          height: 512,
          num_outputs: 1,
          num_inference_steps: 50,
          guidance_scale: 7.5,
          scheduler: "K_EULER_ANCESTRAL",
        },
      }
    );

    console.log("Raw Replicate output:", output);

    // output will be an array of image URLs
    if (Array.isArray(output) && output.length > 0) {
      // Make sure we're returning a string
      const imageUrl = String(output[0]);
      console.log("Generated image URL (as string):", imageUrl);

      // Make sure it's a valid URL
      try {
        new URL(imageUrl); // Will throw if not a valid URL
        console.log("URL is valid");
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
    } else {
      console.error("No image was generated, output type:", typeof output);
      return NextResponse.json(
        { success: false, error: "No image was generated" },
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
