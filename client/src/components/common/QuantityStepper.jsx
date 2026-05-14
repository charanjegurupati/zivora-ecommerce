export const QuantityStepper = ({ value, min = 1, max = 99, onChange }) => (
  <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
    <button
      type="button"
      className="h-9 w-9 rounded-full text-lg font-semibold text-ink-900 transition hover:bg-sand-100"
      onClick={() => onChange(Math.max(min, value - 1))}
    >
      -
    </button>
    <span className="min-w-10 text-center text-sm font-semibold text-ink-900">
      {value}
    </span>
    <button
      type="button"
      className="h-9 w-9 rounded-full text-lg font-semibold text-ink-900 transition hover:bg-sand-100"
      onClick={() => onChange(Math.min(max, value + 1))}
    >
      +
    </button>
  </div>
);
