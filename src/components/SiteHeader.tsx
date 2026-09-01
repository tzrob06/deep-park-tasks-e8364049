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
      <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
        <Link to="/" className="flex items-center gap-2 min-w-0 shrink">
          <img
            src="/apple-touch-icon.png"
            alt="DEEP Logo"
            className="size-8 sm:size-9 rounded-md shadow-2xs shrink-0 object-contain"
          />
          <span className="leading-tight min-w-0">
            <span className="block font-display text-sm sm:text-lg font-semibold uppercase tracking-wide truncate">
              {admin.config.siteTitle}
            </span>
            <span className="hidden sm:block text-xs text-muted-foreground truncate">
              {parkLabel ?? "Park maintenance task board"}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              title="Daily Board"
              aria-label="Daily Board"
              className={`inline-flex items-center justify-center gap-1.5 rounded-md p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                currentPath === "/"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <CalendarDays className="size-4 sm:size-3.5" />
              <span className="hidden sm:inline">Daily Board</span>
            </Link>
            {admin.isAdmin && (
              <>
                <Link
                  to="/library"
                  title="Task Library"
                  aria-label="Task Library"
                  className={`inline-flex items-center justify-center gap-1.5 rounded-md p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    currentPath === "/library"
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <BookOpen className="size-4 sm:size-3.5" />
                  <span className="hidden sm:inline">Task Library</span>
                </Link>
                <Link
                  to="/photos"
                  title="Photo Log"
                  aria-label="Photo Log"
                  className={`inline-flex items-center justify-center gap-1.5 rounded-md p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    currentPath === "/photos"
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Camera className="size-4 sm:size-3.5" />
                  <span className="hidden sm:inline">Photo Log</span>
                </Link>
              </>
            )}
          </nav>

          {onSwitchPark ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchPark}
              title="Switch park"
              aria-label="Switch park"
              className="h-8 px-2 sm:px-2.5 gap-1.5 text-xs"
            >
              <Repeat className="size-3.5" />
              <span className="hidden sm:inline">Switch park</span>
            </Button>
          ) : null}

          {/* Role Status and Login / Admin Actions */}
          {admin.isViewer ? (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="hidden md:inline-flex items-center gap-1 rounded-md bg-muted/60 border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground">
                <Eye className="size-3 text-muted-foreground/80" /> View-Only
              </span>
              <AdminModal
                initialLoginTab="crew"
                trigger={
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 px-2.5 sm:px-3 gap-1.5 text-xs font-semibold shadow-xs"
                    title="Sign In (Crew or Boss)"
                    aria-label="Sign In"
                  >
                    <KeyRound className="size-3.5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                }
              />
            </div>
          ) : admin.isCrew && !admin.isAdmin ? (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span
                className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 p-1.5 sm:px-2 sm:py-1 text-xs font-semibold text-amber-700 dark:text-amber-400"
                title="Signed in as Crew"
              >
                <HardHat className="size-3.5" />
                <span className="hidden sm:inline">Crew Mode</span>
              </span>
              <AdminModal
                initialLoginTab="boss"
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 sm:px-2.5 gap-1 text-xs text-muted-foreground hover:text-foreground"
                    title="Unlock Boss Mode"
                    aria-label="Unlock Boss Mode"
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
                aria-label="Sign out"
                onClick={() => {
                  admin.logout();
                  toast.info("Logged out. Returned to View-Only mode.");
                }}
              >
                <LogOut className="size-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <AdminModal
                defaultTab="parks"
                trigger={
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 px-2.5 sm:px-3 gap-1.5 text-xs bg-primary text-primary-foreground font-semibold shadow-xs"
                    title="Supervisor Boss Control Panel"
                    aria-label="Supervisor Boss Control Panel"
                  >
                    <ShieldCheck className="size-3.5 text-primary-foreground" />
                    <span className="hidden sm:inline">Boss Panel</span>
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                title="Sign out to View-Only"
                aria-label="Sign out"
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
