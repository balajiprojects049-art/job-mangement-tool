"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    History,
    Settings,
    LogOut,
    Briefcase,
    User,
    Sun,
    Moon,
    MessageSquare
} from "lucide-react";

interface SidebarClientProps {
    user: {
        name: string | null;
        email: string;
        profileImage?: string | null;
    } | null;
}

export function SidebarClient({ user }: SidebarClientProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { name: "New Application", icon: PlusCircle, href: "/dashboard/new", highlight: true },
        { name: "My Resumes", icon: FileText, href: "/dashboard/resumes" },
        // TEMPORARILY HIDDEN - Will be removed after client confirmation
        // { name: "Job Tracker", icon: Briefcase, href: "/dashboard/tracker" },
        { name: "History", icon: History, href: "/dashboard/history" },
        { name: "Feedback", icon: MessageSquare, href: "/dashboard/feedback" },
        { name: "Settings", icon: Settings, href: "/dashboard/settings" },
    ];

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-card/95 backdrop-blur-xl border-r border-border flex flex-col z-40 shadow-sm">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <span className="font-bold text-white text-xl">J</span>
                    </div>
                    <span className="text-xl font-bold text-foreground tracking-tight">JobFit Pro</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
                ${isActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }
              `}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "group-hover:text-primary"}`} />
                            {item.name}
                            {item.highlight && !isActive && (
                                <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-primary/10 text-primary rounded-full">
                                    New
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User */}
            <div className="p-4 border-t border-border space-y-2">
                {/* Theme Toggle */}
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="btn btn-ghost w-full justify-start gap-3 px-4 py-3 h-auto text-sm"
                    >
                        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                    </button>
                )}

                {/* User Info */}
                {user && (
                    <div className="p-3 rounded-xl bg-muted flex items-center gap-3 border border-border">
                        <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center shadow-md overflow-hidden">
                            {user.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt={user.name || "User"}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                                {user.name || "User"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                )}

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    className="btn btn-ghost w-full justify-start gap-3 px-4 py-3 h-auto text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
