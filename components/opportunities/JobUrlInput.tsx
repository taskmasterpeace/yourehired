import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface JobUrlInputProps {
  onDataExtracted: (data: any) => void;
  onExtractionComplete: () => void;
}

export function JobUrlInput({
  onDataExtracted,
  onExtractionComplete,
}: JobUrlInputProps) {
  const [jobUrl, setJobUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const extractJobData = async () => {
    if (!jobUrl) {
      setError("Please enter a job URL");
      return;
    }

    setIsLoading(true);
    setError("");
    setProgress(10);
    setStatusMessage("Initializing extraction...");

    try {
      console.log("Calling API to extract job data from URL:", jobUrl);
      setProgress(30);
      setStatusMessage("Sending request to extraction service...");

      const response = await fetch("/api/firecrawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: jobUrl }),
      });

      setProgress(60);
      setStatusMessage("Processing response...");

      // If the response is not ok, handle the error
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg =
          errorData?.error ||
          `API error: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
      }

      // Parse the JSON response
      const data = await response.json();
      console.log("Extracted job data:", data);

      setProgress(90);
      setStatusMessage("Finalizing data extraction...");

      // Map the extracted data to our form structure
      const jobData = {
        company: data.company_name || "",
        position: data.job_title || "",
        location: data.location || "",
        salary: data.salary || "",
        jobDescription: data.job_description || "",
        applicationUrl: jobUrl,
      };

      // Verify we got at least some data
      const hasData =
        jobData.company || jobData.position || jobData.jobDescription;

      if (!hasData) {
        throw new Error("No job data could be extracted from this URL");
      }

      setProgress(100);
      setStatusMessage("Extraction complete!");

      onDataExtracted(jobData);
      onExtractionComplete();
      setJobUrl("");
    } catch (error) {
      console.error("Error extracting job data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to extract job data"
      );
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAnyway = () => {
    // Extract domain from URL to attempt company name extraction
    let companyName = "";
    try {
      const url = new URL(jobUrl);
      // Get domain without www. prefix
      let domain = url.hostname.replace("www.", "");
      // Split by dots and get the main domain name
      const domainParts = domain.split(".");
      if (domainParts.length >= 2) {
        companyName = domainParts[domainParts.length - 2];
        // Capitalize first letter
        companyName =
          companyName.charAt(0).toUpperCase() + companyName.slice(1);
      }
    } catch (e) {
      // Ignore URL parsing errors
    }

    // Call with minimal data
    onDataExtracted({
      company: companyName,
      position: "",
      location: "",
      salary: "",
      jobDescription: "",
      applicationUrl: jobUrl,
    });
    onExtractionComplete();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="job-url">Paste Job URL</Label>
        <div className="flex space-x-2">
          <Input
            id="job-url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="https://www.indeed.com/job/..."
            className="flex-1"
          />
          <Button
            onClick={extractJobData}
            disabled={isLoading || !jobUrl}
            type="button"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Extracting...
              </>
            ) : (
              "Extract"
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Supports jobs from Indeed, LinkedIn, Glassdoor, and more
        </p>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <div className="text-sm flex items-center">
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            <span>{statusMessage}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Extraction failed</AlertTitle>
          <AlertDescription className="mt-1">
            {error}

            <div className="mt-2">
              <Button
                variant="outline"
                onClick={handleContinueAnyway}
                className="mt-1"
                size="sm"
              >
                Continue with manual entry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-2 text-center">
        <Button
          variant="link"
          onClick={handleContinueAnyway}
          className="text-gray-500 text-sm"
          size="sm"
        >
          Skip extraction and add manually
        </Button>
      </div>
    </div>
  );
}
