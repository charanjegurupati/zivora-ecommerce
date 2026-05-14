import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page-section">
      <div className="surface-panel px-8 py-16 text-center">
        <p className="eyebrow mb-3">404</p>
        <h1 className="display-title text-5xl font-semibold text-ink-950">This page wandered off.</h1>
        <p className="mt-4 text-slate-600">Head back to the catalog and keep browsing.</p>
        <Link to="/" className="glass-button mt-8">
          Return home
        </Link>
      </div>
    </div>
  );
}
