import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    // 1. Verify Admin (Security Check)
    const cookieStore = cookies();
    const adminAuth = cookieStore.get("admin_auth");
    if (!adminAuth) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { userId } = await req.json();

        if (!userId) {
            return new NextResponse("Missing userId", { status: 400 });
        }

        // 2. Perform Cascade Delete Manually
        // Since schema doesn't have onDelete: Cascade, we must delete related records first.

        // Delete Resume Logs
        await prisma.resumeLog.deleteMany({
            where: { userId }
        });

        // Delete Login History
        await prisma.loginHistory.deleteMany({
            where: { userId }
        });

        // Delete System Activity
        await prisma.systemActivity.deleteMany({
            where: { userId }
        });

        // Finally Delete User
        await prisma.user.delete({
            where: { id: userId }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Delete User Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
