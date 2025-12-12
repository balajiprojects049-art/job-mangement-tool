"use client";

import { useState } from "react";
import {
    Upload,
    Wand2,
    FileText,
    X,
    CheckCircle2,
    Zap
} from "lucide-react";

export default function NewApplicationClient() {
    const [jobDescription, setJobDescription] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [step, setStep] = useState(1); // 1: Input, 2: Analyzing, 3: Result
    const [analysis, setAnalysis] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [generatedFile, setGeneratedFile] = useState<{ data: string; name: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleGenerate = async () => {
        if (!file || !jobDescription || !companyName || !jobTitle) {
            setError("Please fill in all fields (Company, Job Title, Description & File)");
            return;
        }

        setIsGenerating(true);
        setStep(2);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("resume", file);
            formData.append("jobDescription", jobDescription);
            formData.append("companyName", companyName);
            formData.append("jobTitle", jobTitle);

            const response = await fetch("/api/generate-resume", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.details || errorData.message || "Failed to generate resume");
            }

            const result = await response.json();

            setAnalysis(result.analysis);
            setGeneratedFile({
                data: result.fileData,
                name: result.fileName,
            });
            setStep(3);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setStep(1);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!generatedFile) return;

        const byteCharacters = atob(generatedFile.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = generatedFile.name;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">Create New Application</h1>
                <p className="text-muted-foreground text-lg">Upload your resume and the job description to get a perfect ATS-optimized match.</p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3 animate-fade-in">
                    <div className="text-2xl">⚠️</div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">Error</p>
                        <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="btn btn-ghost p-2 h-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT COLUMN: INPUTS */}
                <div className="space-y-6">

                    {/* Company & Job Title */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="card p-5">
                            <label className="form-label text-xs uppercase tracking-wider">
                                Target Company
                            </label>
                            <input
                                type="text"
                                className="w-full bg-transparent text-foreground font-semibold text-lg focus:outline-none placeholder:text-muted-foreground"
                                placeholder="e.g. Google"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                            />
                        </div>
                        <div className="card p-5">
                            <label className="form-label text-xs uppercase tracking-wider">
                                Target Role
                            </label>
                            <input
                                type="text"
                                className="w-full bg-transparent text-foreground font-semibold text-lg focus:outline-none placeholder:text-muted-foreground"
                                placeholder="e.g. Frontend Developer"
                                value={jobTitle}
                                onChange={e => setJobTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Job Description Input */}
                    <div className="card p-6">
                        <label className="form-label mb-4">
                            1. Paste Job Description
                        </label>
                        <textarea
                            className="form-textarea h-64 resize-none"
                            placeholder="Paste the full job description here (Responsibilities, Requirements, etc.)..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>

                    {/* Resume Upload */}
                    <div className="card p-6">
                        <label className="form-label mb-4">
                            2. Upload Resume Template (.docx)
                        </label>

                        {!file ? (
                            <div
                                className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors group cursor-pointer"
                                onClick={() => document.getElementById('resume-upload')?.click()}
                            >
                                <input
                                    id="resume-upload"
                                    type="file"
                                    accept=".docx"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <p className="text-sm font-semibold text-foreground mb-1">Click to upload or drag and drop</p>
                                <p className="text-xs text-muted-foreground">DOCX files only (with placeholders)</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setFile(null)}
                                    className="btn btn-ghost p-2 h-auto rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!file || !jobDescription || !companyName || !jobTitle || isGenerating}
                        className="btn btn-primary w-full py-5 text-base shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Optimizing Resume...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-5 h-5" />
                                Generate Tailored Resume
                            </>
                        )}
                    </button>
                </div>

                {/* RIGHT COLUMN: PREVIEW / STATUS */}
                <div className="relative">
                    <div className={`card glass-card p-6 min-h-[700px] relative overflow-hidden transition-all duration-500 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>

                        {step === 1 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                <Wand2 className="w-20 h-20 text-muted-foreground mb-6 opacity-30" />
                                <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Optimize</h3>
                                <p className="text-muted-foreground max-w-sm">Fill in the details on the left to see the AI magic happen here.</p>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-background/80 backdrop-blur-sm z-20">
                                <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6" />
                                <h3 className="text-2xl font-bold text-foreground mb-2">Analyzing Job Requirements...</h3>
                                <p className="text-primary font-medium">Matching keywords and optimizing content</p>
                            </div>
                        )}

                        {step === 3 && analysis && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Score Header */}
                                <div className="flex items-center justify-between pb-6 border-b border-border">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">ATS Match Score</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-bold text-green-600 dark:text-green-400">{analysis.matchScore}%</span>
                                            <span className="text-sm text-green-600 dark:text-green-400 font-semibold">Optimized</span>
                                        </div>
                                    </div>
                                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 border-4 border-green-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>

                                {/* Missing Keywords */}
                                {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-foreground mb-3">Missing Keywords</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.missingKeywords.slice(0, 6).map((keyword: string, i: number) => (
                                                <span key={i} className="status-badge error">
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recommended Skills */}
                                {analysis.recommendedSkillsToAdd && analysis.recommendedSkillsToAdd.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-foreground mb-3">Skills to Add</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.recommendedSkillsToAdd.slice(0, 6).map((skill: string, i: number) => (
                                                <span key={i} className="status-badge info">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* AI Insights */}
                                {analysis.insightsAndRecommendations && analysis.insightsAndRecommendations.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-primary" />
                                            AI Recommendations
                                        </h4>
                                        <div className="space-y-2">
                                            {analysis.insightsAndRecommendations.slice(0, 5).map((item: string, i: number) => (
                                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                                    <span className="text-sm text-foreground">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Optimized Summary */}
                                {analysis.resumeSummary && (
                                    <div className="p-4 rounded-xl bg-muted border border-border">
                                        <h4 className="text-sm font-semibold text-primary mb-2">✨ Optimized Summary</h4>
                                        <p className="text-sm text-foreground italic">"{analysis.resumeSummary}"</p>
                                    </div>
                                )}

                                {analysis.newBulletPoints && analysis.newBulletPoints.length > 0 && (
                                    <div className="p-4 rounded-xl bg-muted border border-border">
                                        <h4 className="text-sm font-semibold text-primary mb-3">✨ Optimized Bullet Points</h4>
                                        <ul className="list-disc list-inside space-y-2">
                                            {analysis.newBulletPoints.map((point: string, i: number) => (
                                                <li key={i} className="text-sm text-foreground">{point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Download Block */}
                                <div className="pt-6 border-t border-border">
                                    <button
                                        onClick={handleDownload}
                                        className="btn btn-primary w-full py-4 text-base shadow-xl"
                                    >
                                        <Upload className="w-5 h-5 rotate-180" />
                                        Download Optimized Resume
                                    </button>
                                    <p className="text-center text-xs text-muted-foreground mt-3">
                                        ✅ AI has optimized your resume! Ready to submit.
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
