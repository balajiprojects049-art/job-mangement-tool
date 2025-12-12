"use client";

import { useState } from "react";
import { MessageSquare, Star, Send, CheckCircle, Lightbulb, Bug, Sparkles, X } from "lucide-react";

const categories = [
    { value: "bug", label: "Bug Report", icon: Bug, color: "text-red-600 dark:text-red-400" },
    { value: "feature", label: "Feature Request", icon: Lightbulb, color: "text-yellow-600 dark:text-yellow-400" },
    { value: "improvement", label: "Improvement", icon: Sparkles, color: "text-blue-600 dark:text-blue-400" },
    { value: "general", label: "General Feedback", icon: MessageSquare, color: "text-purple-600 dark:text-purple-400" },
];

export default function FeedbackPage() {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [category, setCategory] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!rating || !category || !message.trim()) {
            setError("Please fill in all fields");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, category, message }),
            });

            const data = await response.json();

            if (response.ok) {
                setShowSuccessModal(true);
                // Reset form
                setRating(0);
                setCategory("");
                setMessage("");
            } else {
                setError(data.error || "Failed to submit feedback");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setShowSuccessModal(false);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeModal}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-background border border-border rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>

                        {/* Success Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-bounce-in">
                                <CheckCircle className="w-12 h-12 text-white" />
                            </div>
                        </div>

                        {/* Success Message */}
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-bold text-foreground">
                                Thank You! 🎉
                            </h2>
                            <p className="text-lg text-foreground font-semibold">
                                Your feedback has been submitted successfully!
                            </p>
                            <p className="text-muted-foreground">
                                We appreciate you taking the time to share your thoughts.
                                Your input helps us improve JobFit Pro for everyone.
                            </p>
                        </div>

                        {/* Stats/Info */}
                        <div className="mt-8 p-4 bg-muted/50 rounded-xl">
                            <p className="text-sm text-center text-muted-foreground">
                                <span className="font-semibold text-foreground">What's next?</span><br />
                                Our team will review your feedback and may reach out if we need more details.
                            </p>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="btn btn-primary w-full mt-6 py-3"
                        >
                            Got it, thanks!
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-lg shadow-primary/30">
                    <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-3">Share Your Feedback</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Help us improve JobFit Pro! Your feedback is valuable and helps us build better features.
                </p>
            </div>

            {/* Feedback Form */}
            <div className="glass-card p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Rating */}
                    <div>
                        <label className="form-label mb-4 text-base">
                            How would you rate your experience?
                        </label>
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`w-10 h-10 transition-colors ${(hoveredRating || rating) >= star
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-muted-foreground"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-sm text-muted-foreground mt-2">
                                {rating === 5 && "⭐ Excellent!"}
                                {rating === 4 && "😊 Great!"}
                                {rating === 3 && "👍 Good"}
                                {rating === 2 && "😕 Needs Improvement"}
                                {rating === 1 && "😞 Poor"}
                            </p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="form-label mb-4 text-base">
                            What type of feedback is this?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categories.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setCategory(cat.value)}
                                    className={`card p-5 flex items-center gap-4 transition-all ${category === cat.value
                                        ? "border-primary bg-primary/5 shadow-md"
                                        : "hover:border-primary/50 hover:bg-muted/50"
                                        }`}
                                >
                                    <cat.icon className={`w-6 h-6 ${category === cat.value ? "text-primary" : cat.color}`} />
                                    <span className={`font-semibold ${category === cat.value ? "text-foreground" : "text-muted-foreground"}`}>
                                        {cat.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="form-label mb-3 text-base">
                            Tell us more
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Share your thoughts, suggestions, or issues you've encountered..."
                            className="form-textarea h-40 resize-none"
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            {message.length} / 1000 characters
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !rating || !category || !message.trim()}
                        className="btn btn-primary w-full py-4 text-base gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Submitting...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span>Submit Feedback</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Info Card */}
            <div className="card p-6 bg-muted/30">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Your feedback matters!
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    We read every piece of feedback and use it to improve JobFit Pro. Whether it's a bug report,
                    feature request, or general suggestion, your input helps us create a better product for everyone.
                </p>
            </div>
        </div>
    );
}
