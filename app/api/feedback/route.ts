import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = cookies();
        const sessionId = cookieStore.get("user_session")?.value;

        if (!sessionId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { rating, category, message } = await request.json();

        // Validation
        if (!rating || !category || !message) {
            return NextResponse.json(
                { error: "Please fill in all fields" },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        // Create feedback
        const feedback = await prisma.feedback.create({
            data: {
                userId: sessionId,
                rating: parseInt(rating),
                category,
                message,
                status: "PENDING",
            },
        });

        return NextResponse.json({
            success: true,
            message: "Thank you for your feedback!",
            feedback
        });
    } catch (error: any) {
        console.error("Submit feedback error:", error);
        return NextResponse.json(
            { error: "Failed to submit feedback", details: error.message },
            { status: 500 }
        );
    }
}
