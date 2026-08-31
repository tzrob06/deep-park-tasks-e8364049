import { useState } from "react";
import { ArrowRight, MapPin, Plus, Trash2, TreePine } from "lucide-react";
import type { Park } from "@/data/parks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PARK_METADATA: Record<string, { subtitle: string; tag?: string }> = {
  southford: {
    subtitle: "A Connecticut State Park",
    tag: "Southbury / Oxford, CT",
  },
  putnam: {
    subtitle: "A Connecticut State Park",
    tag: "Redding, CT",
  },
};

export function ParkPicker({
  parks,
  onSelect,
  onAdd,
  onRemove,
}: {
  parks: Park[];
  onSelect: (id: string) => void;
  onAdd: (name: string) => string | null;
  onRemove: (id: string) => void;
}) {
  const [name, setName] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center topo-bg px-4 py-10 sm:py-16">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-panel">
        <div className="flex items-center gap-3 border-b border-border/70 pb-5">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <TreePine className="size-6" />
          </span>
          <div className="leading-tight">
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
              DEEP Park Maintenance
            </h1>
            <p className="text-xs text-muted-foreground">Select your park work site</p>
          </div>
        </div>

        <div className="mt-6 space-y-2.5">
          {parks.map((park) => {
            const meta = PARK_METADATA[park.id];
            const isStatePark = Boolean(meta?.tag);

            return (
              <div
                key={park.id}
                className="group relative flex items-center justify-between rounded-xl border border-border bg-card p-3.5 transition-all duration-200 hover:border-primary hover:bg-muted/40 hover:shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => onSelect(park.id)}
                  className="flex min-w-0 flex-1 items-center gap-3.5 text-left cursor-pointer"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {isStatePark ? <TreePine className="size-5" /> : <MapPin className="size-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-foreground group-hover:text-primary transition-colors truncate">
                      {park.name}
                    </h2>
                    <p className="text-xs text-muted-foreground truncate">
                      {meta?.subtitle ?? "Custom Park Work Site"} {meta?.tag ? `· ${meta.tag}` : ""}
                    </p>
                  </div>
                  <span className="mr-2 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                    <ArrowRight className="size-4" />
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${park.name}`}
                  className="size-8 shrink-0 text-muted-foreground opacity-50 hover:opacity-100 hover:text-destructive transition-opacity"
                  onClick={() => onRemove(park.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>

        <form
          className="mt-6 flex gap-2 border-t border-border/70 pt-5"
          onSubmit={(event) => {
            event.preventDefault();
            const id = onAdd(name);
            setName("");
            if (id) onSelect(id);
          }}
        >
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Add another park name..."
            className="h-10 flex-1"
          />
          <Button type="submit" className="h-10 shrink-0" disabled={!name.trim()}>
            <Plus className="size-4" /> Add
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Your selected park is remembered on this device. Each park keeps its own calendar & tasks.
        </p>
      </div>
    </div>
  );
}
