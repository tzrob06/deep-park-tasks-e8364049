import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, CalendarDays, Camera, Eye, Lock, Repeat, Share2, ShieldCheck, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/lib/admin-store";
import { AdminModal } from "@/components/AdminModal";
import { toast } from "sonner";

export function SiteHeader({
  parkLabel,
  onSwitchPark,
  isReadOnly = false,
}: {
  parkLabel?: string | undefined;
  onSwitchPark?: (() => void) | undefined;
  isReadOnly?: boolean | undefined;
}) {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const admin = useAdmin();

  const handleCopyViewLink = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("view", "readonly");
      navigator.clipboard.writeText(url.toString()).then(
        () => {
          toast.success("View-only link copied!", {
            description: "Anyone opening this link can view tasks in read-only mode without making changes.",
          });
        },
        () => {
          toast.error("Could not copy link to clipboard.");
        },
      );
    } catch {
      toast.error("Could not generate share link.");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" search={isReadOnly ? { view: "readonly" } : {}} className="flex items-center gap-3">
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
              search={isReadOnly ? { view: "readonly" } : {}}
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
            {!isReadOnly && admin.isAdmin && (
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

          {/* Share View-Only Link Button (in full mode) */}
          {!isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyViewLink}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              title="Copy a shareable read-only link for viewers"
            >
              <Share2 className="size-3.5" />
              <span className="hidden sm:inline">Share View Link</span>
              <span className="sm:hidden">Share</span>
            </Button>
          )}

          {/* Read-Only Status Indicator & Exit Link */}
          {isReadOnly ? (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Eye className="size-3.5" />
                <span>Read-Only</span>
              </span>
              <Link
                to="/"
                search={{}}
                className="hidden sm:inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                title="Exit read-only view"
              >
                Exit View
              </Link>
            </div>
          ) : (
            <AdminModal
              trigger={
                <Button
                  variant={admin.isAdmin ? "default" : "outline"}
                  size="sm"
                  className={`h-8 gap-1.5 text-xs ${
                    admin.isAdmin
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-foreground hover:bg-muted"
                  }`}
                  title={admin.isAdmin ? "Supervisor Boss Control Panel" : "Boss / Supervisor Admin Access"}
                >
                  {admin.isAdmin ? (
                    <>
                      <ShieldCheck className="size-3.5 text-primary-foreground" />
                      <span className="hidden sm:inline">Boss Panel</span>
                      <span className="sm:hidden">Boss</span>
                    </>
                  ) : (
                    <>
                      <Lock className="size-3.5" />
                      <span className="hidden sm:inline">Boss Admin</span>
                      <span className="sm:hidden">Boss</span>
                    </>
                  )}
                </Button>
              }
            />
          )}
        </div>
      </div>
    </header>
  );
}
