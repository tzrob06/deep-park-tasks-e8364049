import { Link } from "@tanstack/react-router";
import { Moon, Repeat, Sun, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-store";

export function SiteHeader({
  parkLabel,
  onSwitchPark,
}: {
  parkLabel?: string;
  onSwitchPark?: () => void;
}) {
  const { theme, toggle, hydrated } = useTheme();

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
              {parkLabel ?? "Park maintenance task board"}
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {hydrated && theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          {onSwitchPark ? (
            <Button variant="outline" size="sm" onClick={onSwitchPark}>
              <Repeat /> Switch park
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
