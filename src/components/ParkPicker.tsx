import { ArrowRight, MapPin, TreePine } from "lucide-react";
import type { Park } from "@/data/parks";
import { useAdmin } from "@/lib/admin-store";

export function ParkPicker({
  parks,
  onSelect,
}: {
  parks: Park[];
  onSelect: (id: string) => void;
}) {
  const admin = useAdmin();

  return (
    <div className="flex min-h-screen items-center justify-center topo-bg px-4 py-10 sm:py-16">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-panel">
        <div className="flex items-center justify-between border-b border-border/70 pb-5">
          <div className="flex items-center gap-3">
            <img
              src="/apple-touch-icon.png"
              alt="DEEP Logo"
              className="size-11 rounded-xl shadow-xs object-contain"
            />
            <div className="leading-tight">
              <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
                {admin.config.siteTitle}
              </h1>
              <p className="text-xs text-muted-foreground">{admin.config.siteSubtitle}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2.5">
          {parks.map((park) => {
            const meta = admin.config.parkMetadata[park.id];
            const isStatePark = Boolean(meta?.tag);

            return (
              <button
                key={park.id}
                type="button"
                onClick={() => onSelect(park.id)}
                className="group relative flex w-full items-center justify-between rounded-xl border border-border bg-card p-3.5 text-left transition-all duration-200 hover:border-primary hover:bg-muted/40 hover:shadow-xs cursor-pointer"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3.5">
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
                </div>
                <span className="ml-2 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                  <ArrowRight className="size-4" />
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
          <p className="text-center text-xs text-muted-foreground flex-1">
            Select your park to access today's task board.
          </p>
        </div>
      </div>
    </div>
  );
}
