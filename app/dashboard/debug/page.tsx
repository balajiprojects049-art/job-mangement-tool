import { prisma } from "@/app/lib/prisma";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    // Check Env Vars
    const hasGemini = !!process.env.GEMINI_API_KEY;
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
    const hasDbUrl = !!process.env.DATABASE_URL;
    const nextAuthUrl = process.env.NEXTAUTH_URL;

    // Check DB Connection
    let dbStatus = "Checking...";
    let userCount = 0;
    try {
        userCount = await prisma.user.count();
        dbStatus = "Connected";
    } catch (e: any) {
        dbStatus = `Error: ${e.message}`;
    }

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold mb-4">🔧 System Diagnostics</h1>

            <div className="card space-y-4 p-6 bg-card border border-border rounded-xl shadow-sm">
                <StatusItem label="GEMINI_API_KEY" status={hasGemini} errorMsg="Missing! AI Resume Generation will fail (500 Error)." />
                <StatusItem label="NEXTAUTH_SECRET" status={hasNextAuthSecret} errorMsg="Missing! Auth sessions might fail." />
                <StatusItem label="DATABASE_URL" status={hasDbUrl} />
                <StatusItem label="Database Connection" status={dbStatus === "Connected"} errorMsg={dbStatus} />

                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">NEXTAUTH_URL</span>
                    <code className="text-sm bg-background px-2 py-1 rounded border">{nextAuthUrl || "(Empty)"}</code>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">User Count</span>
                    <span className="text-sm">{userCount} users found</span>
                </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
                <p className="flex items-center gap-2 font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    How to fix missing variables on Vercel:
                </p>
                <ol className="list-decimal list-inside mt-2 space-y-1 ml-4">
                    <li>Go to Vercel Dashboard → Settings → Environment Variables</li>
                    <li>Add the missing keys (copy from your .env.local)</li>
                    <li>Go to Deployments → Redeploy</li>
                </ol>
            </div>
        </div>
    );
}

function StatusItem({ label, status, errorMsg }: { label: string, status: boolean, errorMsg?: string }) {
    return (
        <div className="flex items-start justify-between p-3 border-b border-border/50 last:border-0">
            <span className="font-medium">{label}</span>
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                    {status ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-sm">
                            <CheckCircle className="w-4 h-4" /> Connected
                        </span>
                    ) : (
                        <span className="text-red-600 dark:text-red-400 flex items-center gap-1 font-medium bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded text-sm">
                            <XCircle className="w-4 h-4" /> Missing / Failed
                        </span>
                    )}
                </div>
                {(!status && errorMsg) && (
                    <span className="text-xs text-red-500 mt-1 text-right max-w-[200px]">{errorMsg}</span>
                )}
            </div>
        </div>
    );
}
