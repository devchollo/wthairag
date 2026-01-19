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
            Designed for speed, absolute privacy, and seamless performance.
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
        <h2 className={styles.sectionTitle}>Engineered for Professionals.</h2>
        <div className={styles.grid}>
          <div className={`${styles.card} glass`}>
            <h3>DNS Inspector</h3>
            <p>Precise propagation tracking with global record verification. No logs, just raw performance.</p>
            <span className={styles.badge}>Next-Gen Engine</span>
          </div>
          <div className={`${styles.card} glass`}>
            <h3>SSL Fortress</h3>
            <p>Deep-layer security audits with instant vulnerability reports and automated renewal alerts.</p>
            <span className={styles.badge}>Live Inspection</span>
          </div>
          <div className={`${styles.card} glass`}>
            <h3>Private Vault</h3>
            <p>A multi-tenant fortress for your knowledge base. Your data stays yours, guaranteed.</p>
            <span className={styles.badge}>Secured with RAG</span>
          </div>
        </div>
      </section>

      <section className={styles.privacySection}>
        <div className={styles.privacyCard}>
          <h2>Privacy is not a feature. It's a right.</h2>
          <p>We believe in absolute data sovereignty.</p>
          <p>Your uploads are never used for training. <strong>Ever.</strong></p>
          <p>Temporary storage is purged automatically after 30 minutes of inactivity.</p>
        </div>
      </section>
    </div>
  );
}



