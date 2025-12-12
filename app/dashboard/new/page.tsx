import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import ViewOnlyNotice from "@/components/dashboard/ViewOnlyNotice";
import NewApplicationClient from "./NewApplicationClient";

const prisma = new PrismaClient();

export default async function NewApplicationPage() {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("user_session");

    if (!sessionCookie?.value) {
        redirect("/login");
    }

    // Fetch user to check permissions
    const userId = sessionCookie.value;
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
