import { useState } from "react";
import { ArrowRight, MapPin, Plus, Trash2, TreePine } from "lucide-react";
import type { Park } from "@/data/parks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PARK_METADATA: Record<string, { image?: string; subtitle: string; tag?: string }> = {
  southford: {
    image: "/images/southford-falls.jpg",
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

        <div className="mt-6 space-y-3">
          {parks.map((park) => {
            const meta = PARK_METADATA[park.id];
            const isFeatured = park.id === "southford" && meta?.image;

            if (isFeatured) {
              return (
                <div
                  key={park.id}
                  className="group relative overflow-hidden rounded-xl border-2 border-border/80 bg-card transition-all duration-300 hover:border-primary hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(park.id)}
                    className="relative flex w-full flex-col text-left cursor-pointer"
                  >
                    {/* Sign Cover Image */}
                    <div className="relative h-44 w-full overflow-hidden bg-muted">
                      <img
                        src={meta.image}
                        alt="Southford Falls State Park sign"
                        className="h-full w-full object-cover object-[center_30%] transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                      <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between">
                        <div>
                          <span className="inline-block rounded-md bg-sun/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-sun-foreground shadow-2xs">
                            {meta.tag ?? "State Park"}
                          </span>
                          <h2 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-white drop-shadow-sm">
                            {park.name}
                          </h2>
                          <p className="text-xs font-medium text-white/80">
                            {meta.subtitle}
                          </p>
                        </div>
                        <span className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xs transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-primary-foreground">
                          <ArrowRight className="size-4" />
                        </span>
                      </div>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${park.name}`}
                    title="Remove park"
                    className="absolute top-2 right-2 size-8 rounded-full bg-black/40 text-white/80 backdrop-blur-xs hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(park.id);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              );
            }

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
                    <MapPin className="size-5" />
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
          <Button type="submit" className="h-10" disabled={!name.trim()}>
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
