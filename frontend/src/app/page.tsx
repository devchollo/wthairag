import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.headline}>Stateless tools.<br />Absolute privacy.</h1>
          <p className={styles.subheadline}>
            A world-class suite of universal utilities and a private AI RAG workspace,
            engineered for the next generation of web professionals.
          </p>
          <div className={styles.ctas}>
            <Link href="/tools" className="btn-primary">
              Explore Tools
            </Link>
            <Link href="/workspace" className="btn-secondary">
              Open Workspace
            </Link>
          </div>
        </div>
      </section>

      <section className="container">
        <h2 className={styles.sectionTitle}>Built for the modern edge.</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>DNS Inspector</h3>
            <p>Verification at the speed of thought. Global record tracking with zero persistent logs.</p>
            <span className={styles.badge}>Stateless Engine</span>
          </div>
          <div className={styles.card}>
            <h3>SSL Shield</h3>
            <p>Deep-layer security audits with instant transparency reports and automated threat detection.</p>
            <span className={styles.badge}>Live Inspection</span>
          </div>
          <div className={styles.card}>
            <h3>Private Vault</h3>
            <p>A multi-tenant RAG fortress for your knowledge. Your data is isolated, encrypted, and yours.</p>
            <span className={styles.badge}>Vault Protected</span>
          </div>
        </div>
      </section>

      <section className={styles.privacySection}>
        <div className={styles.privacyPane}>
          <h2>privacy isn't a feature.<br />it's the foundation.</h2>
          <p>We provide absolute data sovereignty by design.</p>
          <p>Your data is never used for training. <strong>Ever.</strong></p>
          <p>Purged automatically after 30 minutes of inactivity.</p>
        </div>
      </section>
    </div>
  );
}





