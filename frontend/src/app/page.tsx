import Link from 'next/link';
import { Shield, Server, Zap, Lock, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col gap-24 py-16 sm:gap-32 sm:py-24">
      {/* Hero Section */}
      <section className="mx-auto max-w-[1200px] px-4 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-border-light bg-surface-light px-4 py-1.5 text-[13px] font-semibold text-text-primary dark:border-border-dark dark:bg-surface-dark dark:text-text-dark">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          New: Global DNS Propagation Inspector
        </div>
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-text-primary sm:text-6xl dark:text-text-dark">
          Professional tools for the <br className="hidden sm:block" />
          <span className="text-primary">stateless web.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary dark:text-muted sm:text-xl">
          A high-performance suite of public utilities and a secure, multi-tenant AI RAG workspace built for modern web professionals.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Link href="/tools" className="btn-primary w-full sm:w-auto">
            Get Started Free
          </Link>
          <Link href="/workspace" className="btn-secondary w-full sm:w-auto">
            Open Workspace
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="card group">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Server className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-text-primary dark:text-text-dark">DNS Inspector</h3>
            <p className="text-text-secondary dark:text-muted">
              Verify global record propagation with sub-second latency and zero logging mechanisms.
            </p>
            <Link href="/tools/dns" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:underline">
              Launch tool <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="card group">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-text-primary dark:text-text-dark">SSL Fortress</h3>
            <p className="text-text-secondary dark:text-muted">
              Deep security audits and certificate chain verification with automated threat reports.
            </p>
            <Link href="/tools/ssl" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:underline">
              Launch tool <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="card group">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-text-primary dark:text-text-dark">AI Workspace</h3>
            <p className="text-text-secondary dark:text-muted">
              A private, RAG-enhanced environment for your documentation and knowledge base.
            </p>
            <Link href="/workspace" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:underline">
              Join workspace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy Block */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-text-primary p-12 text-center dark:bg-surface-dark">
          <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
            Privacy as a fundamental right.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-muted">
            We operate under a stateless principle. Your data is restricted, isolated, and never used for training AI models.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm font-medium text-text-muted">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Zero-log architecture
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Encrypted RAG vaults
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" /> Auto-purge (30m)
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}






