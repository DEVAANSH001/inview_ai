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
You are a PDF parsing engine that extracts clean, accurate, and complete information from resumes.

The input is a base64-encoded PDF resume. Perform the following tasks:

1. Extract the **raw readable text** from the PDF, maintaining logical structure and order (e.g., name, education, experience, projects, skills).
2. If section headers like "Experience", "Internships", or "Work History" are **missing**, assume the user is a **Fresher**.
3. If date ranges (e.g., "Jan 2021 - May 2023") are found in the experience section, **calculate approximate years of experience**.
4. Extract important URLs or hyperlinks (like GitHub, LinkedIn, portfolios) as-is.
5. Do NOT guess or generate any missing information.
6. Do NOT alter names, dates, job titles, or project names.
7. Do NOT summarize or interpret content beyond what's explicitly present.

Return a plain-text block containing:
- Raw resume content, in natural order.
- Preserve section headers.
- At the end, append a summary block in the following JSON format:

{
  "is_experienced": true or false,
  "approx_years_of_experience": number (or 0 if not found),
  "detected_sections": ["Education", "Projects", "Skills", "Experience", ...],
  "extracted_links": ["https://github.com/...", "https://linkedin.com/in/..."]
}

--- BASE64 PDF RESUME ---
${base64}
`

    });

    const prompt = `
    You are a strict Applicant Tracking System (ATS) evaluator.
    
    Evaluate how well the resume matches the job description. Return a VALID JSON object in the following format:
    
    {
      "score": integer from 0 to 100,
      "picked_skills": [skills or keywords picked from resume],
      "picked_experience": [projects, work experience, internships from resume],
      "missing_keywords": [important keywords in job description but not found in resume],
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

    const {
      score,
      strengths,
      weaknesses,
      picked_skills,
      picked_experience,
      missing_keywords,
      improvement_tips,
    } = parsedResponse;

    return Response.json(
      {
        score,
        strengths,
        weaknesses,
        picked_skills,
        picked_experience,
        missing_keywords,
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
