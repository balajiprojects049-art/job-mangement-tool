import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { SidebarClient } from "./SidebarClient";

export async function Sidebar() {
    const session = await getServerSession();

    let user = null;

    if (session?.user?.email) {
        const userData = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                name: true,
                email: true,
                profileImage: true,
            },
        });
        user = userData;
    }

    return <SidebarClient user={user} />;
}
