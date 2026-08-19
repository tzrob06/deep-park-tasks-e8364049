import { useState } from "react";
import { Plus, TreePine, Trash2 } from "lucide-react";
import type { Park } from "@/data/parks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="flex min-h-screen items-center justify-center topo-bg px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-panel">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <TreePine className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-xl font-semibold uppercase tracking-wide">
              DEEP Park Maintenance
            </span>
            <span className="block text-xs text-muted-foreground">Select your park</span>
          </span>
        </div>

        <ul className="mt-8 space-y-2">
          {parks.map((park) => (
            <li key={park.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelect(park.id)}
                className="flex-1 rounded-lg border border-border bg-card p-3 text-left font-display text-sm font-semibold uppercase tracking-wide transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                {park.name}
              </button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${park.name}`}
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(park.id)}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>

        <form
          className="mt-6 flex gap-2 border-t border-border pt-5"
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
            placeholder="Add a new park"
          />
          <Button type="submit" disabled={!name.trim()}>
            <Plus /> Add
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Your park is remembered on this device, and each park keeps its own task list.
        </p>
      </div>
    </div>
  );
}
