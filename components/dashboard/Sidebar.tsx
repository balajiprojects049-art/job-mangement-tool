"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    History,
    Settings,
    LogOut,
    Zap,
    Briefcase,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user;

    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { name: "New Application", icon: PlusCircle, href: "/dashboard/new", highlight: true },
        { name: "My Resumes", icon: FileText, href: "/dashboard/resumes" },
        { name: "Job Tracker", icon: Briefcase, href: "/dashboard/tracker" },
        { name: "History", icon: History, href: "/dashboard/history" },
        { name: "Settings", icon: Settings, href: "/dashboard/settings" },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0F1117]/90 backdrop-blur-xl border-r border-white/5 flex flex-col z-40">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <span className="font-bold text-white text-xl">J</span>
                </div>
                <span className="text-xl font-bold text-white tracking-tight">JobFit Pro</span>
            </div>



            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                }
              `}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400"}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User */}
            <div className="p-4 border-t border-white/5">
                {user && (
                    <div className="mb-3 p-3 rounded-xl bg-white/5 flex items-center gap-3">
                        {user.image ? (
                            <img
                                src={user.image}
                                alt={user.name || "User"}
                                className="w-8 h-8 rounded-full"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user.name || "User"}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
