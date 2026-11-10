import { createMemo, createUniqueId, For, Show, type Accessor } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface DataColumn<Row> {
  readonly id: string;
  readonly label: string;
  readonly cell: (row: Accessor<Row>) => JSX.Element;
  readonly rowHeader?: boolean | undefined;
}

export interface DataTableProps<Row> {
  readonly caption: string;
  readonly columns: readonly DataColumn<Row>[];
  readonly rows: readonly Row[];
  readonly getRowId: (row: Row) => string;
  readonly emptyMessage?: string | undefined;
  readonly class?: string | undefined;
}

export function DataTable<Row>(props: DataTableProps<Row>): JSX.Element {
  const captionId = `ui-data-table-caption-${createUniqueId()}`;
  const data = createMemo(() => {
    if (!props.caption.trim() || (props.emptyMessage !== undefined && !props.emptyMessage.trim())) throw new Error("DataTable text must be nonempty");
    if (props.columns.length < 1 || props.columns.length > 32 || props.rows.length > 1000) throw new RangeError("DataTable requires 1 to 32 columns and at most 1000 rows");
    const columnIds = new Set<string>();
    for (const column of props.columns) {
      if (!column.id.trim() || !column.label.trim()) throw new Error("DataTable column IDs and labels must be nonempty");
      if (columnIds.has(column.id)) throw new Error("DataTable column IDs must be unique");
      columnIds.add(column.id);
    }
    const rowIds: string[] = [];
    const rowsById = new Map<string, Row>();
    for (const row of props.rows) {
      const id = props.getRowId(row);
      if (!id.trim()) throw new Error("DataTable row IDs must be nonempty");
      if (rowsById.has(id)) throw new Error("DataTable row IDs must be unique");
      rowsById.set(id, row);
      rowIds.push(id);
    }
    return { columns: props.columns, rowIds, rowsById };
  });
  return <div class={["ui-data-table-scroll", props.class].filter(Boolean).join(" ")} role="region" aria-labelledby={captionId} tabindex="0"><table class="ui-data-table"><caption id={captionId}>{props.caption}</caption><thead><tr><For each={data().columns}>{column => <th scope="col">{column.label}</th>}</For></tr></thead><tbody><Show when={data().rowIds.length > 0} fallback={<tr><td colspan={data().columns.length}>{props.emptyMessage ?? "No records."}</td></tr>}><For each={data().rowIds}>{id => {
    const row = () => data().rowsById.get(id)!;
    return <tr><For each={data().columns}>{column => <Show when={column.rowHeader} fallback={<td>{column.cell(row)}</td>}><th scope="row">{column.cell(row)}</th></Show>}</For></tr>;
  }}</For></Show></tbody></table></div>;
}
