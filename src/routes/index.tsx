import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Plus, RotateCcw, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { ParkPicker } from "@/components/ParkPicker";
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

const PRIORITY_STYLES: Record<Priority, { dot: string; label: string }> = {
  high: { dot: "bg-red-500", label: "High" },
  medium: { dot: "bg-amber-500", label: "Medium" },
  low: { dot: "bg-emerald-500", label: "Low" },
};

const NEXT_PRIORITY: Record<Priority, Priority> = { low: "medium", medium: "high", high: "low" };
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DEEP Park Maintenance Task Board" },
      {
        name: "description",
        content:
          "Daily park maintenance calendar for CT DEEP crews — see today's work, plan ahead, park by park.",
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

  if (!parks.selected) {
    return (
      <ParkPicker
        parks={parks.parks}
        onSelect={parks.select}
        onAdd={parks.addPark}
        onRemove={parks.removePark}
      />
    );
  }

  return (
    <TaskBoard
      key={parks.selected}
      parkId={parks.selected}
      parkLabel={parks.nameFor(parks.selected)}
      onSwitchPark={() => parks.select(null)}
    />
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
  const today = todayKey();
  const [selectedDate, setSelectedDate] = useState(today);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>(DEFAULT_PRIORITY);

  const tasks = store.tasksForDay(selectedDate);
  const stats = store.dayStats(selectedDate);

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

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="rounded-xl border border-border bg-card p-6 shadow-panel">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold uppercase tracking-wide">Task Board</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {parkLabel} &middot; daily tasks repeat every day, everything else shows on the day
                you schedule it
              </p>
            </div>
            <div className="w-full max-w-xs">
              <label
                htmlFor="crew"
                className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Crew member on shift
              </label>
              <Input
                id="crew"
                value={store.state.crew}
                onChange={(event) => store.setCrew(event.target.value)}
                placeholder="Optional"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                stamps your name on completed tasks
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Calendar */}
          <section className="h-fit rounded-xl border border-border bg-card p-4 shadow-panel">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Previous month"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              >
                <ChevronLeft />
              </Button>
              <span className="font-display text-sm font-semibold uppercase tracking-wide">
                {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Next month"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              >
                <ChevronRight />
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
                      "relative flex aspect-square flex-col items-center justify-center rounded-md border text-sm transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : isToday
                          ? "border-primary/60 bg-muted"
                          : "border-transparent hover:bg-muted",
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
                              ? "bg-primary-foreground/80"
                              : "bg-primary/70",
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

          {/* Day list */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-panel">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl font-semibold uppercase tracking-wide">
                  {selectedDate === today ? "Today" : selected.toLocaleDateString(undefined, { weekday: "long" })}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selected.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => store.clearDay(selectedDate)}
                disabled={stats.done === 0}
              >
                <RotateCcw /> Uncheck all
              </Button>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span className="tabular-nums text-muted-foreground">
                  {stats.done} of {stats.total} complete
                </span>
              </div>
              <Progress
                value={stats.total ? (stats.done / stats.total) * 100 : 0}
                className="mt-2"
              />
            </div>

            <ul className="mt-5 divide-y divide-border/70">
              {tasks.map((task) => {
                const key = completionKey(selectedDate, task);
                const done = store.state.completed[key];
                const priority = store.priorityOf(task);
                const pStyle = PRIORITY_STYLES[priority];
                const daily = store.isDaily(task);
                return (
                  <li key={key} className="group flex items-start gap-3 py-4">
                    <Checkbox
                      id={key}
                      checked={Boolean(done)}
                      onCheckedChange={() => store.toggle(selectedDate, task)}
                      className="mt-1 size-5"
                    />
                    <label htmlFor={key} className="flex-1 cursor-pointer">
                      <span
                        className={cn(
                          "text-base capitalize",
                          done && "text-muted-foreground line-through decoration-primary/60",
                        )}
                      >
                        {task}
                      </span>
                      {daily ? (
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Daily
                        </span>
                      ) : null}
                      {done ? (
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-primary">
                          <CheckCircle2 className="size-3" />
                          {done.by ? `${done.by} · ` : ""}
                          {new Date(done.at).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      ) : null}
                    </label>
                    <button
                      type="button"
                      onClick={() => store.setPriority(task, NEXT_PRIORITY[priority])}
                      className="flex items-center gap-1.5 rounded-full border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
                      title={`Priority: ${pStyle.label} — click to change`}
                    >
                      <span className={cn("size-2 rounded-full", pStyle.dot)} />
                      {pStyle.label}
                    </button>
                    {!daily ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${task}`}
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => store.unscheduleTask(selectedDate, task)}
                      >
                        <Trash2 />
                      </Button>
                    ) : null}
                  </li>
                );
              })}
              {tasks.length === 0 ? (
                <li className="py-10 text-center text-sm text-muted-foreground">
                  Nothing scheduled for this day — add a task below.
                </li>
              ) : null}
            </ul>

            <form
              className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5"
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
                placeholder="Add a task to this day"
                list="task-library"
                className="min-w-40 flex-1"
              />
              <datalist id="task-library">
                {Object.values(store.state.library)
                  .flat()
                  .map((task) => (
                    <option key={task} value={task} />
                  ))}
              </datalist>
              <Select value={newPriority} onValueChange={(value) => setNewPriority(value as Priority)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-red-500" />
                      High
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-amber-500" />
                      Medium
                    </span>
                  </SelectItem>
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      Low
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={!newTask.trim()}>
                <Plus /> Add
              </Button>
            </form>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        <p>Connecticut DEEP &middot; Western District Parks Maintenance</p>
        <p className="mt-1">Designed and Developed by Thomas Roberts</p>
      </footer>
    </div>
  );
}
