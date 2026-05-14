export const PageLoader = ({ label = "Loading..." }) => (
  <div className="page-section flex min-h-[55vh] items-center justify-center">
    <div className="surface-panel flex w-full max-w-md flex-col items-center gap-4 px-8 py-10 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-sand-100 border-t-honey-500" />
      <p className="text-sm font-medium text-ink-900">{label}</p>
    </div>
  </div>
);
