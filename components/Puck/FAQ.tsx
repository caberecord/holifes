'use client';

import { useState } from 'react';

interface FAQProps {
    title: string;
    items: Array<{
        question: string;
        answer: string;
    }>;
}

export function FAQ({ title, items }: FAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-16 px-4 bg-white">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
                    {title}
                </h2>

                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-semibold text-lg text-gray-900">
                                    {item.question}
                                </span>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transform transition-transform ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {openIndex === index && (
                                <div className="px-6 pb-6">
                                    <p className="text-gray-600 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
