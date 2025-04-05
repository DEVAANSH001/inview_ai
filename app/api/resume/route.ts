import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.action"; 

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;
    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Convert file to text
    const buffer = Buffer.from(await file.arrayBuffer());
    const resumeText = buffer.toString("utf-8");

    // Extract structured details from the resume using Gemini
    const { text: extractedDetails } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Extract structured details from the following resume:
      - Full Name
      - Contact Information (Phone, Email)
      - Skills (list all)
      - Work Experience (companies, job titles, duration)
      - Projects (titles, descriptions, technologies used)
      - Education (degree, institute, year)
      - Certifications & Achievements
      - Years of experience

      Also include:
      - Level: (Choose one: "Fresher", "Junior", "Mid-level", "Senior", "Lead") based on experience and resume details.
      - Tech Stack: A deduplicated array of technologies mentioned in skills, projects, or experience.

      Resume:
      ${resumeText}

      Format the response strictly in valid JSON.`,
    });

    let parsedDetails;
    try {
      const cleanJson = extractedDetails
        .replace(/```(?:json)?/g, "")
        .replace(/```/g, "")
        .trim();

      parsedDetails = JSON.parse(cleanJson);
      if (Array.isArray(parsedDetails)) {
        parsedDetails = { resumeDetails: parsedDetails };
      }
    } catch (error) {
      console.error(" Error parsing Gemini response:", extractedDetails);
      return NextResponse.json({ success: false, error: "Invalid JSON format from Gemini" }, { status: 500 });
    }

    // Generate interview questions based on extracted resume details
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Generate 5 resume-based interview questions for the following candidate:
      - Skills: ${parsedDetails["Skills"]}
      - Projects: ${parsedDetails["Projects"]}
      - Work Experience: ${parsedDetails["Work Experience"]}
      - Education: ${parsedDetails["Education"]}
      - Certifications & Achievements: ${parsedDetails["Certifications & Achievements"]}

      Instructions:
      - Difficulty should increase with experience (if experience is null, keep questions beginner level).
      - Each question should be relevant to resume details.
      - Return ONLY a valid JSON array of strings like this:
      ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
      - Do NOT include any explanation or extra text. Only return the array. No markdown, no code block.
      `,
    });

    let parsedQuestions;
    try {
      const cleanJson = questions
        .replace(/```(?:json)?/g, "")
        .replace(/```/g, "")
        .trim();

      parsedQuestions = JSON.parse(cleanJson);
      if (!Array.isArray(parsedQuestions)) {
        throw new Error("Expected an array of strings.");
      }
    } catch (error) {
      console.error(" Error parsing Gemini response:", questions);
      return NextResponse.json({ success: false, error: "Invalid JSON format from Gemini" }, { status: 500 });
    }

    // Use authenticated user ID here
    const interview = {
      role: parsedDetails["Full Name"] || "Candidate",
      type: "resume-based",
      level: parsedDetails["Level"] || "Unknown",
      techstack: parsedDetails["Tech Stack"] || [],
      questions: parsedQuestions,
      userId: user.id, // ✅ Replaced formData.get("userid")
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return NextResponse.json({ success: true, interview }, { status: 200 });
  } catch (error) {
    console.error(" Unexpected Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ success: true, data: "Resume API is working!" }, { status: 200 });
}
