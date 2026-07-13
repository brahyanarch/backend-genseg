import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ArrowUpDown, ChevronUp, ChevronDown as ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumnId?: string;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (updater: any) => void;
  onColumnFiltersChange?: (updater: any) => void; // Nuevo
}
export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumnId,
  pageCount,
  pagination,
  onPaginationChange,
  onColumnFiltersChange,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    pageCount,
//...

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: (updater) => {
        setColumnFilters(updater);
        if (onColumnFiltersChange) onColumnFiltersChange(updater);
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onPaginationChange,
    manualPagination: true,
    manualFiltering: true, // Importante para filtros server-side
    state: {
      columnFilters,
      columnVisibility,
      pagination,
      sorting,
    },
  });
// ...

  return (
    <div className="space-y-4">
      {/* ... (rest of the component structure) */}
      <div className="flex items-center justify-between">
        {searchColumnId && (
          <Input
            placeholder={`Filtrar por ${searchColumnId}...`}
            value={(table.getColumn(searchColumnId)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchColumnId)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}
        <div className="flex items-center gap-2 ml-auto">
          {/* ... (Dropdowns remain the same) */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <span className={cn(buttonVariants({ variant: "outline" }), "h-8 cursor-pointer")}>
                {pagination.pageSize} filas <ChevronDown className="ml-2 h-4 w-4" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Filas por página</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[10, 25, 50, 100].map((pageSize) => (
                  <DropdownMenuItem
                    key={pageSize}
                    onClick={() => table.setPageSize(pageSize)}
                  >
                    {pageSize}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <span className={cn(buttonVariants({ variant: "outline" }), "h-8 cursor-pointer")}>
                Columnas <ChevronDown className="ml-2 h-4 w-4" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Columnas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  
                  return (
                    <TableHead 
                      key={header.id} 
                      className={cn(canSort && "cursor-pointer hover:bg-muted/50")} 
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <div className="flex flex-col">
                              <ChevronUp className={cn("h-3 w-3", isSorted === "asc" ? "text-foreground" : "text-muted-foreground/50")} />
                              <ChevronDownIcon className={cn("h-3 w-3 -mt-1", isSorted === "desc" ? "text-foreground" : "text-muted-foreground/50")} />
                          </div>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          {/* ... (TableBody and pagination remain the same) */}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
            Página {pagination.pageIndex + 1} de {pageCount}
        </div>
        <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
        </div>
      </div>
    </div>
  );
}
