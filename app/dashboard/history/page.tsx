import { prisma } from "@/app/lib/prisma";
import HistoryClient from "./HistoryClient";
import { getUserId } from "@/app/lib/auth";

export default async function HistoryPage() {
    // Get user ID from session
    const sessionId = await getUserId();

    if (!sessionId) {
        return (
            <div className="p-6">
                <div className="card p-12 text-center">
                    <h3 className="text-xl font-bold text-foreground mb-2">Not Logged In</h3>
                    <p className="text-muted-foreground">Please log in to view your history</p>
                </div>
            </div>
        );
    }

    // Fetch user's resume generation history
    const resumeLogs = await prisma.resumeLog.findMany({
        where: {
            userId: sessionId
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 100 // Last 100 activities
    });

    return <HistoryClient history={resumeLogs} />;
}
