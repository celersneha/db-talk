/**
 * Schema Display Component
 * Displays database schema in a human-readable table format
 */

interface TableInfo {
  name: string;
  columns: Array<{
    name: string;
    type: string;
  }>;
}

interface SchemaDisplayProps {
  schema: string;
}

export function SchemaDisplay({ schema }: SchemaDisplayProps) {
  if (!schema || schema.trim() === "") {
    return (
      <div className="text-sm text-muted-foreground">
        No schema information available
      </div>
    );
  }

  // Parse the schema string into table information
  const tables: TableInfo[] = [];

  const lines = schema.split("\n").filter((line) => line.trim());

  for (const line of lines) {
    // Expected format: "Table: table_name (col1: type1, col2: type2, ...)"
    const tableMatch = line.match(/^Table:\s*(\w+)\s*\((.+)\)$/);
    if (tableMatch) {
      const tableName = tableMatch[1];
      const columnsStr = tableMatch[2];

      // Parse columns
      const columns = columnsStr.split(", ").map((col) => {
        const [name, type] = col.split(": ").map((s) => s.trim());
        return { name, type };
      });

      tables.push({ name: tableName, columns });
    }
  }

  if (tables.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Unable to parse schema information
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tables.map((table) => (
        <div
          key={table.name}
          className="border border-border rounded-lg overflow-hidden"
        >
          <div className="bg-muted px-3 py-2 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {table.name}
            </h4>
          </div>
          <div className="divide-y divide-border">
            {table.columns.map((column, index) => (
              <div
                key={index}
                className="px-3 py-2 flex justify-between items-center"
              >
                <span className="text-sm font-medium text-foreground">
                  {column.name}
                </span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {column.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
