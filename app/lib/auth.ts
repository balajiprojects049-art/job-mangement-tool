import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/app/lib/auth-options";
import { prisma } from "@/app/lib/prisma";

/**
 * Get the current user's ID from either:
 * 1. Custom session cookie (email/password login via /api/auth/login)
 * 2. NextAuth session (Google OAuth login)
 * 
 * Returns the user ID (string) or null if no session exists
 */
export async function getUserId(): Promise<string | null> {
    try {
        // Check custom session cookie first (email/password login)
        const cookieStore = cookies();
        const customSession = cookieStore.get("user_session")?.value;

        if (customSession) {
            console.log("✅ Found custom session cookie");
            return customSession;
        }

        // Check NextAuth session (Google/OAuth login)
        const nextAuthSession = await getServerSession(authOptions);

        if (nextAuthSession?.user?.email) {
            console.log("✅ Found NextAuth session for:", nextAuthSession.user.email);

            // Look up user by email to get their actual database ID
            const user = await prisma.user.findUnique({
                where: { email: nextAuthSession.user.email },
                select: { id: true }
            });

            if (user) {
                console.log("✅ Found user in database with ID:", user.id);
                return user.id;
            } else {
                console.warn("⚠️ User email from session not found in database:", nextAuthSession.user.email);
                return null;
            }
        }

        console.log("ℹ️ No session found");
        return null;
    } catch (error) {
        console.error("❌ Error in getUserId:", error);
        return null;
    }
}

/**
 * Get the server session (NextAuth) for Google login users
 * Returns null if using custom email/password login
 */
export async function getAuthSession() {
    return await getServerSession(authOptions);
}
