import type { ReactNode } from 'react';
import { tag } from 'component-details-overlay';

export interface Column<Row> {
  key: keyof Row;
  label: string;
  render?: (row: Row) => ReactNode;
}

interface TableProps<Row> {
  columns: Column<Row>[];
  rows: Row[];
  onRowClick?: (row: Row) => void;
}

export function Table<Row extends { id: string }>({ columns, rows, onRowClick }: TableProps<Row>) {
  return (
    <div {...tag('Table')} className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={String(c.key)} scope="col">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={(e) => {
                // Alt-click copies a component name, so it should not also open the row.
                if (e.altKey) return;
                onRowClick?.(row);
              }}
              onKeyDown={(e) => {
                if (!onRowClick) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onRowClick(row);
                }
              }}
            >
              {columns.map((c) => (
                <td key={String(c.key)}>{c.render ? c.render(row) : String(row[c.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
