import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const apiKey = process.env.FIRECRAWL_API_KEY;

    if (!apiKey) {
      console.error("API key is missing");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    console.log(`Attempting to extract data from URL: ${url}`);

    // Prepare the request according to the documentation
    const requestBody = {
      urls: [url], // The docs show 'urls' as an array
      prompt:
        "Extract the job title, company name, location, job description, and salary information from this job posting.",
      // Define a schema for the expected output
      schema: {
        type: "object",
        properties: {
          job_title: { type: "string" },
          company_name: { type: "string" },
          location: { type: "string" },
          job_description: { type: "string" },
          salary: { type: "string" },
        },
        required: ["job_title", "company_name", "job_description"],
      },
    };

    console.log("Request body:", JSON.stringify(requestBody));

    // Use the correct endpoint with v1 prefix as shown in the docs
    const firecrawlResponse = await fetch(
      "https://api.firecrawl.dev/v1/extract",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log(
      `Firecrawl API response status: ${firecrawlResponse.status} ${firecrawlResponse.statusText}`
    );

    // Get raw response text for debugging
    let responseText;
    try {
      responseText = await firecrawlResponse.text();
      console.log("Raw API response:", responseText.substring(0, 500));
    } catch (error) {
      console.error("Error reading response text:", error);
      responseText = "Error reading response";
    }

    // If not successful, return relevant error details
    if (!firecrawlResponse.ok) {
      return NextResponse.json(
        {
          error: `Firecrawl API error: ${firecrawlResponse.status} ${firecrawlResponse.statusText}`,
          details: responseText,
        },
        { status: firecrawlResponse.status }
      );
    }

    // Try to parse the response
    let response;
    try {
      response = JSON.parse(responseText);
    } catch (error) {
      console.error("JSON parse error:", error);
      return NextResponse.json(
        {
          error: "Invalid JSON response from API",
          responseText: responseText.substring(0, 300),
        },
        { status: 500 }
      );
    }

    // Handle async extract case (documented in the API)
    if (response.success && response.id && !response.data) {
      console.log(`Extraction is async with ID: ${response.id}`);

      // Poll for results a few times
      const extractId = response.id;
      let extractData = null;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        attempts++;
        console.log(
          `Polling for extract results, attempt ${attempts}/${maxAttempts}`
        );

        // Wait a bit between polling attempts
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Get the extract status
        const statusResponse = await fetch(
          `https://api.firecrawl.dev/v1/extract/${extractId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              Accept: "application/json",
            },
          }
        );

        if (!statusResponse.ok) {
          console.log(
            `Extract status check failed: ${statusResponse.status} ${statusResponse.statusText}`
          );
          continue;
        }

        const statusData = await statusResponse.json();
        console.log(`Extract status: ${statusData.status}`);

        // If completed, get the data
        if (statusData.status === "completed" && statusData.data) {
          extractData = statusData.data;
          break;
        }

        // If failed or cancelled, stop polling
        if (
          statusData.status === "failed" ||
          statusData.status === "cancelled"
        ) {
          return NextResponse.json(
            {
              error: `Extract failed with status: ${statusData.status}`,
              details: statusData,
            },
            { status: 500 }
          );
        }
      }

      if (!extractData) {
        return NextResponse.json(
          {
            error: "Extract timed out",
            extractId: extractId,
          },
          { status: 408 }
        );
      }

      // Use the extracted data
      return NextResponse.json(extractData);
    }

    // Handle direct response case
    if (response.success && response.data) {
      return NextResponse.json(response.data);
    }

    // Fallback error if we couldn't process the response
    return NextResponse.json(
      {
        error: "Unexpected response format",
        response: response,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        error: "Failed to extract job data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
