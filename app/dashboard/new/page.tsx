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

export default function NewApplicationPage() {
    const [jobDescription, setJobDescription] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [jobTitle, setJobTitle] = useState("");

    // const [userEmail, setUserEmail] = useState(""); // REMOVED: Auto-detected by backend
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

    // ... [handleDownload etc remain same] ...
    const handleDownload = () => {
        if (!generatedFile) return;

        // Convert base64 to blob and download
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
        <div className="max-w-6xl mx-auto animate-fade-in">
            {/* ... [Header & Error remain same] ... */}

            {/* Re-render header to keep context (simplified for replacement) */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create New Application</h1>
                    <p className="text-slate-400">Upload your resume and the job description to get a perfect match.</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-red-400">Error</p>
                        <p className="text-sm text-red-300/80">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT COLUMN: INPUTS */}
                <div className="space-y-6">

                    {/* NEW: Company & Job Title */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-[#0F1117]/50 border border-white/5 backdrop-blur-xl">
                            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                                Target Company
                            </label>
                            <input
                                type="text"
                                className="w-full bg-transparent text-white font-medium focus:outline-none placeholder:text-slate-600"
                                placeholder="e.g. Google"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                            />
                        </div>
                        <div className="p-4 rounded-2xl bg-[#0F1117]/50 border border-white/5 backdrop-blur-xl">
                            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                                Target Role
                            </label>
                            <input
                                type="text"
                                className="w-full bg-transparent text-white font-medium focus:outline-none placeholder:text-slate-600"
                                placeholder="e.g. Frontend Dev"
                                value={jobTitle}
                                onChange={e => setJobTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Job Description Input */}
                    <div className="p-6 rounded-2xl bg-[#0F1117]/50 border border-white/5 backdrop-blur-xl">
                        <label className="block text-sm font-semibold text-slate-300 mb-4">
                            1. Paste Job Description
                        </label>
                        <textarea
                            className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none placeholder:text-slate-600"
                            placeholder="Paste the full job description here (Responsibilities, Requirements, etc.)..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>

                    {/* Resume Upload */}
                    <div className="p-6 rounded-2xl bg-[#0F1117]/50 border border-white/5 backdrop-blur-xl">
                        <label className="block text-sm font-semibold text-slate-300 mb-4">
                            2. Upload Resume Template (.docx)
                        </label>

                        {!file ? (
                            <div
                                className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors group cursor-pointer relative"
                                onClick={() => document.getElementById('resume-upload')?.click()}
                            >
                                <input
                                    id="resume-upload"
                                    type="file"
                                    accept=".docx"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform pointer-events-none">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-medium text-slate-300 pointer-events-none">Click to upload or drag and drop</p>
                                <p className="text-xs text-slate-500 mt-1 pointer-events-none">DOCX files only (with placeholders)</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{file.name}</p>
                                        <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setFile(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!file || !jobDescription || isGenerating}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]
              ${(!file || !jobDescription)
                                ? "bg-white/5 text-slate-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40"
                            }
            `}
                    >
                        {isGenerating ? (
                            <>
                                <Wand2 className="w-5 h-5 animate-spin" />
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
                    {/* Analysis Card */}
                    <div className={`transition-all duration-500 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>
                        <div className="p-6 rounded-2xl bg-[#0F1117] border border-white/10 h-full min-h-[600px] relative overflow-hidden">

                            {step === 1 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 opacity-50">
                                    <Wand2 className="w-16 h-16 text-slate-600 mb-6" />
                                    <h3 className="text-xl font-bold text-slate-500 mb-2">Ready to Optimize</h3>
                                    <p className="text-slate-600 max-w-xs">Fill in the details on the left to see the AI magic happen here.</p>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-black/50 z-20 backdrop-blur-sm">
                                    <div className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6" />
                                    <h3 className="text-xl font-bold text-white mb-2">Analyzing Job Requirements...</h3>
                                    <p className="text-indigo-300">Matching keywords: "React", "AWS", "CI/CD"</p>
                                </div>
                            )}

                            {step === 3 && analysis && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Score Header */}
                                    <div className="flex items-center justify-between pb-6 border-b border-white/10">
                                        <div>
                                            <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">ATS Match Score</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-bold text-green-400">{analysis.matchScore}%</span>
                                                <span className="text-sm text-green-500/80 font-medium">Optimized</span>
                                            </div>
                                        </div>
                                        <div className="w-16 h-16 rounded-full border-4 border-green-500/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                                        </div>
                                    </div>

                                    {/* Missing Keywords */}
                                    {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-white mb-3">Missing Keywords</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.missingKeywords.slice(0, 6).map((keyword: string, i: number) => (
                                                    <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-xs text-red-300">
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recommended Skills */}
                                    {analysis.recommendedSkillsToAdd && analysis.recommendedSkillsToAdd.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-white mb-3">Skills to Add</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.recommendedSkillsToAdd.slice(0, 6).map((skill: string, i: number) => (
                                                    <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-300">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Insights */}
                                    {analysis.insightsAndRecommendations && analysis.insightsAndRecommendations.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-yellow-400" />
                                                AI Recommendations
                                            </h4>
                                            <div className="space-y-3">
                                                {analysis.insightsAndRecommendations.slice(0, 5).map((item: string, i: number) => (
                                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                                                        <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                                                        <span className="text-sm text-slate-300">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* REWRITTEN CONTENT DISPLAY */}
                                    {analysis.resumeSummary && (
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mt-6">
                                            <h4 className="text-sm font-semibold text-indigo-300 mb-2">✨ Optimized Summary</h4>
                                            <p className="text-sm text-slate-300 italic">"{analysis.resumeSummary}"</p>
                                        </div>
                                    )}

                                    {analysis.newBulletPoints && analysis.newBulletPoints.length > 0 && (
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mt-4">
                                            <h4 className="text-sm font-semibold text-indigo-300 mb-2">✨ Optimized Bullet Points</h4>
                                            <ul className="list-disc list-inside space-y-2">
                                                {analysis.newBulletPoints.map((point: string, i: number) => (
                                                    <li key={i} className="text-sm text-slate-300">{point}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Download Block */}
                                    <div className="pt-6 border-t border-white/10">
                                        <button
                                            onClick={handleDownload}
                                            className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Upload className="w-4 h-4 rotate-180" />
                                            Download Optimized Resume
                                        </button>
                                        <p className="text-center text-xs text-slate-500 mt-3">
                                            ✅ AI has filled your template! Ready to submit.
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
