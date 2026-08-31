import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarPlus, Edit3, KeyRound, Lock, Plus, RotateCcw, Trash2 } from "lucide-react";
import { CATEGORIES } from "@/data/tasks";
import { SiteHeader } from "@/components/SiteHeader";
import { useTaskStore, todayKey, type Priority, DEFAULT_PRIORITY } from "@/lib/task-store";
import { useParks } from "@/lib/park-store";
import { useAdmin } from "@/lib/admin-store";
import { AdminModal } from "@/components/AdminModal";
import { ThemeSampler } from "@/components/ThemeSampler";
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
  const admin = useAdmin();

  if (!parks.hydrated || !admin.hydrated) return <div className="min-h-screen topo-bg" />;

  if (!admin.isAdmin) {
    return (
      <div className="min-h-screen topo-bg">
        <SiteHeader
          parkLabel={parks.selected ? parks.nameFor(parks.selected) : undefined}
          onSwitchPark={parks.selected ? () => parks.select(null) : undefined}
        />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-panel space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Lock className="size-6" />
            </div>
            <h1 className="font-display text-xl font-bold uppercase tracking-wide text-foreground">
              Boss Mode Required
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The Task Library is restricted to supervisors. Please unlock Boss Mode to view and manage master park tasks.
            </p>
            <div className="pt-2">
              <AdminModal
                trigger={
                  <Button className="w-full gap-2">
                    <KeyRound className="size-4" /> Unlock Boss Mode
                  </Button>
                }
              />
            </div>
          </div>
        </main>
        <ThemeSampler />
      </div>
    );
  }

  if (!parks.selected) {
    return (
      <div className="min-h-screen topo-bg">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Pick a park on the task board first — each park keeps its own task library.
          </p>
        </main>
        <ThemeSampler />
      </div>
    );
  }

  return (
    <>
      <LibraryBoard
        key={parks.selected}
        parkId={parks.selected}
        parkLabel={parks.nameFor(parks.selected)}
        onSwitchPark={() => parks.select(null)}
      />
      <ThemeSampler />
    </>
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
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
                  {parkLabel}
                </span>
                <span className="text-xs text-muted-foreground">· Task Library</span>
              </div>
              <h1 className="mt-1 font-display text-3xl font-semibold uppercase tracking-wide">
                Master Task Library
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Add, rename, or remove tasks from the master library for {parkLabel}. Pinned tasks
                will be available when planning each day.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">{total} total tasks</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm(`Reset ${parkLabel}'s library to defaults?`)) {
                    store.resetLibrary();
                    toast.success("Library reset to defaults");
                  }
                }}
              >
                <RotateCcw /> Reset to defaults
              </Button>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              parkId={parkId}
              categoryId={category.id}
              defaultTitle={category.label}
              today={today}
              isAdmin={admin.isAdmin}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function CategoryCard({
  parkId,
  categoryId,
  defaultTitle,
  today,
  isAdmin,
}: {
  parkId: string;
  categoryId: string;
  defaultTitle: string;
  today: string;
  isAdmin: boolean;
}) {
  const store = useTaskStore(parkId);
  const admin = useAdmin();
  const tasks = store.libraryFor(categoryId);
  const [draft, setDraft] = useState("");
  const [priority, setPriority] = useState<Priority>(DEFAULT_PRIORITY);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const onAdd = (task: string, prio: Priority) => {
    store.addLibraryTask(categoryId, task, prio);
    toast.success(`Added "${task}"`);
  };

  const onRemove = (task: string) => {
    store.removeLibraryTask(categoryId, task);
    toast.info(`Removed "${task}"`);
  };

  const onRename = (task: string, next: string) => {
    store.renameLibraryTask(categoryId, task, next);
    setEditingIndex(null);
    toast.success(`Updated task name`);
  };

  const onScheduleToday = (task: string) => {
    store.scheduleTask(today, task);
    toast.success(`Scheduled for today`);
  };

  const title = admin.config.categoryTitles[categoryId] ?? defaultTitle;

  return (
    <section className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-panel">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide">{title}</h2>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <ul className="mt-3 flex-1 space-y-2">
        {tasks.map((task, index) => (
          <li
            key={task}
            className="group flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 transition-colors hover:border-border hover:bg-muted/60"
          >
            {editingIndex === index && isAdmin ? (
              <form
                className="flex flex-1 gap-1"
                onSubmit={(event) => {
                  event.preventDefault();
                  onRename(task, editText);
                }}
              >
                <Input
                  value={editText}
                  onChange={(event) => setEditText(event.target.value)}
                  className="h-7 text-xs"
                  autoFocus
                  onBlur={() => onRename(task, editText)}
                />
              </form>
            ) : (
              <span className="flex-1 px-2 py-1.5 text-sm font-medium leading-snug">
                {task}
              </span>
            )}
          </li>
        ))}
        {tasks.length === 0 ? (
          <li className="py-6 text-center text-sm text-muted-foreground">
            No tasks in this group yet.
          </li>
        ) : null}
      </ul>

      {isAdmin && (
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
      )}
    </section>
  );
}
