'use client';

import { useState } from 'react';
import { Star, X, CheckCircle } from 'lucide-react';

export default function ReviewModal() {
    const [rating, setRating] = useState(5);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        text: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/testimonials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, rating })
            });

            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    (document.getElementById('review-modal') as any)?.close();
                    // Reset after transition
                    setTimeout(() => {
                        setSubmitted(false);
                        setFormData({ name: '', role: '', text: '' });
                        setRating(5);
                        setLoading(false);
                    }, 500);
                }, 2000);
            } else {
                alert('Failed to submit review. Please try again.');
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
            setLoading(false);
        }
    };

    return (
        <dialog id="review-modal" className="modal m-auto inset-0 fixed p-0 rounded-2xl shadow-2xl backdrop:bg-black/60 transition-all">
            <div className="modal-box bg-white p-0 max-w-md w-full relative overflow-hidden">
                <button
                    onClick={() => (document.getElementById('review-modal') as any)?.close()}
                    className="absolute right-4 top-4 btn-sm btn-circle btn-ghost text-lg z-20 text-zinc-400 hover:bg-zinc-100"
                >
                    <X className="h-5 w-5" />
                </button>

                {submitted ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center h-[480px]">
                        <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                            <CheckCircle className="h-10 w-10 text-emerald-600" />
                        </div>
                        <h3 className="font-black text-2xl text-zinc-900 mb-2">Received!</h3>
                        <p className="text-zinc-500 font-medium">Your review has been submitted for moderation. Thank you for your feedback.</p>
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="mb-6">
                            <h3 className="font-black text-2xl text-text-primary tracking-tight">Submit Feedback</h3>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Help us improve the platform</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Your Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Alex Chen"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Role & Company</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Senior Dev @ TechCorp"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Experience</label>
                                <textarea
                                    placeholder="How has WorkToolsHub helped your workflow?"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 h-28 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                    value={formData.text}
                                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                                ></textarea>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-3">Rating</label>
                                <div className="flex gap-2 justify-center bg-zinc-50 py-3 rounded-xl border border-zinc-200">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="transition-transform hover:scale-110 active:scale-95 p-1"
                                        >
                                            <Star
                                                className={`h-8 w-8 transition-colors ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                disabled={loading}
                                className="btn-primary w-full h-14 text-base shadow-lg shadow-blue-600/20 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
}
