import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

// Allow longer processing time for resume generation
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // Log the incoming request for debugging
    console.log("Received resume tailoring request");

    // Parse the request body
    const body = await req.json();
    console.log("Request body keys:", Object.keys(body));

    const { resume, jobDescription, position, company } = body;

    // Log parameter lengths for debugging
    console.log("Resume length:", resume?.length || 0);
    console.log("Job description length:", jobDescription?.length || 0);
    console.log("Position:", position || "Not provided");
    console.log("Company:", company || "Not provided");

    // Validate required inputs with detailed checks
    if (!resume || typeof resume !== "string" || !resume.trim()) {
      console.error("Missing or invalid resume parameter");
      return NextResponse.json(
        { error: "Missing required parameter: resume" },
        { status: 400 }
      );
    }

    if (
      !jobDescription ||
      typeof jobDescription !== "string" ||
      !jobDescription.trim()
    ) {
      console.error("Missing or invalid jobDescription parameter");
      return NextResponse.json(
        { error: "Missing required parameter: jobDescription" },
        { status: 400 }
      );
    }

    // Create a tailored system prompt for better results
    const systemPrompt = `
You are an expert resume writer and career coach specializing in optimizing resumes for applicant tracking systems (ATS) and hiring managers. Your task is to tailor the provided resume to better match the specific job description.

Follow these guidelines:
1. Maintain the same overall structure and sections of the original resume (e.g., work experience, education, skills)
2. Highlight and emphasize skills, experiences, and achievements that are relevant to the job description
3. Use similar keywords and terminology from the job description to improve ATS matching
4. Reword bullet points to better align with the target role
5. Focus on quantifiable achievements that demonstrate relevant capabilities
6. Only include information that exists in the original resume - do not fabricate experience or skills
7. Do not change the timeline of employment or education
8. Ensure the tailored resume is professional, concise, and focused on the target position
9. Return only the tailored resume text with its formatting preserved

Your goal is to create a version of the resume that will maximize the candidate's chances of getting past ATS screening and impressing the hiring manager for this specific role.
`;

    // Create a tailored user prompt with the specific job details
    const userPrompt = `
I'm applying for a ${position || "new"} position at ${company || "a company"}.

Here's the job description:
${jobDescription}

Here's my current resume:
${resume}

Please tailor my resume to highlight the skills and experiences that best match this job description. Maintain my resume's current format but optimize the content for this specific role.
`;

    console.log(
      "Starting AI generation with prompt length:",
      systemPrompt.length + userPrompt.length
    );

    // Try a direct fetch to the OpenAI API first for better control
    try {
      console.log("Making direct request to OpenAI API");

      // Make sure OPENAI_API_KEY is defined
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key is not defined");
      }

      // Make a direct request to OpenAI
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o", // Use GPT-4o for better resume tailoring
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error: ${response.status} - ${errorText}`);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("OpenAI response structure:", Object.keys(data));

      const content = data.choices?.[0]?.message?.content;
      console.log("Content received length:", content?.length || 0);

      if (!content) {
        throw new Error("OpenAI returned empty content");
      }

      return NextResponse.json({
        content,
        jobTitle: position || "Position",
        company: company || "Company",
      });
    } catch (directError) {
      // Log the complete error for debugging
      console.error("Direct OpenAI API error:", directError);

      // Try fallback to AI SDK
      console.log("Fallback to AI SDK...");

      // Import and use the AI SDK dynamically as a fallback
      const { generateText } = await import("ai");

      const tailoredResume = await generateText({
        model: openai("gpt-4o"),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        maxTokens: 4000, // Set a high token limit since resumes can be lengthy
      });

      if (!tailoredResume) {
        throw new Error("AI SDK returned empty content");
      }

      return NextResponse.json({
        content: tailoredResume,
        jobTitle: position || "Position",
        company: company || "Company",
      });
    }
  } catch (error) {
    // Log the complete error for debugging
    console.error("Error tailoring resume:", error);

    // Return a user-friendly error
    return NextResponse.json(
      {
        error: "Failed to tailor resume",
        details: error instanceof Error ? error.message : "Unknown error",
        fallbackContent:
          "We couldn't tailor your resume automatically. Please try again later or use your master resume as-is.",
      },
      { status: 500 }
    );
  }
}
