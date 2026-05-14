import { formatCurrency } from "../../utils/currency.js";

export const FilterSidebar = ({
  categories,
  filters,
  onChange,
  onReset,
}) => (
  <aside className="surface-panel h-fit space-y-6 p-6">
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
        Category
      </p>
      <div className="mt-4 grid gap-2">
        <button
          type="button"
          className={`rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
            !filters.category ? "bg-ink-950 text-sand-50" : "bg-sand-50 text-ink-900"
          }`}
          onClick={() => onChange("category", "")}
        >
          All categories
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            type="button"
            className={`rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
              filters.category === category._id || filters.category === category.slug
                ? "bg-ink-950 text-sand-50"
                : "bg-sand-50 text-ink-900"
            }`}
            onClick={() => onChange("category", category._id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
        Max price
      </label>
      <div className="mt-4 space-y-3">
        <input
          type="range"
          min="1000"
          max="30000"
          step="1000"
          value={filters.maxPrice || 30000}
          onChange={(event) => onChange("maxPrice", event.target.value)}
          className="w-full accent-honey-500"
        />
        <p className="text-sm text-slate-600">
          Up to <span className="font-semibold text-ink-900">{formatCurrency(filters.maxPrice || 30000)}</span>
        </p>
      </div>
    </div>

    <div>
      <label className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
        Minimum rating
      </label>
      <select
        value={filters.rating}
        onChange={(event) => onChange("rating", event.target.value)}
        className="mt-4 w-full rounded-2xl border border-slate-200 bg-sand-50 px-4 py-3 text-sm outline-none"
      >
        <option value="">Any rating</option>
        <option value="4">4 stars & up</option>
        <option value="4.5">4.5 stars & up</option>
      </select>
    </div>

    <button
      type="button"
      className="w-full rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-ink-900 transition hover:bg-sand-50"
      onClick={onReset}
    >
      Reset filters
    </button>
  </aside>
);
