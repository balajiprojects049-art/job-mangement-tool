"use client";

import { useState, useMemo } from "react";
import { Users, Search, X, Filter } from "lucide-react";
import UserActions from "./UserActions";

interface User {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    status: string;
    createdAt: Date;
}

interface RegisteredClientsTableProps {
    users: User[];
}

export default function RegisteredClientsTable({ users: initialUsers }: RegisteredClientsTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [planFilter, setPlanFilter] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // Filter users based on search and filters
    const filteredUsers = useMemo(() => {
        let filtered = initialUsers;

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.phone?.toLowerCase().includes(query) ||
                user.status.toLowerCase().includes(query)
            );
        }

        // Apply plan filter
        if (planFilter !== "ALL") {
            filtered = filtered.filter(user =>
                ((user as any).plan || "NONE") === planFilter
            );
        }

        // Apply status filter
        if (statusFilter !== "ALL") {
            filtered = filtered.filter(user => user.status === statusFilter);
        }

        return filtered;
    }, [initialUsers, searchQuery, planFilter, statusFilter]);

    return (
        <div className="card overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        Registered Clients
                    </h2>
                    <span className="status-badge info">Latest 50</span>
                </div>

                {/* Search Bar and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Search Input */}
                    <div className="md:col-span-6 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-input pl-12 pr-10 w-full"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        )}
                    </div>

                    {/* Plan Filter */}
                    <div className="md:col-span-3 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground hidden md:block" />
                        <select
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                            className="form-input w-full cursor-pointer"
                        >
                            <option value="ALL">All Plans</option>
                            <option value="NONE">🔒 No Plan</option>
                            <option value="FREE">🎁 FREE Plan</option>
                            <option value="PRO">⭐ PRO Plan</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="md:col-span-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-input w-full cursor-pointer"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">⏳ Pending</option>
                            <option value="APPROVED">✓ Approved</option>
                            <option value="ACTIVE">✓ Active</option>
                            <option value="REJECTED">✗ Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Results count and active filters */}
                {(searchQuery || planFilter !== "ALL" || statusFilter !== "ALL") && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                            Found <span className="font-bold text-foreground">{filteredUsers.length}</span> of {initialUsers.length} users
                        </p>

                        {/* Active Filters */}
                        <div className="flex gap-2">
                            {planFilter !== "ALL" && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                                    Plan: {planFilter}
                                    <button onClick={() => setPlanFilter("ALL")}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {statusFilter !== "ALL" && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                                    Status: {statusFilter}
                                    <button onClick={() => setStatusFilter("ALL")}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {(searchQuery || planFilter !== "ALL" || statusFilter !== "ALL") && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setPlanFilter("ALL");
                                        setStatusFilter("ALL");
                                    }}
                                    className="text-xs text-primary hover:underline font-medium"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Joined Date</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Daily Usage</th>
                            <th>Monthly Usage</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center text-muted-foreground py-12">
                                    {searchQuery ? (
                                        <>
                                            No users found matching "{searchQuery}"
                                            <br />
                                            <button
                                                onClick={() => setSearchQuery("")}
                                                className="mt-2 text-primary hover:underline"
                                            >
                                                Clear search
                                            </button>
                                        </>
                                    ) : (
                                        "No users registered yet."
                                    )}
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td className="text-muted-foreground font-medium">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
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
                                                {(user as any).dailyResumeLimit || 50}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">resumes today</span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${(user as any).creditsUsed >= ((user as any).plan === "PRO" ? 1500 : 5) ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                                {(user as any).creditsUsed || 0}
                                            </span>
                                            <span className="text-muted-foreground">/</span>
                                            <span className="text-muted-foreground font-medium">
                                                {(user as any).plan === "PRO" ? 1500 : 5}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">resumes this month</span>
                                    </td>
                                    <td>
                                        <UserActions
                                            userId={user.id}
                                            status={user.status}
                                            plan={(user as any).plan || "NONE"}
                                            hasFullAccess={(user as any).hasFullAccess || false}
                                            creditsUsed={(user as any).creditsUsed || 0}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
