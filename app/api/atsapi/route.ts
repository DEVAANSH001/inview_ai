import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get("resume") as File;
    const jobDescription = formData.get("jobDescription") as string;

    if (!resumeFile || !jobDescription) {
      return Response.json(
        { error: "Resume and job description are required." },
        { status: 400 }
      );
    }

    const buffer = await resumeFile.arrayBuffer();
    const resumeText = Buffer.from(buffer).toString("utf-8");

    const prompt = `
You are an intelligent resume analyzer.

Evaluate the resume against the job description and return:
1. A match score out of 100.
2. A short analysis of strengths and weaknesses.
3. Tips to improve the resume for this job.

--- Job Description ---
${jobDescription}

--- Resume ---
${resumeText}
`;

    const { text: geminiResponse } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: prompt,
    });

    // Try to extract a score (basic heuristic)
    const match = geminiResponse.match(/(\d{1,3})/);
    const score = match ? parseInt(match[1]) : "N/A";

    // Strip HTML-like tags such as <p>, <br/>, etc.
    const cleanAnalysis = geminiResponse
      .replace(/<\/?[^>]+(>|$)/g, "")      // Remove all HTML tags
      .replace(/\*\*(.*?)\*\*/g, "$1")     // Remove bold markdown (**text** → text)
      .replace(/^\s+|\s+$/g, "")           // Trim leading/trailing whitespace
      .replace(/\r?\n\s*\r?\n/g, "\n\n");  // Ensure proper paragraph spacing

    return Response.json(
      {
        score,
        analysis: cleanAnalysis,
      },
      { status: 200 }
    );


  } catch (error) {
    console.error("Error in ATS route:", error);
    return Response.json(
      { error: "Internal server error", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
