import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Edit3, KeyRound, Lock, Plus, RotateCcw, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { ParkPicker } from "@/components/ParkPicker";
import { AdminModal } from "@/components/AdminModal";
import { ThemeSampler } from "@/components/ThemeSampler";
import { useAdmin } from "@/lib/admin-store";
import {
  useTaskStore,
  completionKey,
  dateKey,
  todayKey,
  type Priority,
  DEFAULT_PRIORITY,
} from "@/lib/task-store";
import { useParks } from "@/lib/park-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PRIORITY_STYLES: Record<Priority, { dot: string; label: string }> = {
  high: { dot: "bg-red-500", label: "High" },
  medium: { dot: "bg-amber-500", label: "Medium" },
  low: { dot: "bg-emerald-500", label: "Low" },
};

const PRIORITY_OPTIONS: Priority[] = ["high", "medium", "low"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DEEP Park Maintenance Task Board" },
      {
        name: "description",
        content:
          "Park maintenance calendar for CT DEEP crews — see today's work, plan ahead, park by park.",
      },
      { property: "og:title", content: "DEEP Park Maintenance Task Board" },
      {
        property: "og:description",
        content: "Track park maintenance work as it gets done, shift by shift.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ParkGate,
});

function ParkGate() {
  const parks = useParks();

  if (!parks.hydrated) return <div className="min-h-screen topo-bg" />;

  return (
    <>
      {!parks.selected ? (
        <ParkPicker parks={parks.parks} onSelect={parks.select} />
      ) : (
        <TaskBoard
          key={parks.selected}
          parkId={parks.selected}
          parkLabel={parks.nameFor(parks.selected)}
          onSwitchPark={() => parks.select(null)}
        />
      )}
      <ThemeSampler />
    </>
  );
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function TaskBoard({
  parkId,
  parkLabel,
  onSwitchPark,
}: {
  parkId: string;
  parkLabel: string;
  onSwitchPark: () => void;
}) {
  const store = useTaskStore(parkId);
  const admin = useAdmin();
  const today = todayKey();
  const [selectedDate, setSelectedDate] = useState(today);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>(DEFAULT_PRIORITY);

  const tasks = store.tasksForDay(selectedDate);
  const stats = store.dayStats(selectedDate);
  const crewInputRef = useRef<HTMLInputElement>(null);
  const [crewWarning, setCrewWarning] = useState(false);

  const handleToggleTask = (task: string, isCurrentlyDone: boolean) => {
    if (!isCurrentlyDone && !store.state.crew.trim()) {
      setCrewWarning(true);
      crewInputRef.current?.focus();
      toast.error("Please enter your name or initials in 'Crew on shift' before completing tasks.");
      return;
    }
    store.toggle(selectedDate, task);
  };

  const days = useMemo(() => {
    const first = startOfMonth(month);
    const cells: (Date | null)[] = Array.from({ length: first.getDay() }, () => null);
    const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= total; day += 1) {
      cells.push(new Date(month.getFullYear(), month.getMonth(), day));
    }
    return cells;
  }, [month]);

  const selected = new Date(`${selectedDate}T12:00:00`);

  return (
    <div className="min-h-screen topo-bg">
      <SiteHeader parkLabel={parkLabel} onSwitchPark={onSwitchPark} />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {/* Unified Top Toolbar */}
        <section className="rounded-xl border border-border bg-card px-5 py-4 shadow-panel">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold uppercase tracking-wide">
                Task Board
              </h1>
              <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
                {parkLabel}
              </span>
              {admin.isAdmin && (
                <AdminModal
                  defaultTab="parks"
                  trigger={
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1">
                      <Edit3 className="size-3" /> Edit Park
                    </Button>
                  }
                />
              )}
            </div>
            <div className="flex items-center gap-2 sm:max-w-xs w-full">
              <label
                htmlFor="crew"
                className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Crew on shift <span className="text-destructive font-bold" title="Required to complete tasks">*</span>:
              </label>
              <Input
                ref={crewInputRef}
                id="crew"
                value={store.state.crew}
                onChange={(event) => {
                  store.setCrew(event.target.value);
                  if (crewWarning && event.target.value.trim()) {
                    setCrewWarning(false);
                  }
                }}
                placeholder="Name / Initials (required)"
                title="Your name or initials are required to complete tasks"
                className={cn(
                  "h-9 w-full transition-all",
                  crewWarning && !store.state.crew.trim() && "border-destructive ring-2 ring-destructive/40 bg-destructive/5",
                )}
              />
            </div>
          </div>
        </section>

        {/* 2-Column Responsive Layout */}
        <div className="mt-6 grid gap-6 md:grid-cols-[300px_1fr] lg:grid-cols-[330px_1fr] items-start">
          {/* Sticky Left Sidebar (Calendar) */}
          <aside className="md:sticky md:top-20 space-y-4">
            <section className="rounded-xl border border-border bg-card p-4 shadow-panel">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Previous month"
                  className="size-8"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="font-display text-sm font-semibold uppercase tracking-wide">
                  {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Next month"
                  className="size-8"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {WEEKDAYS.map((day) => (
                  <span key={day}>{day[0]}</span>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (!day) return <span key={`empty-${index}`} />;
                  const key = dateKey(day);
                  const dayStats = store.dayStats(key);
                  const isSelected = key === selectedDate;
                  const isToday = key === today;
                  const allDone = dayStats.total > 0 && dayStats.done === dayStats.total;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDate(key)}
                      className={cn(
                        "relative flex aspect-square flex-col items-center justify-center rounded-md border text-sm transition-colors cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                          : isToday
                            ? "border-primary/60 bg-muted font-medium"
                            : "border-transparent hover:bg-muted/70",
                      )}
                    >
                      <span className="tabular-nums">{day.getDate()}</span>
                      {dayStats.total > 0 ? (
                        <span
                          className={cn(
                            "mt-0.5 size-1.5 rounded-full",
                            allDone
                              ? "bg-emerald-500"
                              : isSelected
                                ? "bg-primary-foreground/90"
                                : "bg-primary/80",
                          )}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => {
                  setSelectedDate(today);
                  setMonth(startOfMonth(new Date()));
                }}
              >
                Jump to today
              </Button>
            </section>
          </aside>

          {/* Right Main Task List */}
          <section className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-panel">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold uppercase tracking-wide">
                  {selectedDate === today
                    ? "Today"
                    : selected.toLocaleDateString(undefined, { weekday: "long" })}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {selected.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => store.clearDay(selectedDate)}
                disabled={stats.done === 0}
              >
                <RotateCcw className="size-3.5" /> Uncheck all
              </Button>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                  Daily Progress
                </span>
                <span className="tabular-nums font-medium text-foreground">
                  {stats.done} of {stats.total} complete
                </span>
              </div>
              <Progress
                value={stats.total ? (stats.done / stats.total) * 100 : 0}
                className="mt-2 h-2"
              />
            </div>

            <ul className="mt-5 space-y-1.5">
              {tasks.map((task) => {
                const key = completionKey(selectedDate, task);
                const done = store.state.completed[key];
                const priority = store.priorityOf(task);
                const pStyle = PRIORITY_STYLES[priority];
                return (
                  <li
                    key={key}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors",
                      done ? "bg-muted/40 text-muted-foreground" : "hover:bg-muted/50 hover:border-border/50",
                    )}
                  >
                    <Checkbox
                      id={key}
                      checked={Boolean(done)}
                      onCheckedChange={() => handleToggleTask(task, Boolean(done))}
                      className="size-5 shrink-0"
                    />
                    <label
                      htmlFor={key}
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleTask(task, Boolean(done));
                      }}
                      className="flex min-w-0 flex-1 cursor-pointer flex-col justify-center select-none"
                    >
                      <span
                        className={cn(
                          "text-sm font-medium leading-snug break-words",
                          done && "line-through decoration-primary/60 opacity-80",
                        )}
                      >
                        {task}
                      </span>
                      {done ? (
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-primary">
                          <CheckCircle2 className="size-3 shrink-0" />
                          <span className="font-semibold">{done.by}</span>
                          {" · "}
                          {new Date(done.at).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      ) : null}
                    </label>
                    <span
                      className="flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-[11px] font-medium text-muted-foreground shadow-2xs"
                      title={`Priority: ${pStyle.label}`}
                    >
                      <span className={cn("size-2 rounded-full", pStyle.dot)} />
                      <span className="hidden xs:inline">{pStyle.label}</span>
                    </span>
                    {admin.isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${task}`}
                        className="size-8 shrink-0 text-muted-foreground opacity-60 transition-opacity hover:opacity-100 hover:text-destructive"
                        onClick={() => store.unscheduleTask(selectedDate, task)}
                        title="Remove task (Boss Mode)"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </li>
                );
              })}
              {tasks.length === 0 ? (
                <li className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                  Nothing scheduled for this day.
                </li>
              ) : null}
            </ul>

            {admin.isAdmin ? (
              <form
                className="mt-6 flex flex-col gap-2.5 sm:flex-row border-t border-border/70 pt-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  store.scheduleTask(selectedDate, newTask, newPriority);
                  setNewTask("");
                  setNewPriority(DEFAULT_PRIORITY);
                }}
              >
                <Input
                  value={newTask}
                  onChange={(event) => setNewTask(event.target.value)}
                  placeholder="Add a task to this day..."
                  className="h-10 min-w-0 flex-1"
                />
                <div className="flex gap-2 shrink-0">
                  <Select
                    value={newPriority}
                    onValueChange={(value) => setNewPriority(value as Priority)}
                  >
                    <SelectTrigger className="h-10 w-32 shrink-0">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          <span className="flex items-center gap-2">
                            <span className={cn("size-2 rounded-full", PRIORITY_STYLES[option].dot)} />
                            {PRIORITY_STYLES[option].label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="h-10 shrink-0" disabled={!newTask.trim()}>
                    <Plus className="size-4" /> Add
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5 font-medium">
                  <Lock className="size-3.5 text-muted-foreground/80" />
                  Adding and removing daily tasks is restricted to supervisors.
                </p>
                <AdminModal
                  trigger={
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 font-medium">
                      <KeyRound className="size-3" /> Unlock Boss Mode
                    </Button>
                  }
                />
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        <p>{admin.config.districtTitle}</p>
        <p className="mt-1">Designed and Developed by Thomas Roberts</p>
      </footer>
    </div>
  );
}
