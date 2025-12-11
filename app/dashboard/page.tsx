import Link from "next/link";
import { getServerSession } from "next-auth/next";
import {
    ArrowUpRight,
    Briefcase,
    Clock,
    FileText,
    Plus,
    TrendingUp
} from "lucide-react";

import { cookies } from "next/headers";
import { prisma } from "../lib/prisma";
import SubscriptionStats from "./SubscriptionStats";

// ...

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

    const userName = user?.name || "User";
    const plan = user?.plan || "FREE";
    const creditsUsed = user?.creditsUsed || 0;
    const limit = plan === "PRO" ? 20 : 5;

    // Calculate Days Left (Mock: 30 days from creation)
    // Real app would store "subscriptionStart"
    const daysUsed = Math.floor((new Date().getTime() - new Date(user?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(30 - (daysUsed % 30), 0); // Reset every 30 days logic

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                        Welcome back, {userName}
                    </h1>
                    <p className="text-slate-400">Here's what's happening with your job search.</p>
                </div>
                {/* ... button ... */}
                <Link
                    href="/dashboard/new"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    New Application
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* LEFT: STATS GRID (Takes 3 cols) */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Total Applications", value: appsCount, icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
                        { label: "Plan Type", value: plan, icon: Briefcase, color: "text-purple-400", bg: "bg-purple-400/10" },
                        { label: "Generations Left", value: Math.max(limit - creditsUsed, 0), icon: Clock, color: "text-orange-400", bg: "bg-orange-400/10" },
                    ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-[#0F1117]/50 border border-white/5 backdrop-blur-xl hover:border-white/10 transition-colors">
                            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-sm text-slate-400">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* RIGHT: SUBSCRIPTION CARD (Takes 1 col) */}
                <SubscriptionStats
                    plan={plan}
                    creditsUsed={creditsUsed}
                    maxCredits={limit}
                    daysLeft={daysLeft}
                />
            </div>

            {/* Recent Activity Table */}
            <div className="rounded-3xl bg-[#0F1117]/80 border border-white/5 overflow-hidden backdrop-blur-md">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Recent Applications</h2>
                    <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View All</button>
                </div>
                <div className="p-0">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs uppercase text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Job Role</th>
                                <th className="px-6 py-4">Company</th>
                                <th className="px-6 py-4">Match Score</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {[
                                { role: "Senior React Developer", company: "TechCorp", score: 92, status: "Applied", date: "2 mins ago" },
                                { role: "DevOps Engineer", company: "CloudSystems Inc", score: 85, status: "Interview", date: "1 day ago" },
                                { role: "Frontend Lead", company: "StartUp.io", score: 74, status: "Generated", date: "3 days ago" },
                            ].map((row, i) => (
                                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{row.role}</td>
                                    <td className="px-6 py-4 text-slate-400">{row.company}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${row.score > 90 ? 'bg-green-500' : row.score > 80 ? 'bg-indigo-500' : 'bg-yellow-500'}`}
                                                    style={{ width: `${row.score}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-400">{row.score}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                      ${row.status === 'Applied' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                row.status === 'Interview' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{row.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
