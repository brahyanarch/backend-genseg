"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import {
  createInvitationAction,
  getInvitationRolesAction,
  getUsersAction,
  updateProfileStatusAction,
} from "@/app/actions/auth.actions";
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
import { toast } from "sonner";

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

interface InvitationRole {
  idRol: number;
  cNombreRol: string;
}

function StatusToggle({ profileId, profile, onToggle }: { profileId: number; profile: UserProfile; onToggle: (nextStatus: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const submissionInProgress = useRef(false);

  const handleToggle = async () => {
    if (submissionInProgress.current) return;

    const previousStatus = profile.lActivo;
    const nextStatus = !previousStatus;
    submissionInProgress.current = true;
    setLoading(true);
    onToggle(nextStatus);
    try {
      await updateProfileStatusAction(profileId, nextStatus);
      setOpen(false);
    } catch {
      onToggle(previousStatus);
      toast.error("No se pudo actualizar el perfil", {
        description: "El estado anterior fue restaurado. Revisá tu conexión e intentá nuevamente.",
      });
    } finally {
      submissionInProgress.current = false;
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!loading) setOpen(nextOpen);
    }}>
      <PermissionGuard requiredPermission="DESACTIVAR_USUARIOS">
        <DialogTrigger render={
          <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-6 text-xs", profile.lActivo ? "text-red-600" : "text-green-600")}
          />
        }>
            {profile.lActivo ? "Desactivar" : "Activar"}
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
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleToggle} disabled={loading}>
            {loading ? "Procesando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
  const [invitationOpen, setInvitationOpen] = useState(false);
  const [invitationEmail, setInvitationEmail] = useState("");
  const [invitationRoleId, setInvitationRoleId] = useState("");
  const [invitationRoles, setInvitationRoles] = useState<InvitationRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [invitationError, setInvitationError] = useState("");
  const [invitationSent, setInvitationSent] = useState(false);

  const openInvitationDialog = async (open: boolean) => {
    setInvitationOpen(open);
    if (!open) return;

    setInvitationEmail("");
    setInvitationRoleId("");
    setInvitationError("");
    setInvitationSent(false);
    setRolesLoading(true);
    const result = await getInvitationRolesAction();
    if (result.success) {
      setInvitationRoles(result.roles);
      if (result.roles.length === 0) {
        setInvitationError("No hay roles activos y vigentes disponibles.");
      }
    } else {
      setInvitationRoles([]);
      setInvitationError("No se pudieron cargar los roles. Cerrá el diálogo e intentá nuevamente.");
    }
    setRolesLoading(false);
  };

  const submitInvitation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!invitationEmail.trim() || !invitationRoleId) {
      setInvitationError("Ingresá un email y seleccioná un rol.");
      return;
    }

    setInvitationLoading(true);
    setInvitationError("");
    const result = await createInvitationAction(invitationEmail, Number(invitationRoleId));
    if (result.success) {
      setInvitationSent(true);
    } else {
      setInvitationError(result.message);
    }
    setInvitationLoading(false);
  };

  const fetchData = useCallback(async () => {
    const page = pagination.pageIndex + 1;
    const json = await getUsersAction(page, pagination.pageSize, search, {
      ...(lActivoFilter.length > 0
        ? { lActivo: lActivoFilter.join(",") }
        : {}),
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
        return (
          <Popover>
            <PopoverTrigger render={<Button variant="outline" size="sm" />}>
              Ver {perfiles.length} perfil(es)
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
                        profileId={p.idProfile}
                        profile={p}
                        onToggle={(nextStatus) => {
                          setData((currentData) => currentData.map((user) => ({
                            ...user,
                            perfiles: user.perfiles.map((profile) =>
                              profile.idProfile === p.idProfile
                                ? { ...profile, lActivo: nextStatus }
                                : profile,
                            ),
                          })));
                        }}
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

  return (
    <div className="container mx-auto py-10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={() => void openInvitationDialog(true)}>Nuevo usuario</Button>
      </div>
      <Dialog open={invitationOpen} onOpenChange={(open) => {
        if (!invitationLoading) void openInvitationDialog(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar nuevo usuario</DialogTitle>
            <DialogDescription>Enviaremos una invitación al correo indicado.</DialogDescription>
          </DialogHeader>
          {invitationSent ? (
            <p role="status" className="text-sm text-green-700">La invitación se envió correctamente.</p>
          ) : (
            <form onSubmit={submitInvitation} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="invitation-email" className="font-medium">Email</label>
                <Input
                  id="invitation-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={invitationEmail}
                  onChange={(event) => setInvitationEmail(event.target.value)}
                  disabled={invitationLoading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="invitation-role" className="font-medium">Rol</label>
                <select
                  id="invitation-role"
                  required
                  value={invitationRoleId}
                  onChange={(event) => setInvitationRoleId(event.target.value)}
                  disabled={rolesLoading || invitationLoading || invitationRoles.length === 0}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">{rolesLoading ? "Cargando roles..." : "Seleccioná un rol"}</option>
                  {invitationRoles.map((role) => (
                    <option key={role.idRol} value={role.idRol}>{role.cNombreRol}</option>
                  ))}
                </select>
              </div>
              {invitationError && <p role="alert" className="text-sm text-destructive">{invitationError}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => void openInvitationDialog(false)} disabled={invitationLoading}>Cancelar</Button>
                <Button type="submit" disabled={rolesLoading || invitationLoading || invitationRoles.length === 0}>
                  {invitationLoading ? "Enviando..." : "Enviar invitación"}
                </Button>
              </DialogFooter>
            </form>
          )}
          {invitationSent && (
            <DialogFooter>
              <Button onClick={() => void openInvitationDialog(false)}>Cerrar</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
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
      />
    </div>
  );
}
