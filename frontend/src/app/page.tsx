import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <section className="container section-padding hero">
        <div className={styles.heroContent}>
          <h1 className={styles.headline}>Advanced Web Tools and a Privacy-First AI RAG Workspace</h1>
          <p className={styles.subheadline}>
            Empower your workflow with high-performance public tools and a secure AI RAG workspace.
            Your data is never used to train AI models.
          </p>
          <div className={styles.ctas}>
            <Link href="/tools" className="btn-primary">
              Explore Free Tools
            </Link>
            <Link href="/workspace" className="btn-secondary">
              Open Workspace
            </Link>
          </div>
        </div>
      </section>

      <section className="container section-padding">
        <h2 className={styles.sectionTitle}>Featured Tools</h2>
        <div className={styles.grid}>
          <div className={`${styles.card} glass`}>
            <h3>DNS Checker</h3>
            <p>Advanced records lookup with global propagation status.</p>
            <span className={styles.badge}>AI Report Included</span>
          </div>
          <div className={`${styles.card} glass`}>
            <h3>SSL Analyzer</h3>
            <p>Deep scan for security vulnerabilities and expiry alerts.</p>
            <span className={styles.badge}>AI Report Included</span>
          </div>
          <div className={`${styles.card} glass`}>
            <h3>AI RAG Workspace</h3>
            <p>Private multi-tenant workspace for your documents.</p>
            <span className={`${styles.badge} ${styles.dark}`}>Login Required</span>
          </div>
        </div>
      </section>

      <section className={`${styles.privacySection} container section-padding`}>
        <div className={`${styles.privacyCard} glass`}>
          <h2>Your Privacy, Guaranteed.</h2>
          <p>Data stored on our server is <strong>NOT</strong> used to train AI models.</p>
          <p>Temporary uploads are automatically deleted after 30 minutes.</p>
        </div>
      </section>
    </div>
  );
}

