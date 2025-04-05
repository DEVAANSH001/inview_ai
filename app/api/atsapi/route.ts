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
    const base64 = Buffer.from(buffer).toString("base64");

    const { text: resumeText } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `
    You are a PDF parsing engine that extracts clean, accurate, and complete text from resumes.
    
    The input is a base64-encoded PDF resume. Extract **only the raw readable text** as if it were copied directly from a PDF reader. Maintain the **logical structure and order** (e.g., name, education, experience, projects, skills).
    
    Important instructions:
    - Do NOT summarize or interpret.
    - Preserve section headers (e.g., "Experience", "Projects", "Skills").
    - If there are URLs or hyperlinks (e.g., portfolio, GitHub), extract them as-is.
    - Do NOT generate or guess missing information.
    - Do NOT alter dates, project names, or job titles.
    - Output ONLY the plain resume text without any formatting, extra comments, or explanation.
    
    --- BASE64 PDF RESUME ---
    ${base64}
    `
    });

    const prompt = `
You are a strict Applicant Tracking System (ATS) evaluator.

Evaluate how well the resume matches the job description. Return a VALID JSON object in the following format:

{
  "score": integer from 0 to 100,
  "strengths": [list of strengths found in the resume],
  "weaknesses": [list of mismatches or missing criteria],
  "improvement_tips": [actionable suggestions to improve the resume for this job]
}

Match based on:
- Required vs present skills
- Education match (e.g., M.Tech required, B.Tech present = mismatch)
- Relevant experience/projects
- Libraries or tools mentioned
- NLP, ML, DL, Generative AI concepts
- Other key responsibilities or expectations

Avoid hallucinations. Only mention what's in the resume.

--- JOB DESCRIPTION ---
${jobDescription}

--- RESUME TEXT ---
${resumeText}
`;

    const { text: geminiResponse } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
    });

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(
        geminiResponse
          .replace(/```(?:json)?/g, "")
          .replace(/```/g, "")
          .trim()
      );
    } catch (e) {
      return Response.json(
        { error: "Invalid response from Gemini", raw: geminiResponse },
        { status: 500 }
      );
    }

    const { score, strengths, weaknesses, improvement_tips } = parsedResponse;

    return Response.json(
      {
        score,
        strengths,
        weaknesses,
        improvement_tips,
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
