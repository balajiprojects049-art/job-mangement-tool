import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

import { prisma } from "@/app/lib/prisma";

const handler = NextAuth({
    providers: [
        // Email & Password (Credentials)
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user) {
                    return null;
                }

                // Note: In production, use bcrypt.compare(credentials.password, user.password)
                if (user.password !== credentials.password) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.profileImage,
                };
            },
        }),
        // Google OAuth
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [
                GoogleProvider({
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    authorization: {
                        params: {
                            prompt: "select_account", // Always show account selection
                        }
                    }
                }),
            ]
            : []),
        // Facebook OAuth
        ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
            ? [
                FacebookProvider({
                    clientId: process.env.FACEBOOK_CLIENT_ID,
                    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
                }),
            ]
            : []),
    ],
    pages: {
        signIn: "/sign-in",
        signOut: "/",
        error: "/sign-in",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // For credentials provider, we already validated in authorize
            if (account?.provider === "credentials") {
                return true;
            }

            // For OAuth providers (Google/Facebook)
            if (!user.email) return false;

            try {
                // Check if user exists
                let existingUser = await prisma.user.findUnique({
                    where: { email: user.email }
                });

                if (!existingUser) {
                    // Create new user from social login
                    existingUser = await prisma.user.create({
                        data: {
                            id: user.email, // Using email as ID
                            email: user.email,
                            name: user.name || "",
                            phone: null,
                            password: "", // No password for OAuth users
                            status: "APPROVED",
                            plan: "FREE",
                            creditsUsed: 0,
                            hasFullAccess: true,
                        }
                    });
                }

                return true;
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return false;
            }
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
