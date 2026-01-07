
import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/app/lib/auth";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { prisma } from "@/app/lib/prisma";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
    console.log("========== /api/generate-resume (REST ID) ==========");

    try {
        console.log("🔄 Parsing form data...");
        const formData = await request.formData();

        const companyName = formData.get("companyName") as string || "ResumeLab";
        const jobTitle = formData.get("jobTitle") as string || "Candidate Application";
        const jobDescription = formData.get("jobDescription") as string | null;
        const file = formData.get("resume") as unknown as File | null;

        if (!jobDescription || !file) {
            return NextResponse.json({
                error: "Missing job description or resume file",
            }, { status: 400 });
        }

        // Extract text from DOCX
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let resumeText = "";
        try {
            const zip = new PizZip(buffer);
            const xml = zip.files["word/document.xml"].asText();
            resumeText = xml.replace(/<[^>]+>/g, " ");
        } catch (e) {
            console.error("Text extraction failed:", e);
            resumeText = "Could not extract text. Analyze based on placeholders if present.";
        }

        // Generate AI content
        const promptText = `You are an expert ATS (Applicant Tracking System) Scanner and Professional Resume Writer.

Your task is to:
1. READ the Job Description and the Resume Content below.
2. CALCULATE a REAL Match Score (0-100) based on strict keyword matching and experience alignment.
3. GENERATE highly effective, optimized content to fill the placeholders in the resume.

JOB DESCRIPTION:
${jobDescription}

RESUME CONTENT (Extracted Text):
${resumeText.substring(0, 10000)}

RESUME FILE NAME: ${file.name}

CRITICAL FORMATTING RULES:
- DO NOT use any markdown formatting symbols like **, ##, __, or any special characters
- Write in plain text only
- Each bullet point should be a complete, detailed sentence
- Use strong action verbs at the start of each bullet
- Content must be professional and quantifiable

REQUIRED JSON OUTPUT FORMAT:
{
  "matchScore": (Integer 0-100),
  "resumeSummary": "Professional summary text...",
  "missingKeywords": ["keyword1", "keyword2"],
  "insightsAndRecommendations": ["advice1", "advice2"],
  "replacements": {
      "summary_bullet_1": "Optimized content...",
      "exp2_bullet_1": "Optimized content...",
      // ... generate content for likely placeholders
  }
}

Respond ONLY with valid JSON.`;

        // Direct REST API Fallback Implementation
        // UPDATED: Prioritizing 'latest' stable aliases to avoid 2.x experimental rate limits
        const models = [
            "gemini-flash-latest",       // Stable 1.5 Flash alias (Available)
            "gemini-flash-lite-latest",  // Lightest/Fastest 1.5 alias (Available)
            "gemini-2.0-flash-lite-preview-02-05", // New Lite model
            "gemini-2.5-flash",          // User preferred
            "gemini-2.0-flash",
            "gemini-exp-1206"
        ];

        let analysis: any = null;
        let lastErrorStr = "";

        console.log("🚀 Starting generation (Direct REST API)...");

        for (const model of models) {
            try {
                console.log(`🌐 POST https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`);

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{ text: promptText }]
                            }],
                            generationConfig: {
                                responseMimeType: "application/json"
                            }
                        })
                    }
                );

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errText}`);
                }

                const data = await response.json();

                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    const rawText = data.candidates[0].content.parts[0].text;
                    const cleaned = rawText.replace(/```json|```/g, "").trim();
                    analysis = JSON.parse(cleaned);
                    console.log(`✅ Success with ${model}`);
                    break;
                } else {
                    throw new Error("No candidates returned");
                }

            } catch (e: any) {
                console.warn(`⚠️ Failed with ${model}: ${e.message}`);
                lastErrorStr = e.message;
            }
        }

        if (!analysis) {
            console.error("❌ All models failed:", lastErrorStr);
            // Helpful error for user
            return NextResponse.json({
                error: `AI Error: ${lastErrorStr || "Failed to connect"}. Check console for details.`,
                details: "Failed to generate content. " + lastErrorStr,
                suggestion: "Please check your Google Gemini API Quota (likely exceeded) or Region availability."
            }, { status: 500 });
        }

        // Apply changes to DOCX
        let outputBuffer = buffer;
        try {
            const zip = new PizZip(buffer);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
                delimiters: { start: '{{', end: '}}' },
            });

            doc.render(analysis.replacements || {});

            outputBuffer = Buffer.from(doc.getZip().generate({
                type: "nodebuffer",
                compression: "DEFLATE",
            }) as any);
        } catch (docxError: any) {
            console.error("Docxtemplater Error:", docxError);
            // Continue even if template replacement fails partially
        }

        // Fetch user and check subscription
        let userEmail = "Anonymous";
        let userName = "User";
        let userId: string | null = null;

        try {
            const sessionUserId = await getUserId();
            if (sessionUserId) {
                const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
                if (user) {
                    userEmail = user.email;
                    userName = user.name || user.email.split('@')[0];
                    userId = user.id;

                    // Check full access
                    if (!(user as any).hasFullAccess) {
                        return NextResponse.json({
                            error: "Access Restricted",
                            message: "Your account is approved but doesn't have resume generation access yet."
                        }, { status: 403 });
                    }

                    // Simple Daily Limit Logic
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const lastDate = user.lastResumeDate ? new Date(user.lastResumeDate) : null;
                    if (lastDate) lastDate.setHours(0, 0, 0, 0);

                    const isNewDay = !lastDate || lastDate < today;

                    if (isNewDay) {
                        await prisma.user.update({
                            where: { id: userId },
                            data: { dailyResumeCount: 0, lastResumeDate: today }
                        });
                    }

                    const DAILY_LIMIT = 50;
                    if ((isNewDay ? 0 : user.dailyResumeCount) >= DAILY_LIMIT) {
                        return NextResponse.json({ error: "Daily limit reached" }, { status: 403 });
                    }
                }
            }
        } catch (authError) {
            console.error("Auth Error", authError);
        }

        // Database logging and credits deduction
        try {
            if (userId) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        creditsUsed: { increment: 1 },
                        dailyResumeCount: { increment: 1 },
                        lastResumeDate: today
                    }
                });
            }

            await prisma.resumeLog.create({
                data: {
                    jobTitle, companyName, matchScore: analysis.matchScore || 0,
                    originalName: file.name, userEmail, userId, status: "SUCCESS",
                    fileData: outputBuffer.toString("base64")
                }
            });
        } catch (dbError) {
            console.warn("DB Log Error", dbError);
        }

        const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '_');
        const customFileName = `${sanitize(userName)}_${sanitize(companyName)}_${sanitize(jobTitle)}_resume.docx`;

        return NextResponse.json({
            success: true,
            analysis,
            fileData: outputBuffer.toString("base64"),
            fileName: customFileName,
        });

    } catch (error: any) {
        console.error("❌ Fatal Error:", error);
        return NextResponse.json({
            error: "Failed to generate resume",
            message: error.message,
        }, { status: 500 });
    }
}
