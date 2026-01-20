'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield, Server, Zap, Lock, ArrowRight,
  Database, Fingerprint, ChevronRight, ChevronLeft,
  Key, Globe, ShieldCheck, Mail
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      title: "Stateless Security",
      content: "All public utilities operate without persistent storage. Your IP is hashed and purged, and your input data is never logged to a database.",
      icon: Shield
    },
    {
      title: "AI Knowledge Retrieval",
      content: "Upload your team's documentation to private RAG vaults. Query your own data using high-context AI that respects tenant isolation.",
      icon: Database
    },
    {
      title: "Global Infrastructure",
      content: "Run DNS propagation checks and SSL audits across multiple nodes. Get instant, raw data for mission-critical troubleshooting.",
      icon: Server
    }
  ];

  // Fix: Improved carousel logic with auto-play and manual controls
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [features.length]);

  return (
    <div className="flex flex-col gap-24 py-16 sm:gap-32 sm:py-24">
      {/* Hero Section - Grounded and Real */}
      <section className="mx-auto max-w-[1200px] px-4 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-border-light bg-surface-light px-4 py-2 text-sm font-bold text-text-primary">
          Open Source Utility Hub
        </div>
        <h1 className="mt-8 text-4xl font-black tracking-tight text-text-primary sm:text-7xl">
          Professional tools for <br className="hidden sm:block" />
          the <span className="text-accent underline decoration-4 underline-offset-8">modern web.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg font-bold leading-relaxed text-text-secondary">
          A collection of privacy-first developer utilities and a secure workspace for team documentation. No trackers, no bloated marketing, just performance.
        </p>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Link href="/tools" className="btn-primary min-w-[200px]">
            Explore Public Tools
          </Link>
          <Link href="/workspace" className="btn-secondary min-w-[200px]">
            Enter Team Workspace
          </Link>
        </div>
      </section>

      {/* Feature Spotlight - Carousel FIX */}
      <section className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
        <div className="card border-2 border-border-light bg-white p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-8">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                {(() => {
                  const Icon = features[activeTab].icon;
                  return <Icon className="h-6 w-6" />;
                })()}
              </div>
              <h2 className="text-3xl font-black text-text-primary mb-4 tracking-tighter">
                {features[activeTab].title}
              </h2>
              <p className="text-lg font-bold text-text-secondary leading-relaxed mb-8">
                {features[activeTab].content}
              </p>
              <div className="flex gap-2">
                {features.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`h-1.5 transition-all rounded-full ${activeTab === i ? 'w-10 bg-primary' : 'w-4 bg-border-light'}`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="hidden md:block rounded-xl bg-surface-light border border-border-light p-8 font-mono text-xs text-text-muted space-y-4">
              <p className="text-primary font-bold">{">"} Initializing Stateless Protocol...</p>
              <p>[STATUS] All session keys purged.</p>
              <p>[AUTH] Tenant ID: {activeTab === 1 ? 'ORG_PRIVATE' : 'ANONYMOUS'}</p>
              <div className="h-2 w-3/4 bg-border-light rounded group-hover:bg-primary/20 transition-colors"></div>
              <div className="h-2 w-1/2 bg-border-light rounded"></div>
              <p className="text-accent">READY FOR INPUT_</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Toolset - REAL DATA */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-text-primary tracking-tight">The Essentials</h2>
          <p className="mt-4 text-lg font-bold text-text-secondary italic">Everything you need, nothing you don't.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/tools/dns" className="card group hover:border-primary">
            <Server className="h-6 w-6 text-primary mb-4" />
            <h3 className="font-black text-xl mb-2">DNS Inspector</h3>
            <p className="text-sm font-bold text-text-secondary">Verify A, MX, and TXT records across global nodes.</p>
          </Link>
          <Link href="/tools/ssl" className="card group hover:border-primary">
            <Shield className="h-6 w-6 text-primary mb-4" />
            <h3 className="font-black text-xl mb-2">SSL Fortress</h3>
            <p className="text-sm font-bold text-text-secondary">Chain audits and expiration tracking for domains.</p>
          </Link>
          <Link href="/tools/password" className="card group hover:border-primary">
            <Key className="h-6 w-6 text-primary mb-4" />
            <h3 className="font-black text-xl mb-2">Password Architect</h3>
            <p className="text-sm font-bold text-text-secondary">Entropy-based generators with local-only memory.</p>
          </Link>
          <Link href="/workspace/chat" className="card group hover:border-primary">
            <Database className="h-6 w-6 text-primary mb-4" />
            <h3 className="font-black text-xl mb-2">AI RAG Chat</h3>
            <p className="text-sm font-bold text-text-secondary">Chat with your internal docs in a secure vault.</p>
          </Link>
        </div>
      </section>

      {/* Security Principles - REAL PROTOCOLS */}
      <section className="bg-surface-light py-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl font-black text-text-primary tracking-tighter">Our Commitment to <br /> <span className="text-primary italic">Zero Persistence.</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h4 className="text-lg font-black text-text-primary mb-2 flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" /> Stateless Architecture
              </h4>
              <p className="text-sm font-bold text-text-secondary leading-relaxed">
                Public tool requests live only in RAM. We don't use databases for utility data, ensuring that if we don't have it, we can't lose it.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-black text-text-primary mb-2 flex items-center gap-2">
                <Lock className="h-5 w-5 text-accent" /> Tenant Isolation
              </h4>
              <p className="text-sm font-bold text-text-secondary leading-relaxed">
                AI Workspaces use separate vector indexes and unique encryption keys per organization. Your data is your own.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-black text-text-primary mb-2 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent" /> AES-256 Storage
              </h4>
              <p className="text-sm font-bold text-text-secondary leading-relaxed">
                Any file uploaded to your workspace is encrypted at rest using industry-standard AES-256 protocols before hitting storage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified CTA */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 text-center pb-32">
        <div className="card border-primary border-2 bg-primary text-white py-16">
          <h2 className="text-3xl font-black mb-6">Ready to secure your workflow?</h2>
          <p className="mb-10 font-bold opacity-80 max-w-xl mx-auto">
            Join others who value privacy and performance. No credit card required for public tools.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/signup" className="h-11 px-8 rounded-lg bg-white text-primary font-black flex items-center justify-center">
              Get Started
            </Link>
            <Link href="/donate" className="h-11 px-8 rounded-lg border border-white/30 hover:bg-white/10 text-white font-black flex items-center justify-center">
              Support the Dev
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
