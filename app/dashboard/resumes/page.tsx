import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { Download, Eye, Trash2, Calendar, Briefcase, TrendingUp, FileText } from "lucide-react";
import Link from "next/link";

export default async function ResumesPage() {
    // 1. Fetch User Data
    const cookieStore = cookies();
    const sessionId = cookieStore.get("user_session")?.value;

    let resumes: any[] = [];

    if (sessionId) {
        resumes = await prisma.resumeLog.findMany({
            where: { userId: sessionId },
            orderBy: { createdAt: 'desc' },
        });
    }

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-green-400 bg-green-500/10 border-green-500/20";
        if (score >= 75) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
        return "text-red-400 bg-red-500/10 border-red-500/20";
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">My Resumes</h1>
                    <p className="text-slate-400">View and manage your tailored resumes</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                        <p className="text-sm text-slate-400">
                            Total Resumes: <span className="text-white font-semibold">{resumes.length}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Resumes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {resumes.map((resume) => (
                    <div
                        key={resume.id}
                        className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/[0.07] transition-all group"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                                    {resume.jobTitle}
                                </h3>
                                <p className="text-sm text-slate-400 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    {resume.companyName}
                                </p>
                            </div>
                            <div
                                className={`px-3 py-1 rounded-full border text-sm font-semibold ${getScoreColor(
                                    resume.matchScore
                                )}`}
                            >
                                {resume.matchScore}%
                            </div>
                        </div>

                        {/* Meta Info */}
                        <div className="mb-6 pb-6 border-b border-white/10">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date(resume.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-2 truncate">File: {resume.originalName}</p>
                        </div>

                        {/* Actions (Placeholders for now) */}
                        <div className="flex items-center gap-3">
                            <button disabled className="flex-1 px-4 py-2.5 bg-indigo-600/50 text-white/50 text-sm font-medium rounded-xl flex items-center justify-center gap-2 cursor-not-allowed" title="Storage Not Implemented">
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                            <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-all border border-white/10">
                                <Eye className="w-4 h-4" />
                            </button>
                            <button className="px-4 py-2.5 bg-white/5 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-xl transition-all border border-white/10 hover:border-red-500/20">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {resumes.length === 0 && (
                <div className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 border border-white/10 rounded-full mb-4">
                        <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No resumes yet</h3>
                    <p className="text-slate-400 mb-6">Create your first tailored resume to get started</p>
                    <Link
                        href="/dashboard/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all"
                    >
                        Create Resume
                    </Link>
                </div>
            )}
        </div>
    );
}
