import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { prisma } from "@/app/lib/prisma"; // Database Connection
import { cookies } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
    console.log("========== /api/generate-resume ==========");
    console.log("METHOD:", request.method);
    console.log("URL:", request.url);
    console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Loaded" : "❌ Not Found");

    try {
        console.log("🔄 Parsing form data...");
        const formData = await request.formData();

        const companyName = formData.get("companyName") as string || "JobFit Pro"; // Default fallback
        const jobTitle = formData.get("jobTitle") as string || "Candidate Application";

        const jobDescription = formData.get("jobDescription") as string | null;
        const file = formData.get("resume") as unknown as File | null;

        console.log("FORM DATA CHECK:", {
            hasJobDesc: !!jobDescription,
            hasFile: !!file,
            fileName: file?.name,
        });

        if (!jobDescription || !file) {
            return NextResponse.json(
                {
                    error: "Missing job description or resume file",
                },
                { status: 400 }
            );
        }

        console.log("📄 Resume File:", file.name, file.size, "bytes");

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text from DOCX for analysis
        let resumeText = "";
        try {
            const zip = new PizZip(buffer);
            const xml = zip.files["word/document.xml"].asText();
            // Simple regex to strip XML tags and get text content
            resumeText = xml.replace(/<[^>]+>/g, " ");
        } catch (e) {
            console.error("Text extraction failed:", e);
            resumeText = "Could not extract text. Analyze based on placeholders if present.";
        }

        const prompt = `You are an expert ATS (Applicant Tracking System) Scanner.
Your task is to:
1. READ the Job Description and the Resume Content below.
2. CALCULATE a REAL Match Score (0-100) based on strict keyword matching and experience alignment.
3. GENERATE optimized content to fill the placeholders in the resume.

JOB DESCRIPTION:
${jobDescription}

RESUME CONTENT (Extracted Text):
${resumeText.substring(0, 10000)}

RESUME FILE NAME: ${file.name}

REQUIRED JSON OUTPUT FORMAT:
{
  "matchScore": (Integer 0-100 based on ACTUAL analysis),
  "resumeSummary": "A powerful summary meant for the top of the resume...",
  "missingKeywords": ["List critical keywords found in JD but missing in Resume"],
  "insightsAndRecommendations": ["Specific advice to improve the score"],
  "replacements": {
      "summary_bullet_1": "Optimized summary bullet 1...",
      "summary_bullet_2": "Optimized summary bullet 2...",
      "summary_bullet_3": "Optimized summary bullet 3...",
      "summary_bullet_4": "Optimized summary bullet 4",
      "summary_bullet_5": "Optimized summary bullet 5",
      "summary_bullet_6": "Optimized summary bullet 6",
      "summary_bullet_7": "Optimized summary bullet 7",

      "exp2_bullet_1": "Strong achievement bullet for most recent role...",
      "exp2_bullet_2": "Action-oriented bullet point...",
      "exp2_bullet_3": "Quantifiable result bullet...",
      "exp2_bullet_4": "Technical implementation detail...",
      "exp2_bullet_5": "Collaboration or leadership point...",
      "exp2_bullet_6": "Problem solving example...",
      "exp2_achievement_1": "Major Key Achievement 1...",
      "exp2_achievement_2": "Major Key Achievement 2...",

      "expl_bullet_1": "Optimized bullet for previous role...",
      "expl_bullet_2": "Optimized bullet for previous role...",
      "expl_bullet_3": "Optimized bullet for previous role...",
      "expl_bullet_4": "Optimized bullet for previous role...",
      "expl_bullet_5": "Optimized bullet for previous role...",
      "expl_bullet_6": "Optimized bullet for previous role...",
      "expl_achievement_1": "Previous Key Achievement 1...",
      "expl_achievement_2": "Previous Key Achievement 2..."
  }
}
`;

        console.log("🚀 Calling Gemini API (REST)...");

        // Call Gemini REST API - Back to 'gemini-flash-latest' (The ONLY model compatible with your usage limits)
        // If you get 503 Overloaded, PLEASE RETRY. It is temporary server load.
        const apiKey = process.env.GEMINI_API_KEY;
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                    ]
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Gemini API Error:", response.status, errorText);
            throw new Error(errorText); // Throw the raw error text from Google
        }

        const result = await response.json();
        const text = result.candidates[0].content.parts[0].text;
        console.log("Gemini Response Length:", text.length);

        let analysis: any;
        try {
            const cleaned = text.replace(/```json|```/g, "").trim();
            analysis = JSON.parse(cleaned);
            console.log("✅ JSON parsed successfully");
        } catch (err) {
            console.error("❌ JSON Parse Failed:", err);
            // Fallback
            analysis = {
                matchScore: 0,
                replacements: {}
            };
        }

        // 📝 APPLY CHANGES TO DOCX
        let outputBuffer = buffer;
        try {
            const zip = new PizZip(buffer);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
                delimiters: { start: '{{', end: '}}' }, // IMPORTANT: Match user's {{tag}} format
            });

            // Feed the AI data into the document
            doc.render(analysis.replacements || {});

            outputBuffer = doc.getZip().generate({
                type: "nodebuffer",
                compression: "DEFLATE",
            }) as Buffer;
            console.log("✅ DOCX Updated Successfully!");
        } catch (docxError: any) {
            console.error("❌ Docxtemplater Error:", docxError);
            if (docxError.properties && docxError.properties.errors) {
                docxError.properties.errors.forEach((e: any) => console.error("Template Error:", e));
            }
            // We continue returning the original file if templating fails
        }



        // 🔍 FETCH USER & CHECK SUBSCRIPTION
        let userEmail = "Anonymous";
        let userId: string | null = null;
        const cookieStore = cookies();
        const sessionUserId = cookieStore.get("user_session")?.value;

        if (sessionUserId) {
            const user = await prisma.user.findUnique({
                where: { id: sessionUserId }
            });

            if (user) {
                userEmail = user.email;
                userId = user.id;

                // 🛑 LIMIT CHCEK
                const LIMIT = user.plan === "PRO" ? 20 : 5;
                if (user.creditsUsed >= LIMIT) {
                    return NextResponse.json(
                        { error: `You have reached your limit of ${LIMIT} resumes. Please upgrade to Pro.` },
                        { status: 403 }
                    );
                }
            }
        }

        // 📊 SAFE DATABASE LOGGING & INCREMENT USAGE
        try {
            await prisma.resumeLog.create({
                data: {
                    id: crypto.randomUUID(),
                    jobTitle: jobTitle,
                    companyName: companyName,
                    matchScore: analysis.matchScore || 0,
                    originalName: file.name,
                    userEmail: userEmail,
                    userId: userId, // Link to User Table
                    status: "SUCCESS"
                }
            });

            // Increment Usage
            if (userId) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { creditsUsed: { increment: 1 } }
                });
            }

            console.log("✅ Activity logged & Credits Deducted for:", userEmail);
        } catch (dbError) {
            console.warn("⚠️ Database logging failed (Non-critical):", dbError);
        }

        return NextResponse.json({
            success: true,
            analysis,
            fileData: outputBuffer.toString("base64"), // Return the MODIFIED file
            fileName: `optimized_${file.name}`,
        });

    } catch (error: any) {
        console.error("❌ Fatal Error:", error);
        return NextResponse.json(
            {
                error: "Failed to generate resume",
                message: error.message,
                stack: error.stack,
            },
            { status: 500 }
        );
    }
}
