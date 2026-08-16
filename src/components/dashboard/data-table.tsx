// Minimal generic table — intentionally NOT a full data-grid library.
// Spec section 45 / "avoid" list: no huge tables everywhere, keep it simple.
export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyLabel = "Ma'lumot yo'q",
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  emptyLabel?: string;
}) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-muted text-slate-500">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className={`px-4 py-2 font-medium ${col.className ?? ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-2 ${col.className ?? ""}`}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
