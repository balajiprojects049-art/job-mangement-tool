import Link from "next/link";
import {
    ArrowUpRight,
    Briefcase,
    Clock,
    FileText,
    Plus,
    BookOpen,
    CheckCircle,
    Sparkles,
    Zap,
    Target,
    Download,
    Star,
    Lightbulb,
    Rocket,
    ArrowRight
} from "lucide-react";

import { cookies } from "next/headers";
import { prisma } from "../lib/prisma";
import SubscriptionStats from "./SubscriptionStats";
import ViewOnlyNotice from "@/components/dashboard/ViewOnlyNotice";

export default async function DashboardPage() {
    // 1. Fetch Session & User
    const cookieStore = cookies();
    const sessionId = cookieStore.get("user_session")?.value;

    let user = null;
    let appsCount = 0;

    if (sessionId) {
        user = await prisma.user.findUnique({
            where: { id: sessionId },
            include: { ResumeLog: true }
        });
        if (user) {
            appsCount = user.ResumeLog.length;
        }
    }

    // 🔒 CHECK FULL ACCESS - Show view-only notice if no access
    if (user && !(user as any).hasFullAccess) {
        return <ViewOnlyNotice />;
    }

    const userName = user?.name || "User";
    const plan = user?.plan || "FREE";
    const creditsUsed = user?.creditsUsed || 0;
    const limit = plan === "PRO" ? 1500 : 5;

    // Calculate Days Left (Mock: 30 days from creation)
    const daysUsed = Math.floor((new Date().getTime() - new Date(user?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(30 - (daysUsed % 30), 0);

    return (
        <div className="space-y-8 animate-fade-in p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
                        Welcome back, {userName}
                    </h1>
                    <p className="text-muted-foreground">Here's what's happening with your job search.</p>
                </div>
                <Link
                    href="/dashboard/new"
                    className="btn btn-primary gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" />
                    New Application
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* LEFT: STATS GRID (Takes 3 cols) */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Total Applications", value: appsCount, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
                        { label: "Plan Type", value: plan, icon: Briefcase, color: "text-accent", bg: "bg-accent/10" },
                        { label: "Generations Left", value: Math.max(limit - creditsUsed, 0), icon: Clock, color: "text-secondary", bg: "bg-secondary/10" },
                    ].map((stat, i) => (
                        <div key={i} className="card p-6 card-hover flex flex-col justify-between">
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT: SUBSCRIPTION CARD (Takes 1 col) */}
                <SubscriptionStats
                    plan={plan}
                    creditsUsed={creditsUsed}
                    maxCredits={limit}
                    daysLeft={daysLeft}
                    dailyUsed={(user as any)?.dailyResumeCount || 0}
                    dailyLimit={(user as any)?.dailyResumeLimit || 50}
                />
            </div>

            {/* Getting Started Guide */}
            <div className="card overflow-hidden">
                <div className="card-header border-b border-border flex flex-row items-center justify-between bg-gradient-to-r from-primary/10 to-accent/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold text-foreground">How to Use JobFit Pro</h2>
                    </div>
                    <span className="text-xs px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full font-semibold">Quick Start Guide</span>
                </div>

                <div className="p-6 space-y-4">
                    {/* Step 1 */}
                    <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-600/5 border border-blue-200 dark:border-blue-500/20 hover:shadow-lg transition-all">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shadow-lg">
                                1
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                Upload Your Base Resume
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                Click on <span className="font-semibold text-blue-600">"New Application"</span> in the sidebar and upload your base resume (PDF format recommended).
                            </p>
                            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                <CheckCircle className="w-3 h-3" />
                                <span>Supports PDF, DOCX formats</span>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-500/10 dark:to-purple-600/5 border border-purple-200 dark:border-purple-500/20 hover:shadow-lg transition-all">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold shadow-lg">
                                2
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-purple-600" />
                                Enter Job Details
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                Paste the job description from LinkedIn, Indeed, or any job portal. Include company name and role for best results.
                            </p>
                            <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                                <Sparkles className="w-3 h-3" />
                                <span>AI analyzes job requirements automatically</span>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-500/10 dark:to-green-600/5 border border-green-200 dark:border-green-500/20 hover:shadow-lg transition-all">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold shadow-lg">
                                3
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-green-600" />
                                Generate Tailored Resume
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                Click <span className="font-semibold text-green-600">"Generate Resume"</span>. Our AI will optimize your resume for the specific job with ATS-friendly formatting.
                            </p>
                            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                <Target className="w-3 h-3" />
                                <span>Get your ATS match score instantly</span>
                            </div>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-500/10 dark:to-orange-600/5 border border-orange-200 dark:border-orange-500/20 hover:shadow-lg transition-all">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold shadow-lg">
                                4
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
                                <Download className="w-4 h-4 text-orange-600" />
                                Download & Apply
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                Download your optimized resume and use it to apply for the job. Track all your applications in <span className="font-semibold text-orange-600">"My Resumes"</span>.
                            </p>
                            <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                                <Star className="w-3 h-3" />
                                <span>Save favorites for quick access</span>
                            </div>
                        </div>
                    </div>

                    {/* Pro Tips */}
                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-100/50 dark:from-yellow-500/10 dark:to-amber-600/5 border-2 border-yellow-300 dark:border-yellow-500/30">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-foreground mb-2">💡 Pro Tips for Best Results</h4>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-600 dark:text-yellow-400">•</span>
                                        <span>Use complete job descriptions for accurate tailoring</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-600 dark:text-yellow-400">•</span>
                                        <span>Update your master resume regularly with new skills</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-600 dark:text-yellow-400">•</span>
                                        <span>Aim for 80%+ ATS match scores for better visibility</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-600 dark:text-yellow-400">•</span>
                                        <span>Review and customize the generated resume before applying</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="text-center pt-4">
                        <Link href="/dashboard/new" className="btn btn-primary px-8 py-3 text-base font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all gap-2">
                            <Rocket className="w-5 h-5" />
                            Get Started Now
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
