'use client';

import { useState, useEffect } from 'react';
import { Star, X, CheckCircle, Mail, AlertCircle } from 'lucide-react';

export default function ReviewModal() {
    const [rating, setRating] = useState(5);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        text: ''
    });

    // Auto-dismiss toast after 4 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/testimonials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, rating }),
                credentials: 'include'
            });

            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    (document.getElementById('review-modal') as any)?.close();
                    setTimeout(() => {
                        setSubmitted(false);
                        setFormData({ name: '', role: '', text: '' });
                        setRating(5);
                        setLoading(false);
                    }, 500);
                }, 2500);
            } else {
                setToast({ message: 'Failed to submit review. Please try again.', type: 'error' });
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setToast({ message: 'An error occurred. Please check your connection.', type: 'error' });
            setLoading(false);
        }
    };

    return (
        <dialog id="review-modal" className="modal m-auto inset-0 fixed p-0 rounded-2xl shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm transition-all">
            <div className="modal-box bg-white p-0 max-w-2xl w-full relative overflow-y-auto border border-zinc-200 shadow-xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-zinc-400 [scrollbar-width:thin] [scrollbar-color:rgb(212_212_216)_transparent]">
                {/* Close Button */}
                <button
                    onClick={() => (document.getElementById('review-modal') as any)?.close()}
                    className="absolute right-6 top-6 z-20 h-9 w-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-all hover:scale-105 active:scale-95"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Toast Notification */}
                {toast && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border ${toast.type === 'error'
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            }`}>
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm font-semibold">{toast.message}</span>
                            <button
                                onClick={() => setToast(null)}
                                className="ml-2 hover:opacity-70 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {submitted ? (
                    /* Success State */
                    <div className="p-16 flex flex-col items-center justify-center text-center min-h-[480px] bg-white">
                        <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border-2 border-emerald-200">
                            <CheckCircle className="h-10 w-10 text-emerald-600" strokeWidth={2} />
                        </div>
                        <h3 className="font-bold text-2xl text-zinc-900 mb-3 tracking-tight">Review Submitted</h3>
                        <p className="text-zinc-600 font-medium text-base max-w-md leading-relaxed">
                            Thank you for your feedback. Your review has been submitted and will be reviewed by our team.
                        </p>
                    </div>
                ) : (
                    <div className="p-10">
                        {/* Header */}
                        <div className="mb-8 pb-6 border-b border-zinc-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-11 w-11 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                                    <Mail className="h-6 w-6 text-zinc-700" />
                                </div>
                                <h3 className="font-bold text-2xl text-zinc-900 tracking-tight">Share Your Feedback</h3>
                            </div>
                            <p className="text-zinc-600 font-medium text-sm">
                                Help us improve by sharing your experience with WorkToolsHub
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Name Input */}
                                <div>
                                    <label className="block text-xs font-bold text-zinc-700 mb-2.5">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                {/* Role Input */}
                                <div>
                                    <label className="block text-xs font-bold text-zinc-700 mb-2.5">
                                        Role & Company
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Senior Developer @ Company"
                                        className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                                        required
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Experience Textarea */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-700 mb-2.5">
                                    Your Experience
                                </label>
                                <textarea
                                    placeholder="Tell us about your experience with our platform..."
                                    className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 h-32 resize-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                                    required
                                    value={formData.text}
                                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                                ></textarea>
                            </div>

                            {/* Star Rating */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-700 mb-3">
                                    Rating
                                </label>
                                <div className="flex gap-2 p-4 bg-zinc-50 rounded-xl border border-zinc-200 justify-center">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="transition-all hover:scale-110 active:scale-95 p-1.5"
                                        >
                                            <Star
                                                className={`h-8 w-8 transition-colors ${rating >= star
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-zinc-300 hover:text-zinc-400'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Submitting...
                                        </span>
                                    ) : (
                                        'Submit Review'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </dialog>
    );
}
