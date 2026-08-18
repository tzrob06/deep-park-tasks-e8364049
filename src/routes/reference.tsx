import { createFileRoute } from "@tanstack/react-router";
import { CATEGORIES } from "@/data/tasks";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/reference")({
  head: () => ({
    meta: [
      { title: "Master Task List | DEEP Park Maintenance" },
      {
        name: "description",
        content:
          "Printable master list of every daily, weekly, periodic and seasonal maintenance task for DEEP park crews.",
      },
      { property: "og:title", content: "Master Task List | DEEP Park Maintenance" },
      {
        property: "og:description",
        content: "Every routine park maintenance task, grouped by how often it needs doing.",
      },
    ],
  }),
  component: ReferencePage,
});

function ReferencePage() {
  return (
    <div className="min-h-screen topo-bg">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-semibold uppercase tracking-wide">Master Task List</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          The full standing list of park maintenance work, grouped by frequency. Print this for the
          shop wall or use the Task Board to check work off as it gets done.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {CATEGORIES.map((category) => (
            <section
              key={category.id}
              className="rounded-xl border border-border bg-card p-6 shadow-panel"
            >
              <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
                {category.short}
              </h2>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {category.name} &middot; {category.tasks.length} tasks
              </p>
              <ol className="mt-4 space-y-2 text-sm">
                {category.tasks.map((task, index) => (
                  <li key={task} className="flex gap-3 border-b border-border/60 pb-2">
                    <span className="w-6 shrink-0 text-muted-foreground tabular-nums">
                      {index + 1}.
                    </span>
                    <span className="capitalize">{task}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
