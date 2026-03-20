import { useNavigate } from "react-router-dom";
import { Schedule } from "../../../entities/schedule";
import { trackEvent, trackPageView } from "../../../lib/analytics";
import { Button } from "../../atoms/Button";
import { DataTable, DataTableColumn } from "../../organisms/DataTable";
import { MainLayout } from "../../templates/MainLayout";
import { useCallback, useEffect, useState } from "react";
import {
  deleteSchedule,
  getSchedulesPaginated,
} from "../../../services/scheduleService";

const SCHEDULE_COLUMNS: DataTableColumn<Schedule>[] = [
  {
    id: "courseName",
    label: "Curso",
    sortable: true,
    value: (r) => r.courseName,
    render: (r) => (
      <span className="font-medium text-slate-900 dark:text-slate-100">
        {r.courseName}
      </span>
    ),
  },
  {
    id: "slot",
    label: "Horario",
    sortable: true,
    value: (r) => r.slot,
  },
];

export function HorariosPage() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<string | null>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackPageView("/horarios", "Lista de horarios");
  }, []);

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSchedulesPaginated({
        page,
        pageSize,
        sortBy: sortKey ?? undefined,
        sortOrder: sortDir,
      });
      setSchedules(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar horarios");
      setSchedules([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortKey, sortDir]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const handleDelete = async (schedule: Schedule) => {
    if (
      !window.confirm(
        `¿Eliminar a ${schedule.courseName} ${schedule.slot}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    setError(null);
    setDeletingId(schedule.id);
    try {
      await deleteSchedule(schedule.id);
      trackEvent("schedule_delete", {
        schedule_id: schedule.id,
      });
      await loadSchedules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  const renderActions = (schedule: Schedule) => (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => {
          trackEvent("schedule_edit_click", { schedule_id: schedule.id });
          navigate(`/horarios/${schedule.id}/editar`);
        }}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800"
      >
        Editar
      </button>
      <button
        type="button"
        onClick={() => handleDelete(schedule)}
        disabled={deletingId === schedule.id}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50"
      >
        {deletingId === schedule.id ? "Eliminando…" : "Eliminar"}
      </button>
    </div>
  );

  return (
    <MainLayout>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm ring-1 ring-slate-200/50 dark:border-slate-600 dark:bg-slate-800/95 dark:ring-slate-600/50 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Horarios
          </h2>
          <Button
            type="button"
            onClick={() => {
              trackEvent("schedule_create_click");
              navigate("/horarios/registro");
            }}
          >
            Agregar horario
          </Button>
        </div>
        <div className="mt-6">
          <DataTable<Schedule>
            columns={SCHEDULE_COLUMNS}
            data={schedules}
            total={total}
            page={page}
            pageSize={pageSize}
            sortKey={sortKey}
            sortDir={sortDir}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSortChange={(key, dir) => {
              setSortKey(key);
              setSortDir(dir);
            }}
            loading={loading}
            keyExtractor={(row) => row.id}
            renderActions={renderActions}
            defaultPageSize={10}
            emptyMessage="No hay horarios registrados."
          />
        </div>
        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>
    </MainLayout>
  );
}
