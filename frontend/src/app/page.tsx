'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield, Server, Search, Lock, ArrowRight,
  Terminal, Activity, Cpu, Globe, Key,
  MessageSquare, Database, FileText, Command, Zap, Layers, RefreshCcw, Layout, Star, ChevronLeft, ChevronRight, QrCode
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import TerminalSimulation from '@/components/TerminalSimulation';
import ReviewModal from '@/components/ReviewModal';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [latency, setLatency] = useState<number | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Array<{ name: string; role: string; text: string; rating: number }>>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(null);

  useEffect(() => {
    const measureLatency = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const start = performance.now();
      try {
        await fetch(`${apiUrl}/health`);
        const end = performance.now();
        setLatency(Math.round(end - start));
      } catch {
        setLatency(-1);
      }
    };
    measureLatency();
  }, []);

  useEffect(() => {
    const loadTestimonials = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      try {
        setTestimonialsLoading(true);
        const res = await fetch(`${apiUrl}/api/testimonials`);
        if (!res.ok) {
          throw new Error('Failed to load testimonials');
        }
        const payload = await res.json();
        const approved = Array.isArray(payload?.data) ? payload.data : [];
        setTestimonials(approved);
        setTestimonialsError(null);
      } catch (error) {
        console.error('Failed to load testimonials', error);
        setTestimonials([]);
        setTestimonialsError('Unable to load testimonials right now.');
      } finally {
        setTestimonialsLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  useEffect(() => {
    if (testimonialIndex >= testimonials.length) {
      setTestimonialIndex(0);
    }
  }, [testimonialIndex, testimonials.length]);

  const nextTestimonial = () => {
    if (testimonials.length === 0) {
      return;
    }
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };
  const prevTestimonial = () => {
    if (testimonials.length === 0) {
      return;
    }
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const hasTestimonials = testimonials.length > 0;
  const activeTestimonial = hasTestimonials ? testimonials[testimonialIndex] : null;

  return (
    <div className="flex flex-col gap-20 py-12 sm:gap-24 sm:py-20 bg-white overflow-hidden">
      {/* Hero */}
      <section className="mx-auto max-w-[1100px] px-6 text-center">
        <ScrollReveal delay={100}>
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-border-light bg-surface-light px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-text-primary">
            <Activity className="h-4 w-4 text-blue-600" /> Platform Multi-Region Status: Operational
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <h1 className="text-4xl font-bold tracking-tighter text-text-primary sm:text-5xl lg:text-6xl leading-[1.1]">
            Your Docs. <span className="text-blue-600">AI Ready.</span> <br />
            Your Workflow. <span className="text-slate-300">Secured.</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-text-secondary">
            Analyze technical documentation with private, isolated AI RAG and access essential web primitives in a single, stateless ecosystem.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={user ? "/workspace/dashboard" : "/signup"} className="btn-primary min-w-[200px] gap-2 h-12 text-base">
              {user ? "View Dashboard" : "Get Started"} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/tools" className="btn-secondary min-w-[200px] h-12 text-base">
              Explore Tools
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Most Used Tools */}
      <section className="mx-auto max-w-[1240px] px-6">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">Popular</div>
            <h2 className="text-3xl font-bold tracking-tighter text-text-primary">Most Used Tools</h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { icon: Search, title: 'WHOIS Lookup', desc: 'Registration & abuse data', href: '/tools/whois', color: 'text-zinc-600' },
            { icon: Server, title: 'Hosting Provider', desc: 'Detect Origin IP & ASN', href: '/tools/hosting', color: 'text-cyan-600' },
            { icon: Shield, title: 'TLS Audit', desc: 'Cert chain verification', href: '/tools/ssl', color: 'text-emerald-600' },
            { icon: Activity, title: 'SEO Analysis', desc: 'Technical site audit', href: '/tools/seo', color: 'text-purple-600' },
            { icon: Key, title: 'Entropy Gen', desc: 'Secure key generation', href: '/tools/password', color: 'text-amber-500' },
          ].map((tool, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <Link href={tool.href} className="card h-full flex flex-col justify-between p-6 border-2 border-border-light hover:border-blue-600/30 group">
                <tool.icon className={`h-8 w-8 ${tool.color} mb-4 transition-transform`} />
                <div>
                  <h3 className="font-bold text-lg tracking-tight text-text-primary">{tool.title}</h3>
                  <p className="text-[12px] font-medium text-text-muted mt-1">{tool.desc}</p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Bento Feature Grid */}
      <section className="mx-auto max-w-[1240px] px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[220px]">

          {/* DNS Terminal Card */}
          <ScrollReveal className="md:col-span-2 md:row-span-2" delay={100}>
            <div className="card h-full flex flex-col justify-between group overflow-hidden bg-text-primary border-none shadow-2xl relative">
              <div className="p-2 relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                  <div className="ml-4 text-[10px] font-mono text-white/30 uppercase tracking-widest">Resolver Console — Node TYO-01</div>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter mb-2 text-white">DNS Debugging in <br /> real-time.</h2>
                <p className="font-medium text-white/60 text-sm leading-relaxed max-w-[340px]">
                  Bypass browser caching and ISP delays. Get raw propagation data directly from our global fleet.
                </p>
              </div>

              <div className="mt-4 bg-black/40 rounded-xl p-6 relative z-10 border border-white/5">
                <TerminalSimulation
                  lines={[
                    { text: '# Requesting global resolution...', type: 'comment' },
                    { text: 'dig +short worktoolshub.info A', type: 'input' },
                    { text: '76.223.105.230', type: 'output' },
                    { text: '13.249.44.122', type: 'output' },
                    { text: 'dig +short worktoolshub.info MX', type: 'input', delay: 1000 },
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
                <div className="text-[10px] font-bold uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">RAG Pipeline Active</div>
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold tracking-tighter mb-2">Private Knowledge Retrieval.</h2>
                <p className="font-medium opacity-80 text-sm leading-relaxed max-w-[400px]">
                  Index your documentation, API specs, or legacy code into an isolated AI context.
                </p>
              </div>
              <div className="absolute bottom-[-20%] right-[-10%] w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
            </div>
          </ScrollReveal>

          {/* SSL Audit */}
          <ScrollReveal delay={300}>
            <Link href="/tools/ssl" className="card h-full bg-surface-light hover:bg-white flex flex-col justify-between border-2 hover:border-emerald-600/30 group transition-all relative overflow-hidden">
              <div className="relative z-10">
                <Shield className="h-8 w-8 text-emerald-600 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-xl tracking-tight text-text-primary mb-2">TLS Chain Audit</h3>
                <p className="text-sm font-medium text-text-secondary leading-snug">
                  Deep inspection of certificate chains, cipher suites, and protocol vulnerabilities.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity">
                Run Analysis <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          </ScrollReveal>

          {/* Latency Benchmark */}
          <ScrollReveal delay={400}>
            <div className="card h-full bg-surface-light border-2 border-dashed border-border-light flex flex-col items-center justify-center gap-4 group">
              <div className="text-[40px] font-bold text-text-primary tracking-tighter transition-transform duration-500">
                {latency === null ? (
                  <span className="text-slate-300 animate-pulse">...</span>
                ) : latency === -1 ? (
                  <span className="text-red-500">ERR</span>
                ) : (
                  <>{latency}<span className="text-blue-600">ms</span></>
                )}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted text-center">API Latency (Live)</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-[900px] px-6">
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">Community</div>
            <h2 className="text-3xl font-bold tracking-tighter text-text-primary">What Users Say</h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="relative">
            <div className="card border-2 border-border-light p-8 md:p-12 text-center min-h-[280px] flex flex-col justify-center">
              {testimonialsLoading ? (
                <p className="text-lg font-medium text-text-muted">Loading reviews…</p>
              ) : testimonialsError ? (
                <div className="space-y-3">
                  <p className="text-lg font-medium text-text-primary">{testimonialsError}</p>
                  <p className="text-sm font-medium text-text-muted">Please check back soon.</p>
                </div>
              ) : hasTestimonials && activeTestimonial ? (
                <>
                  <div className="flex justify-center gap-1 mb-6">
                    {Array.from({ length: activeTestimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xl font-medium text-text-primary leading-relaxed mb-8 italic">
                    "{activeTestimonial.text}"
                  </p>
                  <div>
                    <div className="font-bold text-text-primary">{activeTestimonial.name}</div>
                    <div className="text-sm font-medium text-text-muted">{activeTestimonial.role}</div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-xl font-medium text-text-primary">No reviews yet.</p>
                  <p className="text-sm font-medium text-text-muted">
                    Be the first to share your experience and help the community decide.
                  </p>
                </div>
              )}
            </div>

            {hasTestimonials && testimonials.length > 1 ? (
              <div className="flex justify-center gap-4 mt-6">
                <button onClick={prevTestimonial} className="h-10 w-10 rounded-full border border-border-light flex items-center justify-center hover:border-blue-600 transition-colors">
                  <ChevronLeft className="h-5 w-5 text-text-muted" />
                </button>
                <div className="flex items-center gap-2">
                  {testimonials.map((_, i) => (
                    <div key={i} className={`h-2 w-2 rounded-full transition-colors ${i === testimonialIndex ? 'bg-blue-600' : 'bg-border-light'}`}></div>
                  ))}
                </div>
                <button onClick={nextTestimonial} className="h-10 w-10 rounded-full border border-border-light flex items-center justify-center hover:border-blue-600 transition-colors">
                  <ChevronRight className="h-5 w-5 text-text-muted" />
                </button>
              </div>
            ) : null}

            <div className="mt-10 text-center">
              <button
                onClick={() => (document.getElementById('review-modal') as any)?.showModal()}
                className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-blue-600 transition-colors border-b border-transparent hover:border-blue-600 pb-0.5"
              >
                + Add a review
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Review Modal */}
      <ReviewModal />

      {/* Advanced Capabilities */}

      {/* Advanced Capabilities */}
      <section className="mx-auto max-w-[1100px] px-6 py-16 border-y border-border-light bg-surface-light/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <ScrollReveal delay={100}>
            <div className="space-y-4 group">
              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-border-light group-hover:border-blue-600/30 transition-colors">
                <Layers className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-text-primary tracking-tight">Multi-Tenant Isolation</h4>
              <p className="text-sm font-medium text-text-secondary leading-relaxed">
                Each organization operates in its own logical container. Your data is strictly isolated.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="space-y-4 group">
              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-border-light group-hover:border-emerald-600/30 transition-colors">
                <RefreshCcw className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-text-primary tracking-tight">Stateless Primitives</h4>
              <p className="text-sm font-medium text-text-secondary leading-relaxed">
                DNS and SSL tools are stateless. We process. We resolve. We purge.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="space-y-4 group">
              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-border-light group-hover:border-indigo-600/30 transition-colors">
                <Database className="h-6 w-6 text-indigo-600" />
              </div>
              <h4 className="text-xl font-bold text-text-primary tracking-tight">Persistent Context</h4>
              <p className="text-sm font-medium text-text-secondary leading-relaxed">
                Connect your GitHub, Drive, or local storage for a synchronized knowledge graph.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-[800px] px-6 text-center pb-20">
        <ScrollReveal direction="none" delay={200}>
          <div className="card bg-blue-600 text-white p-12 border-none overflow-hidden relative group shadow-2xl shadow-blue-600/30">
            <div className="relative z-10">
              <h2 className="text-4xl font-bold tracking-tighter mb-8 leading-tight">
                Ready for a smarter <br /> engineering workflow?
              </h2>
              <Link href={user ? "/workspace/dashboard" : "/signup"} className="btn-secondary h-14 px-12 text-lg bg-white text-blue-600 hover:bg-white/90 shadow-2xl">
                {user ? "Resume Workflow" : "Get Started Securely"}
              </Link>
            </div>
            <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl transition-transform duration-1000"></div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
