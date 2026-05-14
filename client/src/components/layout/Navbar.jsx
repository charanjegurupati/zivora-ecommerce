import {
  LayoutDashboard,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useCart } from "../../hooks/useCart.js";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/products" },
  { label: "Cart", to: "/cart" },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/products?search=${encodeURIComponent(search)}`);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-sand-50/80 backdrop-blur-xl">
      <div className="page-section py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-950 text-lg font-bold text-sand-50">
              Z
            </div>
            <div>
              <p className="display-title text-xl font-semibold text-ink-950">Zivora</p>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                Curated commerce
              </p>
            </div>
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden flex-1 items-center gap-3 rounded-full border border-white/70 bg-white/90 px-4 py-3 shadow-sm lg:flex"
          >
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Search coats, sneakers, decor..."
            />
          </form>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-ink-950 text-sand-50" : "text-ink-900 hover:bg-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/dashboard"
                  className="glass-button px-4 py-2 text-ink-900"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </NavLink>
                {user?.role === "admin" ? (
                  <NavLink to="/admin" className="glass-button px-4 py-2">
                    <ShieldCheck size={16} />
                    Admin
                  </NavLink>
                ) : null}
                <button type="button" onClick={logout} className="glass-button px-4 py-2">
                  <UserRound size={16} />
                  Sign out
                </button>
              </>
            ) : (
              <NavLink to="/auth" className="glass-button px-4 py-2">
                <UserRound size={16} />
                Sign in
              </NavLink>
            )}
            <NavLink to="/cart" className="relative glass-button px-4 py-2">
              <ShoppingBag size={16} />
              Cart
              {itemCount ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-honey-500 px-1 text-[11px] font-bold text-white">
                  {itemCount}
                </span>
              ) : null}
            </NavLink>
          </div>

          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/90 text-ink-900 lg:hidden"
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen ? (
          <div className="surface-panel mt-4 space-y-4 px-4 py-5 lg:hidden">
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-3 rounded-full border border-slate-200 bg-sand-50 px-4 py-3"
            >
              <Search size={18} className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Search the catalog"
              />
            </form>
            <div className="grid gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-ink-900 hover:bg-sand-50"
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink
                to={isAuthenticated ? "/dashboard" : "/auth"}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-ink-900 hover:bg-sand-50"
              >
                {isAuthenticated ? "Dashboard" : "Sign in"}
              </NavLink>
              {user?.role === "admin" ? (
                <NavLink
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-ink-900 hover:bg-sand-50"
                >
                  Admin
                </NavLink>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
};
