import { prisma } from "@/app/lib/prisma";
import { FileText, Users, BarChart3, CheckCircle, XCircle, LogOut, Sun, Moon, MessageSquare, Star } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UserActions from "./UserActions";
import { logoutAction } from "../actions/auth";
import { AdminThemeToggle } from "./AdminThemeToggle";

// Force dynamic rendering so it always shows latest data
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    // 🔒 PROTECT ROUTE
    const cookieStore = cookies();
    const auth = cookieStore.get("admin_auth");

    if (!auth) {
        redirect("/admin/login");
    }

    // 1. Fetch Stats
    const totalResumes = await prisma.resumeLog.count();
    const totalUsers = await prisma.user.count();

    const avgScoreAgg = await prisma.resumeLog.aggregate({
        _avg: { matchScore: true }
    });
    const avgScore = Math.round(avgScoreAgg._avg.matchScore || 0);

    // 2. Fetch Resume Activity
    const logs = await prisma.resumeLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    // 3. Fetch Registered Users
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    // 4. Fetch User Feedback
    const totalFeedback = await prisma.feedback.count();
    const feedbackList = await prisma.feedback.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-8">
            {/* Background Pattern */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="bg-grid opacity-20"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 blur-3xl rounded-full animate-pulse-glow"></div>
                <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-accent/5 blur-3xl rounded-full animate-pulse-glow" style={{ animationDelay: "1s" }}></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                            Admin Dashboard
                        </h1>
                        <p className="text-muted-foreground text-lg">Monitor registered clients and system usage</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="status-badge success flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            System Online
                        </div>
                        <AdminThemeToggle />
                        <form action={logoutAction}>
                            <button type="submit" className="btn btn-ghost text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 gap-2">
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat 1 */}
                    <div className="card p-6 card-hover">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-blue-500/20 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <FileText className="w-7 h-7" />
                            </div>
                            <h3 className="text-muted-foreground font-semibold">Total Resumes</h3>
                        </div>
                        <p className="text-5xl font-bold text-foreground">{totalResumes}</p>
                    </div>

                    {/* Stat 2 */}
                    <div className="card p-6 card-hover">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-green-500/20 dark:bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                                <BarChart3 className="w-7 h-7" />
                            </div>
                            <h3 className="text-muted-foreground font-semibold">Avg ATS Score</h3>
                        </div>
                        <p className="text-5xl font-bold text-foreground">{avgScore}%</p>
                    </div>

                    {/* Stat 3 */}
                    <div className="card p-6 card-hover">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-purple-500/20 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <Users className="w-7 h-7" />
                            </div>
                            <h3 className="text-muted-foreground font-semibold">Registered Users</h3>
                        </div>
                        <p className="text-5xl font-bold text-foreground">{totalUsers}</p>
                    </div>

                    {/* Stat 4 - Feedback */}
                    <div className="card p-6 card-hover">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-yellow-500/20 dark:bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                <MessageSquare className="w-7 h-7" />
                            </div>
                            <h3 className="text-muted-foreground font-semibold">User Feedback</h3>
                        </div>
                        <p className="text-5xl font-bold text-foreground">{totalFeedback}</p>
                    </div>
                </div>

                {/* Data Tables */}
                <div className="space-y-8">

                    {/* SECTION 1: REGISTERED CLIENTS */}
                    <div className="card overflow-hidden">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                <Users className="w-6 h-6 text-primary" />
                                Registered Clients
                            </h2>
                            <span className="status-badge info">Latest 50</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Joined Date</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Daily Usage</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center text-muted-foreground py-12">No users registered yet.</td></tr>
                                    ) : users.map(user => (
                                        <tr key={user.id}>
                                            <td className="text-muted-foreground font-medium">{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td className="font-bold">
                                                {user.name || "N/A"}<br />
                                                <span className="text-xs font-normal text-muted-foreground">{user.phone}</span>
                                            </td>
                                            <td className="text-primary font-medium">{user.email}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold ${(user as any).dailyResumeCount >= (user as any).dailyResumeLimit ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                                        {(user as any).dailyResumeCount || 0}
                                                    </span>
                                                    <span className="text-muted-foreground">/</span>
                                                    <span className="text-muted-foreground font-medium">
                                                        {(user as any).dailyResumeLimit || 70}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">resumes today</span>
                                            </td>
                                            <td>
                                                <UserActions userId={user.id} status={user.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECTION 2: RESUME GENERATION LOGS */}
                    <div className="card overflow-hidden">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                <FileText className="w-6 h-6 text-accent" />
                                Resume Generations
                            </h2>
                            <span className="status-badge success">Real-time Activity</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>User / Email</th>
                                        <th>File Name</th>
                                        <th>Match Score</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted-foreground py-12">
                                                No activity recorded yet.
                                            </td>
                                        </tr>
                                    ) : logs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="text-muted-foreground font-medium">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td className="font-semibold">
                                                {log.userEmail || "Anonymous"}
                                            </td>
                                            <td className="text-muted-foreground">{log.originalName}</td>
                                            <td>
                                                <span className={`status-badge ${(log.matchScore || 0) >= 90 ? 'success' :
                                                    (log.matchScore || 0) >= 75 ? 'warning' :
                                                        'error'
                                                    }`}>
                                                    {log.matchScore || 0}%
                                                </span>
                                            </td>
                                            <td>
                                                {log.status === 'SUCCESS' ? (
                                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-semibold">
                                                        <CheckCircle className="w-4 h-4" /> Success
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-semibold">
                                                        <XCircle className="w-4 h-4" /> Failed
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECTION 3: USER FEEDBACK */}
                    <div className="card p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                <MessageSquare className="w-7 h-7 text-primary" />
                                User Feedback
                            </h2>
                            <span className="status-badge warning">Recent Submissions</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>User</th>
                                        <th>Rating</th>
                                        <th>Category</th>
                                        <th>Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feedbackList.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center text-muted-foreground py-12">No feedback received yet.</td></tr>
                                    ) : feedbackList.map(feedback => (
                                        <tr key={feedback.id}>
                                            <td className="text-muted-foreground font-medium">
                                                {new Date(feedback.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="font-semibold">{feedback.user.email}</td>
                                            <td>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < feedback.rating
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-muted-foreground"
                                                                }`}
                                                        />
                                                    ))}
                                                    <span className="text-xs text-muted-foreground ml-1">({feedback.rating}/5)</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${feedback.category === 'bug'
                                                    ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                                                    : feedback.category === 'feature'
                                                        ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                                                        : feedback.category === 'improvement'
                                                            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                                                            : 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'
                                                    }`}>
                                                    {feedback.category.charAt(0).toUpperCase() + feedback.category.slice(1)}
                                                </span>
                                            </td>
                                            <td className="text-muted-foreground max-w-md">
                                                <p className="truncate">{feedback.message}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
