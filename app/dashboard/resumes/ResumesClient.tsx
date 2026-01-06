"use client";

import { useState, useMemo } from "react";
import { Download, Eye, Calendar, Briefcase, FileText, Search, X, Filter, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Resume {
    id: string;
    jobTitle: string | null;
    companyName: string | null;
    matchScore: number;
    createdAt: Date;
    originalName: string;
    isFavorite: boolean;
}

interface ResumesClientProps {
    resumes: Resume[];
}

export function ResumesClient({ resumes: initialResumes }: ResumesClientProps) {
    const router = useRouter();
    const [resumes, setResumes] = useState(initialResumes);
    // ... (other state variables remain same)

    // ... (getScoreBadge and toggleFavorite remain same)

    const handleDelete = async (resumeId: string) => {
        if (!confirm("Are you sure you want to delete this resume? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await fetch(`/api/resumes/${resumeId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setResumes(resumes.filter(r => r.id !== resumeId));
                router.refresh(); // Refresh server state as well
            } else {
                alert("Failed to delete resume");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("An error occurred while deleting");
        }
    };
    const [searchQuery, setSearchQuery] = useState("");
    const [filterScore, setFilterScore] = useState<"all" | "high" | "medium" | "low">("all");
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<"date" | "score" | "company">("date");

    const getScoreBadge = (score: number) => {
        if (score >= 90) return "status-badge success";
        if (score >= 75) return "status-badge warning";
        return "status-badge error";
    };

    const toggleFavorite = async (resumeId: string, currentStatus: boolean) => {
        setTogglingFavorite(resumeId);
        try {
            const response = await fetch("/api/resumes/toggle-favorite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeId,
                    isFavorite: !currentStatus,
                }),
            });

            if (response.ok) {
                setResumes(resumes.map(r =>
                    r.id === resumeId ? { ...r, isFavorite: !currentStatus } : r
                ));
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
        } finally {
            setTogglingFavorite(null);
        }
    };

    // Get date label for grouping
    const getDateLabel = (date: Date) => {
        const resumeDate = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Reset times to midnight for comparison
        resumeDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);

        if (resumeDate.getTime() === today.getTime()) {
            return "Today";
        } else if (resumeDate.getTime() === yesterday.getTime()) {
            return "Yesterday";
        } else {
            return resumeDate.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        }
    };

    // Filter and sort resumes
    const filteredAndSortedResumes = useMemo(() => {
        let filtered = resumes.filter((resume) => {
            // Favorites filter
            if (showFavoritesOnly && !resume.isFavorite) {
                return false;
            }

            // Search filter
            const matchesSearch = searchQuery === "" ||
                resume.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                resume.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                resume.originalName.toLowerCase().includes(searchQuery.toLowerCase());

            // Score filter
            const matchesScore = filterScore === "all" ||
                (filterScore === "high" && resume.matchScore >= 90) ||
                (filterScore === "medium" && resume.matchScore >= 75 && resume.matchScore < 90) ||
                (filterScore === "low" && resume.matchScore < 75);

            return matchesSearch && matchesScore;
        });

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === "date") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (sortBy === "score") {
                return b.matchScore - a.matchScore;
            } else if (sortBy === "company") {
                return (a.companyName || "").localeCompare(b.companyName || "");
            }
            return 0;
        });

        return filtered;
    }, [resumes, searchQuery, filterScore, showFavoritesOnly, sortBy]);

    // Group resumes by date
    const groupedResumes = useMemo(() => {
        const groups: { [key: string]: Resume[] } = {};

        filteredAndSortedResumes.forEach(resume => {
            const label = getDateLabel(new Date(resume.createdAt));
            if (!groups[label]) {
                groups[label] = [];
            }
            groups[label].push(resume);
        });

        return groups;
    }, [filteredAndSortedResumes]);

    const downloadResume = (id: string, filename: string) => {
        window.open(`/api/resumes/download?id=${id}&filename=${encodeURIComponent(filename)}`, "_blank");
    };

    const viewResume = (id: string) => {
        router.push(`/dashboard/resumes/${id}`);
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground mb-2">My Resumes</h1>
                        <p className="text-muted-foreground">View and manage your tailored resumes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold">
                            Total Resumes: {resumes.length}
                        </span>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="card p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Search */}
                        <div className="md:col-span-4 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by company, role, or filename..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="form-input pl-12 pr-10 w-full"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors"
                                >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>

                        {/* Score Filter */}
                        <div className="md:col-span-2 flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground hidden md:block" />
                            <select
                                value={filterScore}
                                onChange={(e) => setFilterScore(e.target.value as any)}
                                className="form-input w-full cursor-pointer"
                            >
                                <option value="all">All Scores</option>
                                <option value="high">⭐ High (90+)</option>
                                <option value="medium">📊 Medium (75-89)</option>
                                <option value="low">📉 Low (&lt;75)</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div className="md:col-span-3">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="form-input w-full cursor-pointer"
                            >
                                <option value="date">📅 Sort by Date</option>
                                <option value="score">📊 Sort by Score</option>
                                <option value="company">🏢 Sort by Company</option>
                            </select>
                        </div>

                        {/* Favorites Toggle */}
                        <div className="md:col-span-3">
                            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border-2 border-border hover:border-primary transition-colors">
                                <input
                                    type="checkbox"
                                    checked={showFavoritesOnly}
                                    onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                                <span className="text-sm font-medium">Favorites Only</span>
                            </label>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {(searchQuery || filterScore !== "all" || showFavoritesOnly) && (
                        <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Showing <span className="font-bold text-foreground">{filteredAndSortedResumes.length}</span> of {resumes.length} resumes
                            </span>
                            {filterScore !== "all" && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                                    Score: {filterScore}
                                    <button onClick={() => setFilterScore("all")}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {showFavoritesOnly && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
                                    Favorites
                                    <button onClick={() => setShowFavoritesOnly(false)}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Grouped Resumes */}
                {Object.keys(groupedResumes).length === 0 ? (
                    <div className="card p-12 text-center">
                        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">No resumes found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchQuery || filterScore !== "all" || showFavoritesOnly
                                ? "Try adjusting your filters"
                                : "Generate your first resume to get started"}
                        </p>
                        {(searchQuery || filterScore !== "all" || showFavoritesOnly) && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setFilterScore("all");
                                    setShowFavoritesOnly(false);
                                }}
                                className="btn btn-primary"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedResumes).map(([dateLabel, dateResumes]) => (
                            <div key={dateLabel}>
                                {/* Date Header */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg border-l-4 border-primary">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        <h2 className="text-lg font-bold text-foreground">{dateLabel}</h2>
                                        <span className="text-sm text-muted -foreground">({dateResumes.length})</span>
                                    </div>
                                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
                                </div>

                                {/* Resume Cards */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {dateResumes.map((resume) => (
                                        <div
                                            key={resume.id}
                                            className="card p-6 card-hover border-l-4 border-l-primary/50 hover:border-l-primary transition-all relative group"
                                        >
                                            {/* Top Actions: Favorite & Delete */}
                                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleFavorite(resume.id, resume.isFavorite)}
                                                    disabled={togglingFavorite === resume.id}
                                                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                    title={resume.isFavorite ? "Remove from favorites" : "Add to favorites"}
                                                >
                                                    <Star
                                                        className={`w-5 h-5 ${resume.isFavorite
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-muted-foreground hover:text-yellow-400'
                                                            } ${togglingFavorite === resume.id ? 'animate-spin' : ''}`}
                                                    />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(resume.id)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                                                    title="Delete Resume"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Job Title */}
                                            <h3 className="text-xl font-bold text-foreground mb-2 pr-16 truncate" title={resume.jobTitle || "Untitled Position"}>
                                                {resume.jobTitle || "Untitled Position"}
                                            </h3>

                                            {/* Company */}
                                            <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                                <Briefcase className="w-4 h-4 flex-shrink-0" />
                                                <span className="font-medium truncate" title={resume.companyName || "Unknown Company"}>
                                                    {resume.companyName || "Unknown Company"}
                                                </span>
                                            </div>

                                            {/* Date */}
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                                <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            {/* Score Badge */}
                                            <div className="mb-4">
                                                <span className={getScoreBadge(resume.matchScore)}>
                                                    {resume.matchScore}% Match
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => downloadResume(resume.id, resume.originalName)}
                                                    className="btn btn-primary flex-1 px-4 flex items-center justify-center gap-2"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>Download</span>
                                                </button>
                                                <button
                                                    onClick={() => viewResume(resume.id)}
                                                    className="btn btn-ghost px-4"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
