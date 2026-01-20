'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield, Server, Search, Lock, ArrowRight,
  Terminal, Activity, Cpu, Globe, Key,
  MessageSquare, Database, FileText, Command, Zap, Layers, RefreshCcw, Layout
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import TerminalSimulation from '@/components/TerminalSimulation';

export default function Home() {
  return (
    <div className="flex flex-col gap-20 py-12 sm:gap-24 sm:py-20 bg-white overflow-hidden">
      {/* Hero: Higher Impact, More Detail */}
      <section className="mx-auto max-w-[1100px] px-6 text-center">
        <ScrollReveal delay={100}>
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-border-light bg-surface-light px-5 py-2 text-[11px] font-black uppercase tracking-widest text-text-primary">
            <Activity className="h-4 w-4 text-blue-600" /> Platform Multi-Region Status: Operational
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <h1 className="text-6xl font-black tracking-tighter text-text-primary sm:text-8xl lg:text-9xl leading-[0.9]">
            Your Docs. <span className="text-blue-600">AI Ready.</span> <br />
            Your Workflow. <span className="text-slate-200">Secured.</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <p className="mx-auto mt-10 max-w-3xl text-xl font-bold leading-snug text-text-secondary">
            Analyze technical documentation with private, isolated AI RAG and access essential web primitives in a single, stateless ecosystem. No tracking. No bloat. Pure engineering utility.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup" className="btn-primary min-w-[220px] gap-2 h-14 text-lg">
              Initialize Workspace <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/tools" className="btn-secondary min-w-[220px] h-14 text-lg">
              Access System Primitives
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Bento Feature Grid: Upgraded Designs */}
      <section className="mx-auto max-w-[1240px] px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[220px]">

          {/* DNS Terminal Card - AS REQUESTED */}
          <ScrollReveal className="md:col-span-2 md:row-span-2" delay={100}>
            <div className="card h-full flex flex-col justify-between group overflow-hidden bg-text-primary border-none shadow-2xl relative">
              <div className="p-2 relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                  <div className="ml-4 text-[10px] font-mono text-white/30 uppercase tracking-widest">Resolver Console — Node TYO-01</div>
                </div>
                <h2 className="text-3xl font-black tracking-tighter mb-2 text-white italic">DNS Debugging in <br /> real-time.</h2>
                <p className="font-bold text-white/60 text-sm leading-relaxed max-w-[340px]">
                  Bypass browser caching and ISP delays. Get raw propagation data directly from our global fleet.
                </p>
              </div>

              <div className="mt-4 bg-black/40 rounded-xl p-6 relative z-10 border border-white/5">
                <TerminalSimulation
                  lines={[
                    { text: '# Requesting global resolution...', type: 'comment' },
                    { text: 'dig +short worktoolshub.com A', type: 'input' },
                    { text: '104.21.78.231', type: 'output' },
                    { text: '172.67.135.244', type: 'output' },
                    { text: 'dig +short worktoolshub.com MX', type: 'input', delay: 1000 },
                    { text: '10 aspmx.l.google.com.', type: 'output' },
                    { text: '20 alt1.aspmx.l.google.com.', type: 'output' },
                  ]}
                />
              </div>
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </ScrollReveal>

          {/* AI RAG Focus */}
          <ScrollReveal className="md:col-span-2" delay={200}>
            <div className="card h-full bg-blue-600 text-white border-none flex flex-col justify-between group relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">RAG Pipeline Active</div>
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-black tracking-tighter mb-2">Private Knowledge Retrieval.</h2>
                <p className="font-bold opacity-80 text-sm leading-relaxed max-w-[400px]">
                  Index your documentation, API specs, or legacy code into an isolated AI context. Query your data without leaking information to public models.
                </p>
              </div>
              <div className="absolute bottom-[-20%] right-[-10%] w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
            </div>
          </ScrollReveal>

          {/* SSL Audit */}
          <ScrollReveal delay={300}>
            <div className="card h-full bg-surface-light hover:bg-white flex flex-col justify-between border-2 hover:border-blue-600/30">
              <Shield className="h-8 w-8 text-emerald-600 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="font-black text-xl tracking-tight">TLS Audit</h3>
                <p className="text-[12px] font-bold text-text-muted leading-tight">Full chain verification across all browsers.</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Pass Generator */}
          <ScrollReveal delay={400}>
            <div className="card h-full bg-surface-light hover:bg-white flex flex-col justify-between border-2 hover:border-blue-600/30">
              <Key className="h-8 w-8 text-amber-500 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-black text-xl tracking-tight">System Keys</h4>
                <p className="text-[12px] font-bold text-text-muted leading-tight">Cryptographic entropy for core security.</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Security Stats */}
          <ScrollReveal delay={500}>
            <div className="card h-full bg-surface-light border-2 border-dashed border-border-light flex flex-col items-center justify-center gap-4 group">
              <div className="text-[40px] font-black text-text-primary tracking-tighter group-hover:scale-110 transition-transform duration-500">0.0<span className="text-blue-600">ms</span></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Query Latency Benchmark</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Advanced Capabilities Section */}
      <section className="mx-auto max-w-[1100px] px-6 py-20 border-y border-border-light bg-surface-light/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <ScrollReveal delay={100}>
            <div className="space-y-4 group">
              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-border-light group-hover:border-blue-600/30 transition-colors">
                <Layers className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-black text-text-primary tracking-tight">Multi-Tenant Isolation</h4>
              <p className="text-sm font-bold text-text-secondary leading-relaxed">
                Each organization operates in its own logical container. Your vector embeddings, query history, and metadata are strictly isolated from other users.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="space-y-4 group">
              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-border-light group-hover:border-emerald-600/30 transition-colors">
                <RefreshCcw className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="text-xl font-black text-text-primary tracking-tight">Stateless Primitives</h4>
              <p className="text-sm font-bold text-text-secondary leading-relaxed">
                DNS and SSL tools are stateless. We process. We resolve. We purge. Your debugging sessions leave zero footprint on our servers.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="space-y-4 group">
              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-border-light group-hover:border-indigo-600/30 transition-colors">
                <Database className="h-6 w-6 text-indigo-600" />
              </div>
              <h4 className="text-xl font-black text-text-primary tracking-tight">Persistent Context</h4>
              <p className="text-sm font-bold text-text-secondary leading-relaxed">
                Connect your GitHub, Drive, or local storage. We maintain a synchronized knowledge graph of your project's technical specifications.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Trust & Methodology: Developer Focus */}
      <section className="mx-auto max-w-[900px] px-6 text-center">
        <ScrollReveal>
          <h2 className="text-4xl font-black text-text-primary tracking-tighter mb-6">Tools that respect your intelligence.</h2>
          <p className="text-lg font-bold text-text-secondary mb-12 max-w-2xl mx-auto italic opacity-70">
            "We built WorkToolsHub because we were tired of corporate bloat. A tool should do one thing perfectly, without forcing you through a sales funnel."
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Zero', sub: 'Persistence' },
            { label: '100%', sub: 'Isolated AI' },
            { label: 'Sub-1s', sub: 'Resolvers' },
            { label: 'No', sub: 'Tracking' }
          ].map((stat, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="space-y-1">
                <div className="text-2xl font-black text-text-primary uppercase tracking-tighter">{stat.label}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">{stat.sub}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Tighter Final Call */}
      <section className="mx-auto max-w-[800px] px-6 text-center pb-20">
        <ScrollReveal direction="none" delay={200}>
          <div className="card bg-blue-600 text-white p-12 border-none overflow-hidden relative group shadow-2xl shadow-blue-600/30">
            <div className="relative z-10">
              <h2 className="text-5xl font-black tracking-tighter mb-8 leading-tight">
                Ready for a smarter <br /> engineering workflow?
              </h2>
              <Link href="/signup" className="btn-secondary h-14 px-12 text-lg bg-white text-blue-600 hover:bg-white/90 shadow-2xl">
                Get Started Securely
              </Link>
            </div>
            <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
