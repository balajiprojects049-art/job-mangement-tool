import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        // Find User
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || user.password !== password) {
            return new NextResponse("Invalid credentials", { status: 401 });
        }

        // ⛔ CHECK APPROVAL STATUS
        if (user.status !== "ACTIVE") {
            return new NextResponse("Your account is pending Admin Approval. Please wait for confirmation.", { status: 403 });
        }

        // ✅ LOGIN SUCCESS: Track It!
        await prisma.loginHistory.create({
            data: {
                userId: user.id,
                ipAddress: "127.0.0.1" // In real deploy, extract from headers
            }
        });

        // Set Cookie with proper attributes for cross-page navigation
        cookies().set("user_session", user.id, {
            httpOnly: true,
            path: "/",
            maxAge: 86400, // 1 day
            sameSite: "lax", // Important: allows cookie to be sent on same-site navigations
            secure: process.env.NODE_ENV === "production" // HTTPS only in production
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Login Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
