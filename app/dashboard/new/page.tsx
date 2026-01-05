import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import ViewOnlyNotice from "@/components/dashboard/ViewOnlyNotice";
import NewApplicationClient from "./NewApplicationClient";
import { getUserId } from "@/app/lib/auth";

const prisma = new PrismaClient();

export default async function NewApplicationPage() {
    // Get user ID from EITHER custom session OR NextAuth (Google) session
    const userId = await getUserId();

    // If no session exists, redirect to login
    if (!userId) {
        redirect("/login");
    }

    // Fetch user to check permissions
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { hasFullAccess: true, plan: true }
    });

    if (!user) {
        redirect("/login");
    }

    // 🔒 ACCESS CONTROL:
    // If user does not have full access OR has no plan, BLOCK access immediately
    // Show the "View Only" notice instead of the form.
    if (!user.hasFullAccess || user.plan === "NONE") {
        return <ViewOnlyNotice />;
    }

    // ✅ If access is granted, show the form
    return <NewApplicationClient />;
}
