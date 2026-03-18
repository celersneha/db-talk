/**
 * Schema Display Component
 * Displays database schema in a human-readable table format
 */

interface TableInfo {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    constraints?: string;
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
  const lines = schema.split("\n");

  let currentTable: TableInfo | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for table header: "Table: table_name"
    const tableMatch = trimmed.match(/^Table:\s*(\w+)$/);
    if (tableMatch) {
      currentTable = { name: tableMatch[1], columns: [] };
      tables.push(currentTable);
      continue;
    }

    // Parse columns from indented lines
    if (currentTable && trimmed && !trimmed.startsWith("Table:")) {
      // Format: "col1: type [PK], col2: type [FK→table.col]"
      const columns = trimmed.split(", ").map((col) => {
        // Extract constraints if present
        const constraintMatch = col.match(/\[([^\]]+)\]/g);
        const constraints = constraintMatch
          ? constraintMatch.join(" ")
          : undefined;

        // Remove constraints to get type
        const cleanCol = col.replace(/\s*\[([^\]]+)\]/g, "").trim();
        const [name, type] = cleanCol.split(":").map((s) => s.trim());

        return { name, type, constraints };
      });

      currentTable.columns.push(...columns);
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
                className="px-3 py-2 flex justify-between items-center gap-2"
              >
                <div>
                  <span className="text-sm font-medium text-foreground">
                    {column.name}
                  </span>
                  {column.constraints && (
                    <div className="text-xs text-primary mt-0.5">
                      {column.constraints}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded ml-auto">
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
