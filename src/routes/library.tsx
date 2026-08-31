import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarPlus, Edit3, Plus, RotateCcw, Trash2 } from "lucide-react";
import { CATEGORIES } from "@/data/tasks";
import { SiteHeader } from "@/components/SiteHeader";
import { useTaskStore, todayKey, type Priority, DEFAULT_PRIORITY } from "@/lib/task-store";
import { useParks } from "@/lib/park-store";
import { useAdmin } from "@/lib/admin-store";
import { AdminModal } from "@/components/AdminModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Task Library — DEEP Park Maintenance" },
      {
        name: "description",
        content:
          "The full master list of DEEP park maintenance tasks, grouped by frequency and editable by the crew.",
      },
      { property: "og:title", content: "Task Library — DEEP Park Maintenance" },
      {
        property: "og:description",
        content: "Edit the master maintenance task list and schedule work onto the calendar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const parks = useParks();

  if (!parks.hydrated) return <div className="min-h-screen topo-bg" />;

  if (!parks.selected) {
    return (
      <div className="min-h-screen topo-bg">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Pick a park on the task board first — each park keeps its own task library.
          </p>
        </main>
      </div>
    );
  }

  return (
    <LibraryBoard
      key={parks.selected}
      parkId={parks.selected}
      parkLabel={parks.nameFor(parks.selected)}
      onSwitchPark={() => parks.select(null)}
    />
  );
}

export function LibraryBoard({
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
  const total = CATEGORIES.reduce((sum, category) => sum + store.libraryFor(category.id).length, 0);

  return (
    <div className="min-h-screen topo-bg">
      <SiteHeader parkLabel={parkLabel} onSwitchPark={onSwitchPark} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="rounded-xl border border-border bg-card p-6 shadow-panel">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-semibold uppercase tracking-wide">
                  Task Library
                </h1>
                {admin.isAdmin && (
                  <AdminModal
                    defaultTab="titles"
                    trigger={
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1">
                        <Edit3 className="size-3" /> Edit Titles
                      </Button>
                    }
                  />
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {total === 0
                  ? `No tasks in ${parkLabel}’s library yet. Add your park’s recurring tasks below to build its master library.`
                  : `${total} tasks for ${parkLabel}. Edit the text of any task, delete what you don’t do, add your own, or drop a task straight onto today’s list.`}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                store.resetLibrary();
                toast.success(
                  parkId === "southford"
                    ? "Library restored to original task list"
                    : "Task library cleared",
                );
              }}
            >
              <RotateCcw className="size-3.5" />
              {parkId === "southford" ? "Restore original list" : "Clear task list"}
            </Button>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {CATEGORIES.map((category) => {
            const categoryDisplayName = admin.config.categoryTitles[category.id] ?? category.name;
            return (
              <CategoryCard
                key={category.id}
                categoryId={category.id}
                name={categoryDisplayName}
                tasks={store.libraryFor(category.id)}
                onRename={(task, next) => store.renameLibraryTask(category.id, task, next)}
                onRemove={(task) => store.removeLibraryTask(category.id, task)}
                onAdd={(task, priority) => store.addLibraryTask(category.id, task, priority)}
                onScheduleToday={(task) => {
                  store.scheduleTask(today, task);
                  toast.success(`Added “${task}” to today`);
                }}
              />
            );
          })}
        </div>
      </main>

      <footer className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        <p>{admin.config.districtTitle}</p>
        <p className="mt-1">Designed and Developed by Thomas Roberts</p>
      </footer>
    </div>
  );
}

function CategoryCard({
  categoryId,
  name,
  tasks,
  onRename,
  onRemove,
  onAdd,
  onScheduleToday,
}: {
  categoryId: string;
  name: string;
  tasks: string[];
  onRename: (task: string, next: string) => void;
  onRemove: (task: string) => void;
  onAdd: (task: string, priority: Priority) => void;
  onScheduleToday: (task: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [priority, setPriority] = useState<Priority>(DEFAULT_PRIORITY);

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-panel">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide">{name}</h2>
        <span className="text-xs tabular-nums text-muted-foreground">{tasks.length} tasks</span>
      </div>

      <ul className="mt-3 divide-y divide-border/70">
        {tasks.map((task) => (
          <li key={`${categoryId}-${task}`} className="flex items-center gap-1 py-1.5">
            <Input
              defaultValue={task}
              onBlur={(event) => onRename(task, event.target.value)}
              className="h-9 flex-1 border-transparent bg-transparent px-2 capitalize shadow-none focus-visible:border-input focus-visible:bg-background"
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Add ${task} to today`}
              title="Add to today"
              onClick={() => onScheduleToday(task)}
            >
              <CalendarPlus />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${task}`}
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(task)}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
        {tasks.length === 0 ? (
          <li className="py-6 text-center text-sm text-muted-foreground">
            No tasks in this group yet.
          </li>
        ) : null}
      </ul>

      <form
        className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4"
        onSubmit={(event) => {
          event.preventDefault();
          onAdd(draft, priority);
          setDraft("");
          setPriority(DEFAULT_PRIORITY);
        }}
      >
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a task"
          className="min-w-32 flex-1"
        />
        <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={!draft.trim()}>
          <Plus /> Add
        </Button>
      </form>
    </section>
  );
}
