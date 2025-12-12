"use client";

import { useState, useMemo } from "react";
import { Download, Eye, Calendar, Briefcase, FileText, Search, X, Filter, Star } from "lucide-react";
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
    const [searchQuery, setSearchQuery] = useState("");
    const [filterScore, setFilterScore] = useState<"all" | "high" | "medium" | "low">("all");
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);

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
                // Update local state
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

    // Filter resumes based on search, score filter, and favorites
    const filteredResumes = useMemo(() => {
        return resumes.filter((resume) => {
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
    }, [resumes, searchQuery, filterScore, showFavoritesOnly]);

    const favoriteCount = resumes.filter(r => r.isFavorite).length;

    return (
        <>
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Search Input */}
                <div className="flex-1 relative">
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    )}
                </div>

                {/* Score Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-muted-foreground" />
                    <select
                        value={filterScore}
                        onChange={(e) => setFilterScore(e.target.value as any)}
                        className="form-input py-3 px-4 cursor-pointer"
                    >
                        <option value="all">All Scores</option>
                        <option value="high">90%+ (Excellent)</option>
                        <option value="medium">75-89% (Good)</option>
                        <option value="low">Below 75%</option>
                    </select>
                </div>
            </div>

            {/* Favorites Toggle */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`btn ${showFavoritesOnly ? 'btn-primary' : 'btn-ghost'} gap-2`}
                >
                    <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                    <span>Favorites Only</span>
                    {favoriteCount > 0 && (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${showFavoritesOnly ? 'bg-white/20' : 'bg-primary/10 text-primary'
                            }`}>
                            {favoriteCount}
                        </span>
                    )}
                </button>

                {/* Results Count */}
                {(searchQuery || filterScore !== "all" || showFavoritesOnly) && (
                    <p className="text-sm text-muted-foreground">
                        Found <span className="font-bold text-foreground">{filteredResumes.length}</span> of {resumes.length} resumes
                    </p>
                )}
            </div>

            {/* Resumes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredResumes.map((resume) => (
                    <div
                        key={resume.id}
                        className="card p-6 card-hover group relative"
                    >
                        {/* Favorite Star - Top Right */}
                        <button
                            onClick={() => toggleFavorite(resume.id, resume.isFavorite)}
                            disabled={togglingFavorite === resume.id}
                            className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${resume.isFavorite
                                ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-500/10'
                                : 'text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10'
                                } ${togglingFavorite === resume.id ? 'opacity-50 cursor-wait' : ''}`}
                            title={resume.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            <Star
                                className={`w-5 h-5 transition-all ${resume.isFavorite ? 'fill-current scale-110' : ''
                                    } ${togglingFavorite === resume.id ? 'animate-pulse' : ''}`}
                            />
                        </button>

                        {/* Header */}
                        <div className="flex items-start justify-between mb-4 pr-12">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors truncate">
                                    {resume.jobTitle || "Candidate Application"}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    {resume.companyName || "JobFit Pro"}
                                </p>
                            </div>
                            <div className={getScoreBadge(resume.matchScore)}>
                                {resume.matchScore}%
                            </div>
                        </div>

                        {/* Meta Info */}
                        <div className="mb-6 pb-6 border-b border-border space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">{new Date(resume.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <FileText className="w-4 h-4" />
                                <span className="truncate font-medium">{resume.originalName}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                disabled
                                className="btn btn-primary flex-1 gap-2 opacity-50 cursor-not-allowed"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                            <button className="btn btn-ghost px-4">
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Results State */}
            {filteredResumes.length === 0 && resumes.length > 0 && (
                <div className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-6">
                        {showFavoritesOnly ? (
                            <Star className="w-10 h-10 text-muted-foreground" />
                        ) : (
                            <Search className="w-10 h-10 text-muted-foreground" />
                        )}
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                        {showFavoritesOnly ? "No favorite resumes yet" : "No resumes found"}
                    </h3>
                    <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                        {showFavoritesOnly
                            ? "Star your favorite resumes to quickly find them later"
                            : "Try adjusting your search or filter criteria"}
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setFilterScore("all");
                            setShowFavoritesOnly(false);
                        }}
                        className="btn btn-ghost"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </>
    );
}
