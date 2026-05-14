import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="mt-12 border-t border-white/60 bg-white/50">
    <div className="page-section grid gap-8 py-10 lg:grid-cols-[1.5fr_1fr_1fr]">
      <div>
        <p className="eyebrow mb-3">Zivora Journal</p>
        <h3 className="display-title text-2xl font-semibold text-ink-950">
          Elevated essentials for wardrobes, workspaces, and weekend travel.
        </h3>
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
          Explore
        </p>
        <div className="mt-4 grid gap-3 text-sm text-slate-600">
          <Link to="/products">Catalog</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/cart">Cart</Link>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
          Contact
        </p>
        <div className="mt-4 grid gap-3 text-sm text-slate-600">
          <p>support@zivora.shop</p>
          <p>Mon-Sat, 9am-7pm</p>
          <p>New York, London, Bengaluru</p>
        </div>
      </div>
    </div>
  </footer>
);
