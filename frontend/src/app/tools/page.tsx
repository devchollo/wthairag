import styles from './tools.module.css';

const tools = [
    { id: 'dns', name: 'DNS Checker', desc: 'Verify all types of DNS records.', icon: '🌐' },
    { id: 'ssl', name: 'SSL Analyzer', desc: 'Check certificate validity and security.', icon: '🔒' },
    { id: 'password', name: 'Password Generator', desc: 'Secure, random passwords.', icon: '🔑' },
    { id: 'qr', name: 'QR Code Generator', desc: 'Create PNG/SVG codes.', icon: '📱' },
];

export default function ToolsPage() {
    return (
        <div className="container section-padding">
            <h1 className={styles.title}>Advanced Web Tools</h1>
            <p className={styles.subtitle}>Stateless, secure, and powered by AI reports.</p>

            <div className={styles.toolGrid}>
                {tools.map((tool) => (
                    <a key={tool.id} href={`/tools/${tool.id}`} className="glass card tool-card">
                        <span className={styles.icon}>{tool.icon}</span>
                        <h3>{tool.name}</h3>
                        <p>{tool.desc}</p>
                        <div className={styles.badge}>AI Report Included</div>
                    </a>
                ))}
            </div>
        </div>
    );
}
