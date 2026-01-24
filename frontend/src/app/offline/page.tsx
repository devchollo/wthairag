export default function OfflinePage() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-[900px] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.4em] text-text-muted">Offline Mode</p>
      <h1 className="mt-4 text-3xl font-black text-text-primary md:text-4xl">You are offline</h1>
      <p className="mt-4 max-w-[540px] text-sm font-semibold text-text-muted">
        WorkToolsHub is ready for offline viewing, but live utilities and workspace features require an internet
        connection. Please reconnect and try again.
      </p>
    </section>
  );
}
