import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

/**
 * Get the current user's ID from either:
 * 1. Custom session cookie (email/password login via /api/auth/login)
 * 2. NextAuth session (Google OAuth login)
 * 
 * Returns the user ID (string) or null if no session exists
 */
export async function getUserId(): Promise<string | null> {
    // Check custom session cookie first (email/password login)
    const cookieStore = cookies();
    const customSession = cookieStore.get("user_session")?.value;

    if (customSession) {
        return customSession;
    }

    // Check NextAuth session (Google login)
    const nextAuthSession = await getServerSession();
    if (nextAuthSession?.user?.email) {
        // For OAuth users, email is the user ID
        return nextAuthSession.user.email;
    }

    // No session found
    return null;
}

/**
 * Get the server session (NextAuth) for Google login users
 * Returns null if using custom email/password login
 */
export async function getAuthSession() {
    return await getServerSession();
}
