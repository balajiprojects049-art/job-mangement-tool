import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { FileText } from "lucide-react";
import Link from "next/link";
import { ResumesClient } from "./ResumesClient";

export default async function ResumesPage() {
    // Fetch User Data
    const cookieStore = cookies();
    const sessionId = cookieStore.get("user_session")?.value;

    let resumes: any[] = [];

    if (sessionId) {
        resumes = await prisma.resumeLog.findMany({
            where: { userId: sessionId },
            orderBy: { createdAt: 'desc' },
        });
    }

    return (
        <div className="p-6 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">My Resumes</h1>
                    <p className="text-muted-foreground text-lg">View and manage your tailored resumes</p>
                </div>
                <div className="card px-6 py-3 shadow-md">
                    <p className="text-sm text-muted-foreground">
                        Total Resumes: <span className="text-foreground font-bold text-lg ml-2">{resumes.length}</span>
                    </p>
                </div>
            </div>

            {/* Client Component with Search */}
            {resumes.length > 0 ? (
                <ResumesClient resumes={resumes} />
            ) : (
                /* Empty State */
                <div className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-6">
                        <FileText className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">No resumes yet</h3>
                    <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                        Create your first tailored resume to get started with AI-powered optimization
                    </p>
                    <Link
                        href="/dashboard/new"
                        className="btn btn-primary px-8 py-4 text-base shadow-xl inline-flex"
                    >
                        Create Resume
                    </Link>
                </div>
            )}
        </div>
    );
}
