import { Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, TreePine } from "lucide-react";
import { parkName } from "@/data/parks";
import { lockPark } from "@/lib/gate.functions";
import { Button } from "@/components/ui/button";

export function SiteHeader({ parkId }: { parkId?: string }) {
  const router = useRouter();
  const lock = useServerFn(lockPark);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <TreePine className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold uppercase tracking-wide">
              DEEP Park Maintenance
            </span>
            <span className="block text-xs text-muted-foreground">
              {parkId ? parkName(parkId) : "Southford Falls · Kettletown"}
            </span>
          </span>
        </Link>
        {parkId ? (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await lock();
              await router.navigate({ to: "/unlock" });
            }}
          >
            <LogOut /> Sign out
          </Button>
        ) : null}
      </div>
    </header>
  );
}
