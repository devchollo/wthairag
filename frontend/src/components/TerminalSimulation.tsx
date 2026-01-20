'use client';

import React, { useState, useEffect } from 'react';

interface TerminalLine {
    text: string;
    type: 'input' | 'output' | 'comment';
    delay?: number;
}

interface TerminalSimulationProps {
    lines: TerminalLine[];
    className?: string;
}

export default function TerminalSimulation({ lines, className = '' }: TerminalSimulationProps) {
    const [visibleLines, setVisibleLines] = useState<TerminalLine[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (currentIndex < lines.length) {
            const line = lines[currentIndex];

            if (line.type === 'input') {
                setIsTyping(true);
                let charIndex = 0;
                const timer = setInterval(() => {
                    setDisplayedText(prev => line.text.substring(0, charIndex + 1));
                    charIndex++;
                    if (charIndex === line.text.length) {
                        clearInterval(timer);
                        setTimeout(() => {
                            setVisibleLines(prev => [...prev, line]);
                            setDisplayedText('');
                            setIsTyping(false);
                            setCurrentIndex(prev => prev + 1);
                        }, 500);
                    }
                }, 50);
                return () => clearInterval(timer);
            } else {
                const timer = setTimeout(() => {
                    setVisibleLines(prev => [...prev, line]);
                    setCurrentIndex(prev => prev + 1);
                }, line.delay || 500);
                return () => clearTimeout(timer);
            }
        } else {
            // Restart after a while
            const restartTimer = setTimeout(() => {
                setVisibleLines([]);
                setCurrentIndex(0);
                setDisplayedText('');
            }, 5000);
            return () => clearTimeout(restartTimer);
        }
    }, [currentIndex, lines]);

    return (
        <div className={`font-mono text-[12px] leading-relaxed ${className}`}>
            {visibleLines.map((line, i) => (
                <div key={i} className="mb-1">
                    {line.type === 'input' && <span className="text-blue-400 mr-2">$</span>}
                    <span className={
                        line.type === 'comment' ? 'text-white/40 italic' :
                            line.type === 'output' ? 'text-white font-bold' :
                                'text-blue-400'
                    }>
                        {line.text}
                    </span>
                </div>
            ))}
            {isTyping && (
                <div className="flex items-center">
                    <span className="text-blue-400 mr-2">$</span>
                    <span className="text-blue-400">{displayedText}</span>
                    <span className="w-1.5 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                </div>
            )}
        </div>
    );
}
