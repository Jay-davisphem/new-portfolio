import Link from "next/link";

export const metadata = {
  title: "Resume",
};

export default function ResumePage() {
  return (
    <main className="min-h-screen pt-6">
      <div className="container-shell">
        <div className="surface px-6 py-5 md:px-10 md:py-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Resume</h1>
              <Link className="btn-primary mt-1" href="/" >
                Go Back
              </Link>
            </div>
            <p className="text-sm text-(--muted)">
              View in browser or download a copy.
            </p>
            <a className="btn-primary" href="/resume.pdf" download>
              Download PDF
            </a>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
            <object data="/resume.pdf" type="application/pdf" className="h-[78vh] w-full">
              <iframe
                src="/resume.pdf"
                title="Resume PDF"
                className="h-[78vh] w-full"
              />
            </object>
          </div>
        </div>
      </div>
    </main>
  );
}
