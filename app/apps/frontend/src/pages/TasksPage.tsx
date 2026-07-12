import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Plus, Mail, Check, Edit2, Trash2, X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { panelListColumnClass, panelDetailColumnClass } from "@/lib/mail-layout";
import { useIsDesktop } from "@/hooks/useBreakpoint";
import { useTasksStore } from "@/hooks/useTasksStore";
import { useTasks } from "@/hooks/useTasks";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { Loader2 } from "lucide-react";
import threadsData from "@/mock/threads.json";

type ViewMode = "detail" | "form";

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; bg: string; text: string }> = {
  high: { label: "Haute", bg: "#FEE2E2", text: "#991B1B" },
  medium: { label: "Moyenne", bg: "#FEF3C7", text: "#92400E" },
  low: { label: "Basse", bg: "#D1FAE5", text: "#065F46" },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; value: TaskStatus }> = {
  todo: { label: "À faire", value: "todo" },
  in_progress: { label: "En cours", value: "in_progress" },
  done: { label: "Terminée", value: "done" },
};

const FILTERS: { label: string; value: TaskStatus | "all" }[] = [
  { label: "Toutes", value: "all" },
  { label: "À faire", value: "todo" },
  { label: "En cours", value: "in_progress" },
  { label: "Terminées", value: "done" },
];

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isOverdue(dateStr: string | null, status: TaskStatus): boolean {
  if (!dateStr || status === "done") return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export function TasksPage() {
  const navigate = useNavigate();
  const isMobileOrTablet = !useIsDesktop();
  const selectedTaskId = useTasksStore((s) => s.selectedTaskId);
  const filter = useTasksStore((s) => s.filter);
  const setFilter = useTasksStore((s) => s.setFilter);
  const selectTask = useTasksStore((s) => s.selectTask);

  const { tasks, isLoading, createTask, updateTask, deleteTask, completeTask } = useTasks(
    filter !== "all" ? { status: filter } : {}
  );

  const [viewMode, setViewMode] = useState<ViewMode>("detail");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    status: "todo" as TaskStatus,
    dueDate: "",
    linkedEmailId: "",
  });

  const filteredTasks = useMemo(() => {
    const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
    return [...filtered].sort((a, b) => {
      const pDiff =
        PRIORITY_ORDER[a.priority as TaskPriority] - PRIORITY_ORDER[b.priority as TaskPriority];
      if (pDiff !== 0) return pDiff;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  }, [tasks, filter]);

  const selectedTask = useMemo(
    () => tasks.find((t: Task) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  );

  const threads = useMemo(() => threadsData, []);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      dueDate: "",
      linkedEmailId: "",
    });
    selectTask(null);
    setViewMode("detail");
  };

  const handleNewTask = () => {
    selectTask(null);
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      dueDate: "",
      linkedEmailId: "",
    });
    setViewMode("form");
  };

  const handleEditTask = (task: Task) => {
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ?? "",
      linkedEmailId: task.linkedEmailId ?? "",
    });
    setViewMode("form");
  };

  const handleSaveTask = async () => {
    if (!formData.title.trim()) return;
    if (selectedTask) {
      await updateTask({
        id: selectedTask.id,
        data: {
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          status: formData.status,
          dueDate: formData.dueDate || null,
        },
      });
      selectTask(selectedTask.id);
    } else {
      await createTask({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || null,
      });
    }
    setViewMode("detail");
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    if (window.confirm("Supprimer cette tâche ?")) {
      await deleteTask(selectedTask.id);
      selectTask(null);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    if (task.status === "done") {
      await updateTask({ id: task.id, data: { status: "todo" } });
    } else {
      await completeTask(task.id);
    }
  };

  const linkedEmail = useMemo(() => {
    if (!selectedTask?.linkedEmailId) return null;
    return threadsData.find((t) => t.id === selectedTask.linkedEmailId) ?? null;
  }, [selectedTask]);

  const formEmail = useMemo(() => {
    if (!formData.linkedEmailId) return null;
    return threadsData.find((t) => t.id === formData.linkedEmailId) ?? null;
  }, [formData.linkedEmailId]);

  const showListPanel = !isMobileOrTablet || (viewMode === "detail" && !selectedTaskId);
  const showDetailPanel = !isMobileOrTablet || selectedTaskId !== null || viewMode === "form";

  const handleBackToList = () => {
    selectTask(null);
    setViewMode("detail");
  };

  return (
    <div className="flex h-full gap-4 animate-in fade-in duration-500 min-h-0">
      {/* ===== Colonne gauche — Liste + filtres ===== */}
      <div className={panelListColumnClass(!showListPanel)}>
        {/* En-tête */}
        <div className="p-4 border-b border-[#DFE5E7] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#162A42]">Tâches</h2>
            <Button
              size="sm"
              onClick={handleNewTask}
              className="bg-[#0087CA] hover:bg-[#0087CA]/90 text-white h-8 rounded-lg gap-1 font-semibold text-xs"
            >
              <Plus size={14} />
              Nouvelle tâche
            </Button>
          </div>

          {/* Filtres */}
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "flex-1 text-xs font-semibold py-1.5 px-1 rounded-lg transition-colors",
                  filter === f.value
                    ? "bg-[#0087CA] text-white"
                    : "text-[#162A42] hover:bg-[#DFE5E7]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#0087CA] animate-spin" />
            </div>
          )}
          {filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList size={32} className="text-slate-200 mb-3" />
              <p className="text-sm text-slate-400 font-medium">Aucune tâche</p>
            </div>
          )}

          {filteredTasks.map((task) => {
            const isSelected = task.id === selectedTaskId;
            const overdue = isOverdue(task.dueDate, task.status);
            return (
              <div
                key={task.id}
                onClick={() => {
                  selectTask(task.id);
                  setViewMode("detail");
                }}
                className={cn(
                  "rounded-lg border p-3 cursor-pointer transition-all duration-150",
                  isSelected
                    ? "border-[#0087CA] bg-[#EDF3F6]"
                    : "border-[#DFE5E7] bg-white hover:border-slate-300",
                  task.status === "done" && "opacity-60"
                )}
              >
                {/* Ligne 1 : checkbox + titre */}
                <div className="flex items-start gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(task);
                    }}
                    className={cn(
                      "mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors",
                      task.status === "done"
                        ? "bg-[#0087CA] border-[#0087CA]"
                        : "border-slate-300 hover:border-[#0087CA]"
                    )}
                  >
                    {task.status === "done" && <Check size={12} className="text-white" />}
                  </button>
                  <span
                    className={cn(
                      "text-sm font-medium text-[#162A42] flex-1",
                      task.status === "done" && "line-through text-slate-400"
                    )}
                  >
                    {task.title}
                  </span>
                </div>

                {/* Ligne 2 : badge priorité + date */}
                <div className="flex items-center gap-2 mt-2 ml-6">
                  <PriorityBadge priority={task.priority} />
                  {task.dueDate && (
                    <span
                      className={cn(
                        "text-[10px] font-medium",
                        overdue ? "text-[#EF4444] font-semibold" : "text-slate-400"
                      )}
                    >
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Colonne droite — Détail / Formulaire ===== */}
      <div className={panelDetailColumnClass(!showDetailPanel)}>
        {/* État vide */}
        {!selectedTask && viewMode === "detail" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
            <div className="p-6 bg-[#EDF3F6] rounded-full">
              <ClipboardList size={64} className="text-[#9ACEE8]" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-[#162A42]">
                Sélectionnez une tâche ou créez-en une nouvelle
              </p>
              <Button
                onClick={handleNewTask}
                className="bg-[#0087CA] hover:bg-[#0087CA]/90 text-white rounded-xl gap-2 font-semibold h-11 px-6"
              >
                <Plus size={18} />
                Nouvelle tâche
              </Button>
            </div>
          </div>
        )}

        {/* Vue détail */}
        {selectedTask && viewMode === "detail" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
              {isMobileOrTablet && (
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="flex items-center gap-1 text-sm font-semibold text-[#0087CA] mb-2"
                >
                  <ChevronLeft size={18} />
                  Tâches
                </button>
              )}
              {/* Header avec boutons */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-semibold text-[#162A42]">{selectedTask.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider",
                        selectedTask.status === "done"
                          ? "bg-green-100 text-green-700"
                          : selectedTask.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {STATUS_CONFIG[selectedTask.status as TaskStatus].label}
                    </Badge>
                    <PriorityBadge priority={selectedTask.priority} />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleEditTask(selectedTask)}
                    variant="outline"
                    className="rounded-lg gap-1 h-8 font-semibold text-xs"
                  >
                    <Edit2 size={14} />
                    Modifier
                  </Button>
                </div>
              </div>

              <Separator className="bg-[#DFE5E7]" />

              {/* Description */}
              {selectedTask.description && (
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Description
                  </label>
                  <p className="text-sm text-[#091D35] leading-relaxed whitespace-pre-wrap">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              {/* Date d'échéance */}
              {selectedTask.dueDate && (
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Date d'échéance
                  </label>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isOverdue(selectedTask.dueDate, selectedTask.status)
                        ? "text-[#EF4444]"
                        : "text-[#162A42]"
                    )}
                  >
                    {formatDate(selectedTask.dueDate)}
                    {isOverdue(selectedTask.dueDate, selectedTask.status) && " — En retard"}
                  </p>
                </div>
              )}

              {/* Email lié */}
              {linkedEmail && (
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Email lié
                  </label>
                  <button
                    onClick={() => navigate("/inbox")}
                    className="w-full flex items-center gap-3 p-3 bg-[#EDF3F6] border border-[#9ACEE8] rounded-xl text-left hover:bg-[#DFE5E7] transition-colors group"
                  >
                    <Mail size={18} className="text-[#0087CA] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#162A42] truncate">
                        {linkedEmail.from.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {linkedEmail.subject.length > 40
                          ? `${linkedEmail.subject.slice(0, 40)}…`
                          : linkedEmail.subject}
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {/* Métadonnées */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Créée le
                </label>
                <p className="text-xs text-slate-400">{formatDate(selectedTask.createdAt)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire (nouvelle tâche ou édition) */}
        {viewMode === "form" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
              {isMobileOrTablet && (
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="flex items-center gap-1 text-sm font-semibold text-[#0087CA] mb-2"
                >
                  <ChevronLeft size={18} />
                  Tâches
                </button>
              )}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#162A42]">
                  {selectedTask ? "Modifier la tâche" : "Nouvelle tâche"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <Separator className="bg-[#DFE5E7]" />

              {/* Titre */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Titre *
                </label>
                <Input
                  placeholder="Titre de la tâche"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="h-10 bg-[#EDF3F6] border-none rounded-xl"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  placeholder="Description (optionnelle)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full p-3 bg-[#EDF3F6] border-none rounded-xl text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#0087CA]/20"
                />
              </div>

              {/* Priorité */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Priorité
                </label>
                <div className="flex gap-2">
                  {(["high", "medium", "low"] as TaskPriority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFormData((prev) => ({ ...prev, priority: p }))}
                      className={cn(
                        "flex-1 text-sm font-semibold py-2 px-3 rounded-xl border-2 transition-all",
                        formData.priority === p
                          ? "border-[#0087CA] bg-[#EDF3F6]"
                          : "border-[#DFE5E7] bg-white hover:border-slate-300"
                      )}
                      style={
                        formData.priority === p
                          ? {
                              backgroundColor: PRIORITY_CONFIG[p].bg,
                              borderColor: PRIORITY_CONFIG[p].bg,
                              color: PRIORITY_CONFIG[p].text,
                            }
                          : undefined
                      }
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Statut */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as TaskStatus,
                    }))
                  }
                  className="w-full h-10 px-3 bg-[#EDF3F6] border-none rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0087CA]/20"
                >
                  {Object.values(STATUS_CONFIG).map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date d'échéance */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Date d'échéance
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="h-10 bg-[#EDF3F6] border-none rounded-xl"
                />
              </div>

              {/* Email lié */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Email lié
                </label>
                <select
                  value={formData.linkedEmailId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      linkedEmailId: e.target.value,
                    }))
                  }
                  className="w-full h-10 px-3 bg-[#EDF3F6] border-none rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0087CA]/20"
                >
                  <option value="">Aucun</option>
                  {threads.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.from.name} —{" "}
                      {t.subject.length > 40 ? `${t.subject.slice(0, 40)}…` : t.subject}
                    </option>
                  ))}
                </select>
                {formEmail && (
                  <p className="text-xs text-slate-400 mt-1">
                    {formEmail.from.name} — {formEmail.subject}
                  </p>
                )}
              </div>

              <Separator className="bg-[#DFE5E7]" />

              {/* Boutons d'action */}
              <div className="flex items-center gap-3">
                {selectedTask && (
                  <Button
                    variant="outline"
                    onClick={handleDeleteTask}
                    className="rounded-xl h-11 font-semibold text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 gap-1"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </Button>
                )}
                <div className="flex-1" />
                <Button variant="outline" onClick={resetForm} className="rounded-xl h-11 font-semibold">
                  Annuler
                </Button>
                <Button
                  onClick={handleSaveTask}
                  disabled={!formData.title.trim()}
                  className={cn(
                    "rounded-xl h-11 font-semibold",
                    "bg-[#0087CA] hover:bg-[#0087CA]/90 text-white",
                    !formData.title.trim() && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {selectedTask ? "Enregistrer" : "Créer la tâche"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
