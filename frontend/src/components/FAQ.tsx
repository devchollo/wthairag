'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQProps {
    items: FAQItem[];
}

export default function FAQ({ items }: FAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Prepare JSON-LD Schema
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": items.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <section className="mt-20 border-t border-border-light pt-12">
            {/* JSON-LD for Search Engines */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />

            <div className="flex items-center gap-2 mb-8">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <HelpCircle className="h-4 w-4" />
                </div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight">Frequently Asked Questions</h2>
            </div>

            <div className="grid gap-4 max-w-3xl">
                {items.map((item, i) => (
                    <div
                        key={i}
                        className={`rounded-xl border transition-all duration-200 ${openIndex === i
                                ? 'bg-white border-blue-600/30 shadow-lg shadow-blue-600/5'
                                : 'bg-surface-light border-border-light hover:border-blue-600/20'
                            }`}
                    >
                        <button
                            onClick={() => toggle(i)}
                            className="w-full flex items-center justify-between p-5 text-left"
                        >
                            <span className={`font-bold text-sm ${openIndex === i ? 'text-blue-600' : 'text-text-primary'}`}>
                                {item.question}
                            </span>
                            {openIndex === i ? (
                                <ChevronUp className="h-4 w-4 text-blue-600" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-text-muted" />
                            )}
                        </button>

                        <div
                            className={`grid transition-all duration-200 ease-in-out ${openIndex === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                }`}
                        >
                            <div className="overflow-hidden">
                                <div className="p-5 pt-0 text-sm font-medium text-text-secondary leading-relaxed">
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
