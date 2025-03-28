import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, prompt, text, context } = body;

    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured on server" },
        { status: 500 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey,
    });

    // Handle different action types
    switch (action) {
      case "quick_action":
        return handleQuickAction(openai, prompt, text, context);
      case "improve_text":
        return handleImproveText(openai, text, prompt, context);
      case "generate_memory":
        return handleGenerateMemory(openai, text, context);
      default:
        return NextResponse.json(
          { error: "Invalid action type" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

// Handler for quick actions
async function handleQuickAction(
  openai: OpenAI,
  prompt: string,
  text: string,
  context: string
) {
  const systemPrompt = `You are an expert resume writer helping to improve a resume. 
${context || ""}
Your task is to: ${prompt}

Only return the improved text without explanations or additional comments.
Keep the formatting and structure similar to the original text.
Focus on clarity, impact, and professional language.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  const result = response.choices[0]?.message?.content?.trim();

  return NextResponse.json({ result });
}

// Handler for improving text
async function handleImproveText(
  openai: OpenAI,
  text: string,
  prompt: string,
  context: string
) {
  const systemPrompt = `You are an expert resume writer.
${context || ""}
Improve the following resume text according to this instruction: ${
    prompt || "Make it more professional and impactful"
  }

Return only the improved text.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  const improvedText = response.choices[0]?.message?.content?.trim();

  return NextResponse.json({ improvedText });
}

// Handler for generating memories
async function handleGenerateMemory(
  openai: OpenAI,
  text: string,
  context: string
) {
  const systemPrompt = `You are an AI assistant that helps generate helpful insights about resume content.
Based on the resume text, generate a brief, insightful observation that would be valuable for the job seeker.
This should be a single sentence that offers a specific tip or highlight about their resume.
For example: "Your technical skills section is strong, but you could add more quantifiable achievements."`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `${context || ""}\n\nResume content: ${text}` },
    ],
    temperature: 0.7,
    max_tokens: 100,
  });

  const memory = response.choices[0]?.message?.content?.trim();

  return NextResponse.json({ memory });
}
