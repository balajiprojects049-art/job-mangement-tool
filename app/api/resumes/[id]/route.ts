
import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resumeId = params.id;

        // Verify ownership before deleting
        const resume = await prisma.resumeLog.findUnique({
            where: { id: resumeId },
        });

        if (!resume) {
            return NextResponse.json({ error: "Resume not found" }, { status: 404 });
        }

        if (resume.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Delete the resume log
        // Note: We intentionally do NOT decrement the user's credit usage here.
        await prisma.resumeLog.delete({
            where: { id: resumeId },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Delete resume error:", error);
        return NextResponse.json(
            { error: "Failed to delete resume" },
            { status: 500 }
        );
    }
}
