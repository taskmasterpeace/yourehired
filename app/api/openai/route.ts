import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// This enables the streaming capabilities for this Next.js route
export const runtime = "edge";

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
      case "stream_quick_action":
        return streamQuickAction(openai, prompt, text, context);
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

  try {
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

    // Important validation step
    if (!result || result.length < 1) {
      console.error("OpenAI returned empty result for quick action");
      return NextResponse.json(
        {
          error: "No valid improvement generated",
          originalText: text,
        },
        { status: 422 }
      );
    }

    // All good, return the result
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in handleQuickAction:", error);
    // Return the original text in case of error
    return NextResponse.json(
      {
        error: "Error processing text improvement",
        originalText: text,
      },
      { status: 500 }
    );
  }
}

// Stream handler for quick actions
async function streamQuickAction(
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

  // Create a text encoder
  const encoder = new TextEncoder();

  // Create a ReadableStream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Set up streaming response
        const stream = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          temperature: 0.7,
          max_tokens: 1500,
          stream: true,
        });

        let resultText = "";

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          resultText += content;

          // Send the accumulated text to the client
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ content: resultText })}\n\n`
            )
          );
        }

        // Make sure we ALWAYS send the done signal
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (error) {
        console.error("Error in stream:", error);

        // Send error message and done signal to client
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              error: "Stream failed",
              message: error.message,
            })}\n\n`
          )
        );
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
    },
  });

  // Return the stream as a response with appropriate headers
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
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
