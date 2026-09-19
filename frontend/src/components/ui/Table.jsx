import { cn } from '../../lib/utils';

export function Table({ columns, data, rowKey = 'id', onRowClick, empty, className }) {
  if (!data || data.length === 0) {
    return empty || <p className="py-10 text-center text-sm text-silver-500">No records found.</p>;
  }

  return (
    <div className={cn('overflow-x-auto no-scrollbar', className)}>
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'whitespace-nowrap px-4 py-3 font-mono text-2xs uppercase tracking-[0.15em] text-silver-500',
                  col.align === 'right' && 'text-right',
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row[rowKey] ?? Math.random()}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-white/[0.04] transition-colors',
                onRowClick && 'cursor-pointer hover:bg-white/[0.03]'
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 py-3.5 text-sm text-silver-200 align-middle',
                    col.align === 'right' && 'text-right',
                    col.cellClassName
                  )}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
