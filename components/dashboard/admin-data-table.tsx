import { Card } from "@/components/ui/card";

export function AdminDataTable({
  title,
  columns,
  rows
}: {
  title: string;
  columns: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <Card className="overflow-hidden rounded-[30px] p-0">
      <div className="border-b border-slate-100 px-5 py-4 text-lg font-semibold text-slate-950">{title}</div>
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-sm text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-5 py-4 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-slate-100 text-sm text-slate-600">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="px-5 py-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
