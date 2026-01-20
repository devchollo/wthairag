import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Admin Command Center | WorkToolsHub',
    description: 'System Administration and Oversight',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-surface-light">
            {children}
        </div>
    );
}
