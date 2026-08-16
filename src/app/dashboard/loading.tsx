export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-6 w-40 rounded bg-surface-muted" />
        <div className="mt-2 h-4 w-64 rounded bg-surface-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-card border border-border bg-surface-muted" />
        ))}
      </div>
      <div className="mt-8 space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 rounded-card border border-border bg-surface-muted" />
        ))}
      </div>
    </div>
  );
}
