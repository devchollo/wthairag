'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield, Server, Zap, Lock, ArrowRight, CheckCircle2,
  MessageSquare, Star, Globe, Database, Fingerprint
} from 'lucide-react';

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Lead DevOps @ CloudScale",
      content: "The DNS propagation tools are the fastest I've tested. No ads, no fluff, just the data I need when our stack is down. Professional-grade utilities.",
      avatar: "SC"
    },
    {
      name: "Marcus Thorne",
      role: "Security Analyst",
      content: "Finding a zero-log RAG solution for our sensitive documentation was a challenge until WorkToolsHub. The stateless architecture is exactly what we needed.",
      avatar: "MT"
    },
    {
      name: "Elena Rodriguez",
      role: "Fullstack Architect",
      content: "Clean, fast, and credible. I use the SSL analyzer daily. The 'Calm' design philosophy really helps focus during high-pressure troubleshooting.",
      avatar: "ER"
    }
  ];

  return (
    <div className="flex flex-col gap-32 py-16 sm:gap-48 sm:py-24">
      {/* Hero Section */}
      <section className="mx-auto max-w-[1200px] px-4 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-primary/5 px-5 py-2 text-sm font-bold text-primary animate-in fade-in slide-in-from-bottom-2 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          Now Live: Private AI RAG Workspaces
        </div>
        <h1 className="mt-10 text-5xl font-extrabold tracking-tight text-text-primary sm:text-7xl dark:text-text-dark">
          Professional tools for <br className="hidden sm:block" />
          the <span className="text-primary italic">stateless</span> web.
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-xl font-medium leading-relaxed text-text-secondary dark:text-muted">
          A high-performance suite of public utilities and a secure, multi-tenant AI workspace built for teams who prioritize data sovereignty and speed.
        </p>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Link href="/signup" className="btn-primary min-w-[220px]">
            Start Building Free
          </Link>
          <Link href="/tools" className="btn-secondary min-w-[220px]">
            Explore Public Tools
          </Link>
        </div>
      </section>

      {/* Feature Grid - Enhanced Contrast */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark tracking-tight">Essential Infrastructure</h2>
          <p className="mt-4 text-lg font-bold text-text-secondary dark:text-muted">Zero-latency utilities for modern web development.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="card group hover:border-primary/50">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <Server className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-text-primary dark:text-text-dark">Global DNS</h3>
            <p className="text-text-secondary dark:text-muted font-bold leading-relaxed mb-6">
              Track record propagation across 42 global nodes with sub-second refreshes.
            </p>
            <Link href="/tools/dns" className="inline-flex items-center gap-2 text-[15px] font-black text-primary group-hover:gap-3 transition-all">
              Launch DNS Inspector <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="card group hover:border-primary/50">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <Shield className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-text-primary dark:text-text-dark">SSL Fortress</h3>
            <p className="text-text-secondary dark:text-muted font-bold leading-relaxed mb-6">
              Automated chain verification and security audit reports for mission-critical domains.
            </p>
            <Link href="/tools/ssl" className="inline-flex items-center gap-2 text-[15px] font-black text-primary group-hover:gap-3 transition-all">
              Audit Certificates <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="card group hover:border-primary/50">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <Database className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-text-primary dark:text-text-dark">AI Workspace</h3>
            <p className="text-text-secondary dark:text-muted font-bold leading-relaxed mb-6">
              Private, RAG-enhanced document vaults for internal knowledge management.
            </p>
            <Link href="/workspace" className="inline-flex items-center gap-2 text-[15px] font-black text-primary group-hover:gap-3 transition-all">
              Enter Workspace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works - New Section */}
      <section className="bg-surface-light dark:bg-surface-dark py-24 sm:py-32">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-4xl font-black text-text-primary dark:text-text-dark mb-8 tracking-tighter">
                Built for <span className="text-primary">Performance Architects.</span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-black">1</div>
                  <div>
                    <h4 className="text-lg font-bold text-text-primary dark:text-text-dark">Establish Your Vault</h4>
                    <p className="text-text-secondary dark:text-muted font-bold">Secure a tenant-isolated workspace where your documents live in encrypted cold storage.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-black">2</div>
                  <div>
                    <h4 className="text-lg font-bold text-text-primary dark:text-text-dark">Ingest Knowledge</h4>
                    <p className="text-text-secondary dark:text-muted font-bold">Drop documentation, logs, or technical manuals into the RAG pipeline for instant indexing.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-black">3</div>
                  <div>
                    <h4 className="text-lg font-bold text-text-primary dark:text-text-dark">Query with AI</h4>
                    <p className="text-text-secondary dark:text-muted font-bold">Interact with your private data through a high-context AI chat that never forgets and never logs.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card border-primary/20 bg-white dark:bg-background-dark p-2">
              <div className="aspect-video rounded-xl bg-surface-dark/95 p-8 flex flex-col justify-end overflow-hidden relative">
                <div className="absolute top-4 left-4 flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/50"></div>
                  <div className="h-3 w-3 rounded-full bg-amber-500/50"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-[60%] rounded bg-primary/40 animate-pulse"></div>
                  <div className="h-2 w-[80%] rounded bg-primary/20"></div>
                  <div className="h-2 w-[40%] rounded bg-primary/10"></div>
                </div>
                <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs font-mono text-primary leading-relaxed">
                    [INFO] RAG pipeline initialized.<br />
                    [SEC] Vault isolated (Tenant: 0x42f)<br />
                    [AI] Context size: 128k tokens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel - New Section */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-12">Verified Professional Impact</h2>
        <div className="relative min-h-[300px] flex items-center justify-center">
          <div className="card max-w-2xl border-2 border-primary/10 bg-white/50 backdrop-blur-sm dark:bg-surface-dark/50">
            <div className="flex justify-center gap-1 text-primary mb-6">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
            </div>
            <p className="text-2xl font-extrabold italic text-text-primary dark:text-text-dark leading-snug mb-8">
              "{testimonials[activeTestimonial].content}"
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {testimonials[activeTestimonial].avatar}
              </div>
              <div className="text-left">
                <div className="font-black text-text-primary dark:text-text-dark">{testimonials[activeTestimonial].name}</div>
                <div className="text-xs font-bold text-primary">{testimonials[activeTestimonial].role}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-center mt-12">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`h-2 transition-all rounded-full ${activeTestimonial === i ? 'w-8 bg-primary' : 'w-2 bg-border-light dark:bg-border-dark'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Security Block - Expanded */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-[40px] bg-text-primary p-12 text-center dark:bg-surface-dark relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="grid grid-cols-6 h-full gap-4 p-8">
              {[...Array(24)].map((_, i) => <Lock key={i} className="w-full h-full" />)}
            </div>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter sm:text-5xl relative z-10">
            Privacy as a <span className="text-primary italic">fundamental right.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg font-bold text-text-muted relative z-10 leading-relaxed">
            We operate under a strict stateless principle. Your analytic data is volatile, your vaults are isolated, and your documents will never be used to train external models.
          </p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            <div className="space-y-2">
              <div className="text-primary font-black text-3xl">Zero</div>
              <div className="text-xs font-bold uppercase tracking-widest text-text-muted">Logging Mechanism</div>
            </div>
            <div className="space-y-2">
              <div className="text-primary font-black text-3xl">AES-256</div>
              <div className="text-xs font-bold uppercase tracking-widest text-text-muted">Encryption Standard</div>
            </div>
            <div className="space-y-2">
              <div className="text-primary font-black text-3xl">SOC 2</div>
              <div className="text-xs font-bold uppercase tracking-widest text-text-muted">Compliance Ready</div>
            </div>
            <div className="space-y-2">
              <div className="text-primary font-black text-3xl">2FA</div>
              <div className="text-xs font-bold uppercase tracking-widest text-text-muted">Biometric Auth</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / Trust - New Section */}
      <section className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8 pb-32">
        <h2 className="text-3xl font-black text-center text-text-primary dark:text-text-dark mb-16 tracking-tight">Technical Inquiries</h2>
        <div className="space-y-6">
          <div className="card p-6">
            <h4 className="font-black text-text-primary dark:text-text-dark flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Is my data really not stored?
            </h4>
            <p className="mt-3 text-sm font-bold text-text-secondary dark:text-muted">
              Public tools are completely stateless. For the AI Workspace, document embeddings are stored in a tenant-isolated encrypted vector database that only you can access.
            </p>
          </div>
          <div className="card p-6">
            <h4 className="font-black text-text-primary dark:text-text-dark flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Can I export my workspace?
            </h4>
            <p className="mt-3 text-sm font-bold text-text-secondary dark:text-muted">
              Yes, we support full JSON and Markdown exports of your indexed knowledge and chat history at any time.
            </p>
          </div>
          <div className="card p-6">
            <h4 className="font-black text-text-primary dark:text-text-dark flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Who builds WorkToolsHub?
            </h4>
            <p className="mt-3 text-sm font-bold text-text-secondary dark:text-muted">
              We are a small team of performance engineers and security researchers dedicated to building tools that don't compromise user integrity.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
