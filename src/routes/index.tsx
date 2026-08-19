import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { CATEGORIES } from "@/data/tasks";
import { SiteHeader } from "@/components/SiteHeader";
import { useTaskStore, taskKey } from "@/lib/task-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getParkSession } from "@/lib/gate.functions";
import { parkName } from "@/data/parks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DEEP Park Maintenance Task Board" },
      {
        name: "description",
        content:
          "Daily, weekly and seasonal maintenance checklist for CT DEEP park crews at Southford Falls, Kettletown, Larkin and the reservoirs.",
      },
      { property: "og:title", content: "DEEP Park Maintenance Task Board" },
      {
        property: "og:description",
        content: "Track park maintenance work as it gets done, shift by shift.",
      },
    ],
  }),
  loader: async () => {
    const { parkId } = await getParkSession();
    if (!parkId) throw redirect({ to: "/unlock" });
    return { parkId };
  },
  component: TaskBoard,
});

function TaskBoard() {
  const { parkId } = Route.useLoaderData();
  const store = useTaskStore(parkId);
  const [activeId, setActiveId] = useState(CATEGORIES[0]!.id);
  const [query, setQuery] = useState("");
  const [newTask, setNewTask] = useState("");

  const active = CATEGORIES.find((category) => category.id === activeId)!;
  const tasks = store.tasksFor(activeId);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? tasks.filter((task) => task.toLowerCase().includes(term)) : tasks;
  }, [tasks, query]);

  const counts = CATEGORIES.map((category) => {
    const all = store.tasksFor(category.id);
    const done = all.filter((task) => store.state.completed[taskKey(category.id, task)]).length;
    return { id: category.id, total: all.length, done };
  });
  const activeCount = counts.find((count) => count.id === activeId)!;
  const removedCount = store.state.removed.filter((key) =>
    key.startsWith(`${activeId}::`),
  ).length;
  const totalDone = counts.reduce((sum, count) => sum + count.done, 0);
  const totalAll = counts.reduce((sum, count) => sum + count.total, 0);

  return (
    <div className="min-h-screen topo-bg">
      <SiteHeader parkId={parkId} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="rounded-xl border border-border bg-card p-6 shadow-panel">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold uppercase tracking-wide">Task Board</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
                &middot; {parkName(parkId)} &middot; daily tasks clear automatically each morning
              </p>
            </div>
            <div className="w-full max-w-xs">
              <label
                htmlFor="crew"
                className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Crew member on shift
              </label>
              <p className="sr-only">
                Optional. The name entered here is stamped on each task you check off.
              </p>
              <Input
                id="crew"
                value={store.state.crew}
                onChange={(event) => store.setCrew(event.target.value)}
                placeholder="Optional — stamps your name on completed tasks"
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall progress</span>
              <span className="tabular-nums text-muted-foreground">
                {totalDone} of {totalAll} complete
              </span>
            </div>
            <Progress value={totalAll ? (totalDone / totalAll) * 100 : 0} className="mt-2" />
          </div>
        </section>

        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => {
            const count = counts.find((item) => item.id === category.id)!;
            const isActive = category.id === activeId;
            return (
              <button
                key={category.id}
                onClick={() => setActiveId(category.id)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-muted",
                )}
              >
                <span className="block font-display text-lg font-semibold uppercase tracking-wide">
                  {category.short}
                </span>
                <span
                  className={cn(
                    "mt-1 block text-xs tabular-nums",
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {count.done}/{count.total} done
                </span>
              </button>
            );
          })}
        </div>

        <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold uppercase tracking-wide">{active.short}</h2>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {active.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search tasks"
                  className="w-56 pl-9"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => store.resetCategory(activeId)}
                disabled={activeCount.done === 0}
              >
                <RotateCcw /> Uncheck all
              </Button>
            </div>
          </div>

          <ul className="mt-5 divide-y divide-border/70">
            {visible.map((task) => {
              const key = taskKey(activeId, task);
              const done = store.state.completed[key];
              return (
                <li key={key} className="group flex items-start gap-3 py-3">
                  <Checkbox
                    id={key}
                    checked={Boolean(done)}
                    onCheckedChange={() => store.toggle(activeId, task)}
                    className="mt-0.5"
                  />
                  <label htmlFor={key} className="flex-1 cursor-pointer text-sm">
                    <span
                      className={cn(
                        "capitalize",
                        done && "text-muted-foreground line-through decoration-primary/60",
                      )}
                    >
                      {task}
                    </span>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${task}`}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => store.removeTask(activeId, task)}
                  >
                    <Trash2 />
                  </Button>
                </li>
              );
            })}
            {visible.length === 0 ? (
              <li className="py-8 text-center text-sm text-muted-foreground">
                No tasks match &ldquo;{query}&rdquo;.
              </li>
            ) : null}
          </ul>

          {removedCount > 0 ? (
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              {removedCount} task{removedCount === 1 ? "" : "s"} removed from this list.
              <Button variant="link" size="sm" onClick={() => store.restoreRemoved(activeId)}>
                Restore them
              </Button>
            </p>
          ) : null}

          <form
            className="mt-5 flex gap-2 border-t border-border pt-5"
            onSubmit={(event) => {
              event.preventDefault();
              store.addTask(activeId, newTask);
              setNewTask("");
            }}
          >
            <Input
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              placeholder={`Add a task to ${active.short.toLowerCase()} work`}
            />
            <Button type="submit" disabled={!newTask.trim()}>
              <Plus /> Add
            </Button>
          </form>
        </section>
      </main>

      <footer className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        Connecticut DEEP &middot; Western District Parks Maintenance
      </footer>
    </div>
  );
}
