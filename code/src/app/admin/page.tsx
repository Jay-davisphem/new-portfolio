import Link from "next/link";

export default function AdminEntryPage() {
  return (
    <main className="min-h-screen">
      <div className="container-shell pt-10">
        <div className="surface px-6 py-8">
          <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-2 text-sm text-(--muted)">
            This is a client-only admin area. You’ll unlock editing with a passphrase.
          </p>

          <div className="mt-6">
            <Link className="btn-primary" href="/admin/editor">
              Go to Editor
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
