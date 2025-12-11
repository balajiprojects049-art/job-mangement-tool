"use client";

import Link from "next/link";
import { Zap, Clock } from "lucide-react";

interface SubscriptionStatsProps {
    plan: string;
    creditsUsed: number;
    maxCredits: number;
    daysLeft: number;
}

export default function SubscriptionStats({ plan, creditsUsed, maxCredits, daysLeft }: SubscriptionStatsProps) {
    const usagePercent = Math.min((creditsUsed / maxCredits) * 100, 100);
    const daysPercent = Math.min((daysLeft / 30) * 100, 100); // Assuming 30 day cycle

    return (
        <div className="md:col-span-1 space-y-4">
            {/* PLAN CARD */}
            <div className="bg-gradient-to-br from-[#1a1f3c] to-[#0f1117] border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-all duration-500" />

                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Zap className="w-5 h-5 text-indigo-400 fill-current" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg tracking-wide">{plan} PLAN</h3>
                        <p className="text-xs text-indigo-300 font-medium">Active Subscription</p>
                    </div>
                </div>

                {/* USAGE BAR */}
                <div className="mb-4 relative z-10">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Generations Used</span>
                        <span className="text-white font-bold">{creditsUsed} / {maxCredits}</span>
                    </div>
                    <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            style={{ width: `${usagePercent}%` }}
                        />
                    </div>
                </div>

                {/* DAYS LEFT BAR */}
                <div className="relative z-10">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Time Remaining</span>
                        <span className="text-white font-bold">{daysLeft} Days</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-slate-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${daysPercent}%` }}
                        />
                    </div>
                </div>
            </div>


            {plan === "FREE" && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-orange-500/20 text-center">
                    <p className="text-xs text-orange-300 mb-2">Need more power?</p>
                    <Link
                        href="/dashboard/upgrade"
                        className="block w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-orange-500/20"
                    >
                        Upgrade to PRO 🚀
                    </Link>
                </div>
            )}
        </div>
    );
}
