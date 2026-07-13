import { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";

export interface DataTableConfig<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  fetcher: (params: { page: number; limit: number; search?: string; filters?: Record<string, any> }) => Promise<any>;
  searchColumnId?: string;
  defaultPageSize?: number;
}
