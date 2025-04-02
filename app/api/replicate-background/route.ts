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

    // Function to analyze job description and determine aspects
    const analyzeJobDescription = (description: string) => {
      description = description.toLowerCase();

      // Check for specific environment indicators
      const isTechnical =
        /\b(software|developer|engineer|programmer|coding|technical|it|data|analyst|science|computer|technology|programming|development)\b/.test(
          description
        );
      const isCreative =
        /\b(design|creative|artist|writer|content|marketing|media|graphic|ui|ux|art|creative|visual|brand|illustration)\b/.test(
          description
        );
      const isCustomerFacing =
        /\b(customer|service|support|representative|sales|account|client|relations|care|communication|interpersonal|service|facing|public)\b/.test(
          description
        );
      const isManagement =
        /\b(manager|supervisor|lead|director|executive|leadership|management|team|oversee|supervise)\b/.test(
          description
        );
      const isRemote =
        /\b(remote|work from home|wfh|telecommute|virtual|distributed|flexible|anywhere)\b/.test(
          description
        );

      // Determine equipment needs
      const needsComputers =
        isTechnical ||
        /\b(computer|laptop|desktop|monitor|screen|keyboard|mouse|hardware|software)\b/.test(
          description
        );
      const needsCreativeTools =
        isCreative ||
        /\b(adobe|design tools|sketch|figma|illustrator|photoshop|drawing|tablet)\b/.test(
          description
        );
      const needsCommunicationTools =
        isCustomerFacing ||
        /\b(phone|headset|chat|communication|video|conference|meeting)\b/.test(
          description
        );

      // Determine space characteristics
      const isCollaborative =
        /\b(team|collaborate|group|together|meeting|brainstorm)\b/.test(
          description
        );
      const needsQuiet =
        /\b(focus|concentration|quiet|individual|attention to detail)\b/.test(
          description
        );

      return {
        isTechnical,
        isCreative,
        isCustomerFacing,
        isManagement,
        isRemote,
        needsComputers,
        needsCreativeTools,
        needsCommunicationTools,
        isCollaborative,
        needsQuiet,
      };
    };

    // Create a dynamic prompt based on job analysis
    const createDynamicPrompt = (title: string, description: string) => {
      const analysis = analyzeJobDescription(description);

      let basePrompt = `Design a professional office or work environment for a ${title} role. `;

      // Add environment type
      if (analysis.isRemote) {
        basePrompt +=
          "This is a home office setup that's professional and functional for remote work. ";
      } else {
        basePrompt += "This is a professional workplace environment. ";
      }

      // Add equipment details
      if (analysis.needsComputers) {
        if (analysis.isTechnical) {
          basePrompt +=
            "Include multiple high-powered computers with large monitors for technical tasks. ";
        } else {
          basePrompt +=
            "Include a computer setup appropriate for office work. ";
        }
      }

      if (analysis.needsCreativeTools) {
        basePrompt +=
          "Include creative tools like drawing tablets, art supplies, and visual reference materials. ";
      }

      if (analysis.needsCommunicationTools) {
        basePrompt +=
          "Include communication equipment like headsets, phones, or video conferencing setup. ";
      }

      // Add space characteristics
      if (analysis.isCollaborative) {
        basePrompt +=
          "The space should facilitate collaboration, with areas for team discussions and shared work. ";
      }

      if (analysis.needsQuiet) {
        basePrompt +=
          "The environment should be quiet and conducive to focused work. ";
      }

      if (analysis.isManagement) {
        basePrompt +=
          "The workspace should reflect a leadership role with appropriate space for meetings and discussions. ";
      }

      // Add general workspace aesthetics
      basePrompt +=
        "The workspace should include appropriate furniture, lighting, and layout that support the specific requirements of this job. ";

      // Add technical details for better image generation
      basePrompt +=
        "Wide angle shot of the entire workspace, professional photograph, realistic, detailed, HD quality.";

      return basePrompt;
    };

    const prompt = createDynamicPrompt(
      jobTitle || "professional",
      jobDescription || ""
    );
    console.log("Using background prompt:", prompt);

    // Run the image generation through Replicate
    const output = await replicate.run(
      "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478",
      {
        input: {
          prompt: prompt,
          negative_prompt:
            "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, cartoon, anime, unrealistic, people, persons, humans",
          width: 1024,
          height: 576,
          num_outputs: 1,
          num_inference_steps: 50,
          guidance_scale: 7.5,
          scheduler: "K_EULER_ANCESTRAL",
        },
      }
    );

    console.log("Background raw output:", output);

    // output will be an array of image URLs
    if (Array.isArray(output) && output.length > 0) {
      // Make sure we're returning a string
      const imageUrl = String(output[0]);
      console.log("Generated background URL:", imageUrl);

      // Make sure it's a valid URL
      try {
        new URL(imageUrl); // Will throw if not a valid URL
        return NextResponse.json({ success: true, imageUrl: imageUrl });
      } catch (e) {
        console.error("Invalid background URL:", imageUrl);
        return NextResponse.json(
          {
            success: false,
            error: "Invalid URL returned from image generation service",
          },
          { status: 500 }
        );
      }
    } else {
      console.error("No background image was generated");
      return NextResponse.json(
        { success: false, error: "No background image was generated" },
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
