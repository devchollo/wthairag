'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    duration?: number;
    once?: boolean;
}

export default function ScrollReveal({
    children,
    className = '',
    delay = 0,
    direction = 'up',
    once = true,
}: ScrollRevealProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once && ref.current) {
                        observer.unobserve(ref.current);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px',
            }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [once]);

    const getDirectionClasses = () => {
        switch (direction) {
            case 'up': return 'translate-y-12';
            case 'down': return '-translate-y-12';
            case 'left': return 'translate-x-12';
            case 'right': return '-translate-x-12';
            case 'none': return 'scale-95';
            default: return 'translate-y-12';
        }
    };

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-1000 ease-out ${className} ${isVisible
                    ? 'opacity-100 translate-y-0 translate-x-0 scale-100'
                    : `opacity-0 ${getDirectionClasses()}`
                }`}
        >
            {children}
        </div>
    );
}
