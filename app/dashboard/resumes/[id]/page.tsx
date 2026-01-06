import { prisma } from "@/app/lib/prisma";
import { getUserId } from "@/app/lib/auth"; // Assuming this helper exists, similar to other pages
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Calendar, Building, Briefcase, FileText } from "lucide-react";

interface ResumePageProps {
    params: {
        id: string;
    };
}

export default async function ResumeDetailsPage({ params }: ResumePageProps) {
    const userId = await getUserId();

    if (!userId) {
        redirect("/login");
    }

    const resume = await prisma.resumeLog.findUnique({
        where: {
            id: params.id,
        },
    });

    if (!resume || resume.userId !== userId) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header / Back Button */}
                <div className="flex items-center gap-4 mb-6">
                    <Link
                        href="/dashboard/resumes"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to My Resumes
                    </Link>
                </div>

                {/* Main Content Card */}
                <div className="card p-8 space-y-8">

                    {/* Title Section */}
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 border-b border-border pb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                {resume.jobTitle || "Untitled Position"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    <span>{resume.companyName || "Unknown Company"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${(resume.matchScore || 0) >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    (resume.matchScore || 0) >= 75 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                {resume.matchScore}% Match
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                File Information
                            </h3>
                            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Original Filename</p>
                                    <p className="font-medium truncate" title={resume.originalName || ""}>
                                        {resume.originalName || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Generated On</p>
                                    <p className="font-medium">
                                        {new Date(resume.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-primary" />
                                Actions
                            </h3>
                            <div className="bg-muted/50 p-4 rounded-lg flex flex-col gap-3">
                                <p className="text-sm text-muted-foreground">
                                    Download your tailored resume in DOCX format.
                                </p>
                                <a
                                    href={`/api/resumes/download?id=${resume.id}&filename=${encodeURIComponent(resume.originalName || 'resume.docx')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary w-full flex items-center justify-center gap-2 py-2.5"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Resume
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
