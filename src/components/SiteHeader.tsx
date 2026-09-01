import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, CalendarDays, Camera, Eye, HardHat, KeyRound, Lock, LogOut, Repeat, ShieldCheck, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/lib/admin-store";
import { AdminModal } from "@/components/AdminModal";
import { toast } from "sonner";

export function SiteHeader({
  parkLabel,
  onSwitchPark,
}: {
  parkLabel?: string | undefined;
  onSwitchPark?: (() => void) | undefined;
}) {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const admin = useAdmin();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-2xs">
            <TreePine className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold uppercase tracking-wide">
              {admin.config.siteTitle}
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
            {admin.isAdmin && (
              <>
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
                <Link
                  to="/photos"
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    currentPath === "/photos"
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Camera className="size-3.5" />
                  <span className="hidden sm:inline">Photo Log</span>
                  <span className="sm:hidden">Photos</span>
                </Link>
              </>
            )}
          </nav>

          {onSwitchPark ? (
            <Button variant="outline" size="sm" onClick={onSwitchPark} className="h-8 gap-1.5 text-xs">
              <Repeat className="size-3.5" />
              <span className="hidden sm:inline">Switch park</span>
            </Button>
          ) : null}

          {/* Role Status and Login / Admin Actions */}
          {admin.isViewer ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden md:inline-flex items-center gap-1 rounded-md bg-muted/60 border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground">
                <Eye className="size-3 text-muted-foreground/80" /> View-Only
              </span>
              <AdminModal
                initialLoginTab="crew"
                trigger={
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-semibold shadow-xs"
                    title="Sign in as Crew or Supervisor"
                  >
                    <KeyRound className="size-3.5" />
                    <span>Sign In</span>
                  </Button>
                }
              />
            </div>
          ) : admin.isCrew && !admin.isAdmin ? (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <HardHat className="size-3.5" />
                <span className="hidden sm:inline">Crew Mode</span>
              </span>
              <AdminModal
                initialLoginTab="boss"
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                    title="Supervisor / Boss Login"
                  >
                    <Lock className="size-3.5" />
                    <span className="hidden md:inline">Boss</span>
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                title="Sign out to View-Only"
                onClick={() => {
                  admin.logout();
                  toast.info("Logged out. Returned to View-Only mode.");
                }}
              >
                <LogOut className="size-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <AdminModal
                defaultTab="parks"
                trigger={
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground font-semibold shadow-xs"
                    title="Supervisor Boss Control Panel"
                  >
                    <ShieldCheck className="size-3.5 text-primary-foreground" />
                    <span className="hidden sm:inline">Boss Panel</span>
                    <span className="sm:hidden">Boss</span>
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                title="Sign out to View-Only"
                onClick={() => {
                  admin.logout();
                  toast.info("Logged out of Boss Mode.");
                }}
              >
                <LogOut className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
