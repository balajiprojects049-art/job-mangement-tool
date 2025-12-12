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

        const body = await request.json();
        const { resumeId, isFavorite } = body;

        if (!resumeId || typeof isFavorite !== "boolean") {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        // Update the resume's favorite status
        const updatedResume = await prisma.resumeLog.update({
            where: {
                id: resumeId,
            },
            data: {
                isFavorite: isFavorite,
            },
        });

        // Verify the resume belongs to the user
        if (updatedResume.userId !== sessionId) {
            return NextResponse.json(
                { error: "Unauthorized - Resume does not belong to user" },
                { status: 403 }
            );
        }

        return NextResponse.json({ success: true, resume: updatedResume });
    } catch (error: any) {
        console.error("Toggle favorite error:", error);
        return NextResponse.json(
            { error: "Failed to update favorite status", details: error.message },
            { status: 500 }
        );
    }
}
