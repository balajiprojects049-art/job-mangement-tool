import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/app/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { prisma } from "@/app/lib/prisma"; // Database Connection

// REMOVED global initialization to prevent crash on load
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
    console.log("========== /api/generate-resume ==========");

    // Check API Key immediately
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY is missing!");
        return NextResponse.json({ error: "Server Configuration Error: GEMINI_API_KEY is missing" }, { status: 500 });
    }

    let genAI;
    try {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    } catch (e) {
        console.error("❌ Failed to initialize GoogleGenerativeAI:", e);
        return NextResponse.json({ error: "Failed to initialize AI service" }, { status: 500 });
    }

    console.log("METHOD:", request.method);
    console.log("URL:", request.url);
    console.log("GEMINI_API_KEY:", "Loaded");

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

        const prompt = `You are an expert ATS (Applicant Tracking System) Scanner and Professional Resume Writer.

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
- Include specific numbers, percentages, and quantifiable results whenever possible
- Make each bullet point substantial (15-25 words minimum)
- Focus on achievements and impact, not just responsibilities

CONTENT QUALITY REQUIREMENTS:
- Summary bullets must highlight core competencies, years of experience, and key technical skills
- Experience bullets must include: Action verb + What you did + How you did it + Quantifiable result/impact
- Use industry-specific terminology from the job description
- Include relevant technologies, tools, and methodologies
- Emphasize leadership, collaboration, and problem-solving
- Achievements should showcase measurable business impact

REQUIRED JSON OUTPUT FORMAT:
{
  "matchScore": (Integer 0-100 based on ACTUAL analysis),
  "resumeSummary": "A powerful 2-3 sentence professional summary highlighting years of experience, core expertise, and key value proposition aligned with the target role",
  "missingKeywords": ["List critical keywords found in JD but missing in Resume"],
  "insightsAndRecommendations": ["Specific advice to improve the score"],
  "replacements": {
      "summary_bullet_1": "Highly detailed professional summary point highlighting core expertise with specific years of experience and key technical competencies relevant to the job description",
      "summary_bullet_2": "Strong value proposition showcasing unique combination of technical skills and domain knowledge that directly addresses the job requirements",
      "summary_bullet_3": "Demonstrated track record of delivering measurable business outcomes through specific methodologies and technologies mentioned in the job description",
      "summary_bullet_4": "Proven ability to lead cross-functional teams and drive complex projects from conception to successful deployment with quantifiable results",
      "summary_bullet_5": "Extensive experience with specific tools, frameworks, and technologies listed in the job description with concrete examples of application",
      "summary_bullet_6": "Strong analytical and problem-solving capabilities demonstrated through successful resolution of critical business challenges",
      "summary_bullet_7": "Excellent communication and stakeholder management skills with proven ability to translate technical concepts for diverse audiences",

      "exp2_bullet_1": "Led development of comprehensive solution that resulted in specific percentage improvement in key business metric, utilizing relevant technologies and methodologies from job description while collaborating with cross-functional teams",
      "exp2_bullet_2": "Architected and implemented scalable system that processed specific volume of transactions or data, achieving specific performance metrics and reducing costs by quantifiable amount",
      "exp2_bullet_3": "Spearheaded initiative to improve specific process or system, resulting in measurable improvements in efficiency, quality, or user satisfaction through application of industry best practices",
      "exp2_bullet_4": "Designed and deployed advanced technical solution using specific technologies that enhanced system capability by quantifiable metric while ensuring reliability and performance standards",
      "exp2_bullet_5": "Collaborated with stakeholders across departments to deliver complex project ahead of schedule, managing specific number of team members and achieving measurable business impact",
      "exp2_bullet_6": "Resolved critical production issues by implementing innovative technical approach that reduced downtime by specific percentage and improved system stability metrics",
      "exp2_achievement_1": "Delivered transformational project that generated specific revenue increase or cost savings of quantifiable amount through strategic implementation of cutting-edge technology",
      "exp2_achievement_2": "Recognized with specific award or achievement for outstanding contribution to major initiative that resulted in measurable organizational impact",

      "exp1_bullet_1": "Developed and maintained sophisticated applications serving specific number of users, implementing features that increased engagement metrics by quantifiable percentage using relevant technical stack",
      "exp1_bullet_2": "Optimized critical system components resulting in specific performance improvement and reduced resource consumption by measurable amount through application of advanced techniques",
      "exp1_bullet_3": "Implemented comprehensive testing and quality assurance processes that reduced defect rates by specific percentage while accelerating delivery timelines",
      "exp1_bullet_4": "Mentored team of specific number of developers on best practices and emerging technologies, fostering culture of continuous improvement and technical excellence",
      "exp1_bullet_5": "Integrated third-party systems and APIs to enhance platform capabilities, enabling new revenue streams and improving user experience metrics by quantifiable amount",
      "exp1_bullet_6": "Automated critical workflows using specific technologies that eliminated manual effort equivalent to specific time savings and reduced error rates significantly",
      "exp1_achievement_1": "Successfully delivered high-visibility project that supported major business objective, achieving specific metric improvement and earning recognition from leadership",
      "exp1_achievement_2": "Pioneered adoption of innovative technology or methodology that became standard practice across organization, improving team productivity by measurable percentage"
  }
}

Remember: Write natural, professional content without any markdown or special formatting symbols. Focus on creating compelling, detailed, and quantifiable achievements that demonstrate clear value and align with the job requirements.`;

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
                    generationConfig: {
                        temperature: 0,  // Make output deterministic (same input = same output)
                        topP: 0.1,       // Focus on most likely tokens
                        topK: 1          // Always pick the most likely token
                    },
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

            outputBuffer = Buffer.from(doc.getZip().generate({
                type: "nodebuffer",
                compression: "DEFLATE",
            }) as any);
            console.log("✅ DOCX Updated Successfully!");
        } catch (docxError: any) {
            console.error("❌ Docxtemplater Error:", docxError);
            if (docxError.properties && docxError.properties.errors) {
                docxError.properties.errors.forEach((e: any) => console.error("Template Error:", e));
            }
            // We continue returning the original file if templating fails
        }



        // 🔍 DEBUG MODE: SKIPPING AUTH & DB LOGGING TO ISOLATE ERROR
        // ---------------------------------------------------------
        let userEmail = "Debug_User";
        let userName = "Debug User";
        let userId: string | null = null;

        // const sessionUserId = await getUserId();
        // ... (Auth checks commented out) 

        console.log("⚠️ DEBUG: Auth & DB checks skipped. Running in bypass mode.");

        /*
        if (sessionUserId) {
            // ... (original auth logic)
        }
        */

        // 📊 SAFE DATABASE LOGGING & INCREMENT USAGE
        /*
        try {
            await prisma.resumeLog.create({ ... });
            if (userId) { await prisma.user.update({ ... }); }
        } catch (dbError) {
            console.warn("⚠️ Database logging failed (Non-critical):", dbError);
        }
        */
        // ---------------------------------------------------------

        // Create custom filename: Name_Company_Role_resume.docx
        const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '_');
        const customFileName = `${sanitize(userName)}_${sanitize(companyName)}_${sanitize(jobTitle)}_resume.docx`;

        return NextResponse.json({
            success: true,
            analysis,
            fileData: outputBuffer.toString("base64"), // Return the MODIFIED file
            fileName: customFileName,
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
