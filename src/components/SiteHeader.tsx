import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, CalendarDays, Repeat, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader({
  parkLabel,
  onSwitchPark,
}: {
  parkLabel?: string;
  onSwitchPark?: () => void;
}) {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-2xs">
            <TreePine className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold uppercase tracking-wide">
              DEEP Park Maintenance
            </span>
            <span className="block text-xs text-muted-foreground">
              {parkLabel ?? "Park maintenance task board"}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 sm:mr-1">
            <Link
              to="/"
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                currentPath === "/"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <CalendarDays className="size-3.5" />
              <span className="hidden sm:inline">Daily Board</span>
              <span className="sm:hidden">Board</span>
            </Link>
            <Link
              to="/library"
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                currentPath === "/library"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <BookOpen className="size-3.5" />
              <span className="hidden sm:inline">Task Library</span>
              <span className="sm:hidden">Library</span>
            </Link>
          </nav>

          {onSwitchPark ? (
            <Button variant="outline" size="sm" onClick={onSwitchPark} className="h-8 gap-1.5 text-xs">
              <Repeat className="size-3.5" />
              <span className="hidden sm:inline">Switch park</span>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
