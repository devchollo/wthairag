import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.headline}>The Ultimate Swiss Army Knife for the Modern Web.</h1>
          <p className={styles.subheadline}>
            A unified suite of high-performance public tools and a private AI RAG workspace.
            Designed for speed, security, and absolute privacy.
          </p>
          <div className={styles.ctas}>
            <Link href="/tools" className="btn-primary">
              Explore Free Tools
            </Link>
            <Link href="/workspace" className="btn-secondary">
              Open Private Workspace
            </Link>
          </div>
        </div>
      </section>

      <section className="container">
        <h2 className={styles.sectionTitle}>Engineered for Professionals.</h2>
        <div className={styles.grid}>
          <div className={`${styles.card} glass`}>
            <h3>DNS Checker</h3>
            <p>Precise propagation tracking with global record inspection. No logs, just raw data.</p>
            <span className={styles.badge}>Next-Gen Engine</span>
          </div>
          <div className={`${styles.card} glass`}>
            <h3>SSL Analyzer</h3>
            <p>Deep-layer security audits with instant vulnerability reports and AI insights.</p>
            <span className={styles.badge}>Live Inspection</span>
          </div>
          <div className={`${styles.card} glass`}>
            <h3>Private AI RAG</h3>
            <p>A multi-tenant fortress for your knowledge base. Data stays yours, forever.</p>
            <span className={`${styles.badge} ${styles.dark}`}>Vault Protected</span>
          </div>
        </div>
      </section>

      <section className={styles.privacySection}>
        <div className={styles.privacyCard}>
          <span className={styles.privacyIcon}>🛡️</span>
          <h2>Privacy is not a feature. It's a right.</h2>
          <p>We believe in absolute data sovereignty.</p>
          <p>Your uploads are never used for training. <strong>Ever.</strong></p>
          <p>Ephemeral storage is purged automatically after 30 minutes.</p>
        </div>
      </section>
    </div>
  );
}


