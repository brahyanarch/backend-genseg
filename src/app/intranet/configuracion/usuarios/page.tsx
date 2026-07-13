"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { getUsersAction, updateProfileStatusAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { PermissionGuard } from "@/components/PermissionGuard";
import { DataTableFacetedFilter } from "@/components/DataTableFacetedFilter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

// Interfaces adaptadas del JSON
interface UserProfile {
  idRol: number;
  cNombreRol: string;
  idOficina: number;
  cNombreOficina: string;
  idProfile: number;
  lActivo: boolean;
}

interface User {
  idUser: number;
  cEmail: string;
  cNombre: string;
  lActivo: boolean;
  perfiles: UserProfile[];
}

function StatusToggle({ userId, profile, onToggle }: { userId: number; profile: UserProfile; onToggle: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await updateProfileStatusAction(userId, !profile.lActivo);
      onToggle();
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <PermissionGuard requiredPermission="DESACTIVAR_USUARIOS">
        <DialogTrigger asChild>
          <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-6 text-xs", profile.lActivo ? "text-red-600" : "text-green-600")}
          >
            {profile.lActivo ? "Desactivar" : "Activar"}
          </Button>
        </DialogTrigger>
      </PermissionGuard>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar acción</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas {profile.lActivo ? "desactivar" : "activar"} el perfil 
            <strong> {profile.cNombreRol}</strong> en <strong>{profile.cNombreOficina}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleToggle} disabled={loading}>
            {loading ? "Procesando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const columns: ColumnDef<User>[] = [
  { accessorKey: "cNombre", header: "Nombre" },
  { accessorKey: "cEmail", header: "Email" },
  {
    accessorKey: "lActivo",
    header: ({ column }) => (
        <DataTableFacetedFilter
            column={column}
            title="Estado"
            options={[
              { label: "Activo", value: "true" },
              { label: "Inactivo", value: "false" },
            ]}
        />
    ),
    cell: ({ row }) => (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", row.original.lActivo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
        {row.original.lActivo ? "Activo" : "Inactivo"}
      </span>
    ),
  },
  {
    header: "Perfiles",
    cell: ({ row }) => {
      const perfiles = row.original.perfiles;
      const userId = row.original.idUser;
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Ver {perfiles.length} perfil(es)
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold text-sm">Perfiles del usuario</h4>
              {perfiles.map((p) => (
                <div key={p.idProfile} className="flex items-center justify-between gap-2 text-xs bg-secondary p-2 rounded">
                  <div className="flex flex-col">
                    <span className="font-semibold">{p.cNombreRol}</span>
                    <span className="text-muted-foreground">{p.cNombreOficina}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("px-1.5 py-0.5 rounded text-[10px]", p.lActivo ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800")}>
                      {p.lActivo ? "Activo" : "Inactivo"}
                    </span>
                    <StatusToggle 
                      userId={userId} 
                      profile={p} 
                      onToggle={() => { /* Implementar refresh o re-fetch si necesario */ }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      );
    },
  },
];

export default function UsuariosPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<User[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: Number(searchParams.get("page") || 1) - 1,
    pageSize: Number(searchParams.get("limit") || 10),
  });
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [lActivoFilter, setLActivoFilter] = useState<string[]>(searchParams.getAll("lActivo"));

  const fetchData = useCallback(async () => {
    const page = pagination.pageIndex + 1;
    const json = await getUsersAction(page, pagination.pageSize, search, {
        lActivo: lActivoFilter.length > 0 ? lActivoFilter.join(",") : undefined
    });
    
    if (json.nSuccess) {
      setData(json.data.users);
      setPageCount(json.data.totalPages);
    }
  }, [pagination, search, lActivoFilter]);

  useEffect(() => {
    fetchData();
    // Actualizar URL
    const params = new URLSearchParams();
    params.set("page", (pagination.pageIndex + 1).toString());
    params.set("limit", pagination.pageSize.toString());
    if (search) params.set("search", search);
    lActivoFilter.forEach(v => params.append("lActivo", v));
    router.replace(`${pathname}?${params.toString()}`);
  }, [pagination, search, lActivoFilter, pathname, router]);

  // Manejar cambio de filtros desde la tabla
  const handleColumnFiltersChange = (updater: any) => {
    const filters = typeof updater === "function" ? updater([]) : updater;
    const lActivoFilter = filters.find((f: any) => f.id === "lActivo")?.value as string[];
    setLActivoFilter(lActivoFilter || []);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Gestión de Usuarios</h1>
      <Input
        placeholder="Buscar por nombre o email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm mb-4"
      />
      <DataTable
        columns={columns}
        data={data}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        onColumnFiltersChange={handleColumnFiltersChange}
        searchColumnId="cNombre"
      />
    </div>
  );
}
