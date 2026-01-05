import { prisma } from "@/app/lib/prisma";
import SettingsClient from "./SettingsClient";
import { redirect } from "next/navigation";
import { getUserId } from "@/app/lib/auth";

export default async function SettingsPage() {
    // Get user ID from session
    const sessionId = await getUserId();

    if (!sessionId) {
        redirect("/");
    }

    // Fetch user data
    const user = await prisma.user.findUnique({
        where: { id: sessionId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profileImage: true,
            createdAt: true,
        }
    });

    if (!user) {
        redirect("/");
    }

    return <SettingsClient user={user} />;
}
