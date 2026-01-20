'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield, Server, Search, Lock, ArrowRight,
  Terminal, Activity, Cpu, Globe, Key,
  ChevronRight, Command, LayoutGrid
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  const highlights = [
    {
      title: "Network Debugging",
      desc: "Instant propagation logs across 42 global nodes. Raw TXT, A, and MX record exports.",
      icon: Globe,
      color: "text-blue-500"
    },
    {
      title: "Security Audits",
      desc: "Chain-of-trust verification for SSL/TLS. Automatic expiration alerts and vulnerability detection.",
      icon: Shield,
      color: "text-indigo-500"
    },
    {
      title: "Knowledge Retrieval",
      desc: "Connect your technical documentation to our secure RAG pipeline for instant querying.",
      icon: Server,
      color: "text-emerald-500"
    }
  ];

  return (
    <div className="flex flex-col gap-24 py-16 sm:gap-32 sm:py-24">
      {/* Hero: Minimalist & High Impact */}
      <section className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto mb-10 inline-flex items-center gap-2 rounded-full border border-border-light bg-white px-5 py-2 text-[13px] font-black uppercase tracking-widest text-text-primary shadow-sm">
          <Activity className="h-4 w-4 text-blue-500 animate-pulse" /> Platform Status: Operational
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-text-primary sm:text-8xl lg:text-9xl">
          Build <span className="text-blue-600">Faster.</span> <br />
          Check <span className="opacity-30">Better.</span>
        </h1>
        <p className="mx-auto mt-10 max-w-2xl text-xl font-bold leading-relaxed text-text-secondary">
          The essential toolkit for frontend engineers and sysadmins. High-performance utilities for DNS, SSL, and private knowledge management — built without the SaaS fluff.
        </p>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Link href="/tools" className="btn-primary min-w-[200px] gap-2 h-14 text-lg">
            Launch Terminal <Command className="h-5 w-5" />
          </Link>
          <Link href="/workspace" className="btn-secondary min-w-[200px] h-14 text-lg">
            Dashboard
          </Link>
        </div>
      </section>

      {/* Bento Feature Grid: The Aesthetic Layout */}
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">

          {/* Main Bento Piece */}
          <div className="card md:col-span-2 md:row-span-2 flex flex-col justify-between overflow-hidden relative group">
            <div className="relative z-10">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white mb-6">
                <Terminal className="h-6 w-6" />
              </div>
              <h2 className="text-4xl font-black text-text-primary tracking-tighter mb-4">
                DNS Debugging in <br /> real-time.
              </h2>
              <p className="max-w-md text-lg font-bold text-text-secondary leading-relaxed">
                Bypass browser caching and ISP delays. Get the raw propagation data directly from our global fleet of resolvers.
              </p>
            </div>

            {/* Abstract Code Visualization */}
            <div className="absolute right-[-20px] bottom-[-20px] w-1/2 aspect-square bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors"></div>
            <div className="mt-8 font-mono text-[11px] text-text-muted bg-surface-light border border-border-light p-6 rounded-xl relative z-10 h-[200px] overflow-hidden">
              <p className="text-blue-600 font-bold">$ dig +short worktoolshub.com A</p>
              <p>{"  104.21.78.231"}</p>
              <p>{"  172.67.135.244"}</p>
              <p className="mt-4 text-blue-600 font-bold">$ dig +short worktoolshub.com MX</p>
              <p>{"  10 aspmx.l.google.com."}</p>
              <p>{"  20 alt1.aspmx.l.google.com."}</p>
              <p className="mt-4 opacity-50"># Global cluster responding via TYO-01...</p>
            </div>
          </div>

          {/* Right Side Stack */}
          <div className="card flex flex-col justify-center gap-4 bg-primary text-white border-none group">
            <Cpu className="h-10 w-10 text-white/50 mb-2 group-hover:scale-110" />
            <h3 className="text-2xl font-black tracking-tight leading-none">AI Contextual Retrieval</h3>
            <p className="text-sm font-bold opacity-70">Query internal docs via RAG.</p>
            <Link href="/workspace" className="mt-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
              Connect Drive <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="card flex flex-col justify-center gap-4 hover:border-blue-500">
            <Shield className="h-10 w-10 text-blue-600 mb-2" />
            <h3 className="text-2xl font-black tracking-tight leading-none text-text-primary">SSL / TLS Audits</h3>
            <p className="text-sm font-bold text-text-secondary leading-snug">Full chain verification across all browsers.</p>
          </div>

          {/* Bottom Row */}
          <div className="card flex flex-col justify-between group">
            <Key className="h-8 w-8 text-indigo-500 mb-4" />
            <div>
              <h4 className="font-black text-text-primary mb-1">Pass Architect</h4>
              <p className="text-xs font-bold text-text-muted leading-relaxed">Cryptographic entropy generators built into the browser context.</p>
            </div>
          </div>

          <div className="card md:col-span-2 flex items-center justify-between group overflow-hidden bg-surface-light">
            <div className="max-w-[60%]">
              <h3 className="text-2xl font-black text-text-primary tracking-tight mb-2">Network Status</h3>
              <p className="text-sm font-bold text-text-secondary leading-relaxed">
                Real-time monitoring of our resolver fleet. 99.99% uptime for all developer-facing APIs.
              </p>
            </div>
            <div className="flex gap-1">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`h-8 w-2 rounded-full ${i > 10 ? 'bg-amber-400' : 'bg-blue-500'} animate-pulse`} style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Trust & Methodology: Developer Language */}
      <section className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 py-16 border-t border-border-light">
          <div>
            <h4 className="text-[13px] font-black uppercase tracking-widest text-blue-600 mb-4">Architecture</h4>
            <p className="text-lg font-bold text-text-primary leading-snug mb-4">Stateless by default.</p>
            <p className="text-sm font-bold text-text-secondary leading-relaxed">
              We don't cache your queries or store your IP. Public tools operate entirely in worker memory and are purged on response.
            </p>
          </div>
          <div>
            <h4 className="text-[13px] font-black uppercase tracking-widest text-blue-600 mb-4">Sovereignty</h4>
            <p className="text-lg font-bold text-text-primary leading-snug mb-4">Isolated Retrieval.</p>
            <p className="text-sm font-bold text-text-secondary leading-relaxed">
              AI Workspaces use multi-tenant separation. Your embeddings are never used for model training or global optimization.
            </p>
          </div>
          <div>
            <h4 className="text-[13px] font-black uppercase tracking-widest text-blue-600 mb-4">Performance</h4>
            <p className="text-lg font-bold text-text-primary leading-snug mb-4">Sub-second Latency.</p>
            <p className="text-sm font-bold text-text-secondary leading-relaxed">
              API response times are optimized for the CLI experience. No bloat, no redirected marketing loops.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call - Minimalist */}
      <section className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8 text-center pb-32">
        <h2 className="text-5xl font-black text-text-primary tracking-tighter mb-8 italic">
          Tools that respect <br /> your intelligence.
        </h2>
        <Link href="/signup" className="btn-primary h-14 px-12 text-lg">
          Get Started Hub
        </Link>
      </section>
    </div>
  );
}
