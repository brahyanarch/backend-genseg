import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaginationState, ColumnFiltersState } from "@tanstack/react-table";

interface UseDataTableOptions<TData> {
  fetcher: (params: { page: number; limit: number; search?: string; filters?: Record<string, any> }) => Promise<any>;
  defaultPageSize?: number;
}

export function useDataTable<TData>({ fetcher, defaultPageSize = 10 }: UseDataTableOptions<TData>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<TData[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: Number(searchParams.get("page") || 1) - 1,
    pageSize: Number(searchParams.get("limit") || defaultPageSize),
  });
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState<Record<string, any>>({});

  const fetchData = useCallback(async () => {
    const page = pagination.pageIndex + 1;
    const json = await fetcher({
      page,
      limit: pagination.pageSize,
      search: search || undefined,
      filters,
    });
    
    if (json.nSuccess) {
      setData(json.data.users || json.data);
      setPageCount(json.data.totalPages || 1);
    }
  }, [fetcher, pagination, search, filters]);

  useEffect(() => {
    fetchData();
    const params = new URLSearchParams();
    params.set("page", (pagination.pageIndex + 1).toString());
    params.set("limit", pagination.pageSize.toString());
    if (search) params.set("search", search);
    router.replace(`${pathname}?${params.toString()}`);
  }, [pagination, search, filters, pathname, router, fetchData]);

  return {
    data,
    pageCount,
    pagination,
    setPagination,
    search,
    setSearch,
    filters,
    setFilters,
  };
}
