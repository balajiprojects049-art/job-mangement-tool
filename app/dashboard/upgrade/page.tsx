"use client";

import { Check, Shield, Zap } from "lucide-react";

export default function UpgradePage() {
    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-fade-in py-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    Upgrade to JobFit Pro
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Unlock higher limits, premium resume templates, and priority AI processing to land your dream job faster.
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">

                {/* Free Plan (Current) */}
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 opacity-70 hover:opacity-100 transition-opacity">
                    <h3 className="text-xl font-bold text-white mb-2">Free Starter</h3>
                    <div className="text-3xl font-bold text-slate-300 mb-6">$0<span className="text-sm font-medium text-slate-500">/mo</span></div>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-slate-300">
                            <Check className="w-5 h-5 text-indigo-500" />
                            <span>5 Resume Generations</span>
                        </li>
                        <li className="flex items-center gap-3 text-slate-300">
                            <Check className="w-5 h-5 text-indigo-500" />
                            <span>Basic ATS Scan</span>
                        </li>
                        <li className="flex items-center gap-3 text-slate-300">
                            <Check className="w-5 h-5 text-indigo-500" />
                            <span>Standard Support</span>
                        </li>
                    </ul>

                    <button disabled className="w-full py-3 bg-white/10 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                        Current Plan
                    </button>
                </div>

                {/* PRO Plan (Target) */}
                <div className="relative p-8 rounded-3xl bg-[#0F1117] border border-indigo-500/50 shadow-2xl shadow-indigo-500/20 transform scale-105">
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
                        POPULAR
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400 fill-current" />
                        Pro Power
                    </h3>
                    <div className="text-4xl font-bold text-white mb-6">$19<span className="text-sm font-medium text-slate-400">/mo</span></div>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-white">
                            <div className="p-1 bg-green-500/20 rounded-full text-green-400"><Check className="w-4 h-4" /></div>
                            <span>20+ Resume Generations</span>
                        </li>
                        <li className="flex items-center gap-3 text-white">
                            <div className="p-1 bg-green-500/20 rounded-full text-green-400"><Check className="w-4 h-4" /></div>
                            <span>Advanced AI Optimization</span>
                        </li>
                        <li className="flex items-center gap-3 text-white">
                            <div className="p-1 bg-green-500/20 rounded-full text-green-400"><Check className="w-4 h-4" /></div>
                            <span>Priority Email Support</span>
                        </li>
                        <li className="flex items-center gap-3 text-white">
                            <div className="p-1 bg-green-500/20 rounded-full text-green-400"><Check className="w-4 h-4" /></div>
                            <span>Access to New Templates</span>
                        </li>
                    </ul>

                    <button
                        onClick={() => alert("Payment Gateway Integration Coming Soon! (Contact Admin to Upgrade Manually)")}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                    >
                        Upgrade Now <Shield className="w-4 h-4" />
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-3">Secure payment via Stripe (Demo)</p>
                </div>
            </div>

            {/* Info Section */}
            <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-center max-w-2xl mx-auto">
                <p className="text-blue-300 text-sm">
                    <strong>Note for Beta Users:</strong> Pricing is currently subject to change. Contact the admin team directly for bulk enterprise plans.
                </p>
            </div>
        </div>
    );
}
