import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Camera,
  Download,
  KeyRound,
  Lock,
  Maximize2,
  Search,
  Trash2,
  Calendar,
  User,
  Image as ImageIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useTaskStore } from "@/lib/task-store";
import { useParks } from "@/lib/park-store";
import { useAdmin } from "@/lib/admin-store";
import { AdminModal } from "@/components/AdminModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CrewNote } from "@/lib/task-store";
import { toast } from "sonner";

export const Route = createFileRoute("/photos")({
  head: () => ({
    meta: [
      { title: "Field Photo Log — DEEP Park Maintenance" },
      {
        name: "description",
        content:
          "Supervisor gallery of field photos, maintenance reports, and damage logs taken by park crews.",
      },
      { property: "og:title", content: "Field Photo Log — DEEP Park Maintenance" },
      {
        property: "og:description",
        content: "Supervisor photo log for park maintenance inspections and repairs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PhotosPage,
});

function PhotosPage() {
  const parks = useParks();
  const admin = useAdmin();

  if (!parks.hydrated || !admin.hydrated) return <div className="min-h-screen topo-bg" />;

  if (!admin.isAdmin) {
    return (
      <div className="min-h-screen topo-bg">
        <SiteHeader
          parkLabel={parks.selected ? parks.nameFor(parks.selected) : undefined}
          onSwitchPark={parks.selected ? () => parks.select(null) : undefined}
        />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-panel space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Lock className="size-6" />
            </div>
            <h1 className="font-display text-xl font-bold uppercase tracking-wide text-foreground">
              Boss Mode Required
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The Field Photo Log is restricted to supervisors. Please unlock Boss Mode to inspect maintenance photos, repair logs, and damage reports.
            </p>
            <div className="pt-2">
              <AdminModal
                initialLoginTab="boss"
                trigger={
                  <Button className="w-full gap-2">
                    <KeyRound className="size-4" /> Unlock Boss Mode
                  </Button>
                }
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!parks.selected) {
    return (
      <div className="min-h-screen topo-bg">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Pick a park on the task board first — each park keeps its own photo log.
          </p>
        </main>
      </div>
    );
  }

  return (
    <PhotosGallery
      key={parks.selected}
      parkId={parks.selected}
      parkLabel={parks.nameFor(parks.selected)}
      onSwitchPark={() => parks.select(null)}
    />
  );
}

function PhotosGallery({
  parkId,
  parkLabel,
  onSwitchPark,
}: {
  parkId: string;
  parkLabel: string;
  onSwitchPark: () => void;
}) {
  const store = useTaskStore(parkId);
  const admin = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<CrewNote | null>(null);

  const photos = store.allPhotos();

  const filteredPhotos = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return photos;
    return photos.filter(
      (p) =>
        p.by.toLowerCase().includes(q) ||
        p.text.toLowerCase().includes(q) ||
        p.date.includes(q),
    );
  }, [photos, searchQuery]);

  const handleDownload = (photo: CrewNote) => {
    if (!photo.photo) return;
    const a = document.createElement("a");
    a.href = photo.photo;
    a.download = photo.photoName || `deep-${parkId}-${photo.date}.jpg`;
    a.click();
  };

  return (
    <div className="min-h-screen topo-bg">
      <SiteHeader parkLabel={parkLabel} onSwitchPark={onSwitchPark} />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8 space-y-6">
        {/* Top Header Card */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-panel">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <Camera className="size-6 text-primary" />
                <h1 className="font-display text-2xl sm:text-3xl font-semibold uppercase tracking-wide">
                  Field Photo Log
                </h1>
                <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
                  {parkLabel}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Supervisor archive of all photos attached to shift notes, maintenance logs, and damage reports for {parkLabel}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground">
                {photos.length} Photo{photos.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Search Filter */}
          {photos.length > 0 && (
            <div className="mt-5 relative max-w-md">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photos by crew name, date, or note text..."
                className="pl-9 h-9 text-xs sm:text-sm"
              />
            </div>
          )}
        </section>

        {/* Gallery Grid */}
        {filteredPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-panel transition-all hover:border-primary/60 hover:shadow-md"
              >
                {/* Photo Thumbnail */}
                <div
                  className="relative aspect-4/3 w-full bg-black/60 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.photo}
                    alt={photo.text || "Field maintenance photo"}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="rounded-full bg-black/75 p-2 text-white shadow-md">
                      <Maximize2 className="size-4" />
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {new Date(photo.at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>

                {/* Card Details */}
                <div className="flex flex-1 flex-col justify-between p-3.5 space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground gap-1">
                      <span className="font-semibold text-foreground flex items-center gap-1 truncate">
                        <User className="size-3 text-primary shrink-0" /> {photo.by}
                      </span>
                      <span className="text-[11px] shrink-0">
                        {new Date(photo.at).toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {photo.text ? (
                      <p className="mt-1.5 text-xs text-foreground/90 line-clamp-2 leading-relaxed">
                        {photo.text}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-[11px] text-muted-foreground italic">
                        No description provided.
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 px-2 text-primary hover:text-primary"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <Maximize2 className="size-3" /> View
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground"
                        title="Download photo"
                        onClick={() => handleDownload(photo)}
                      >
                        <Download className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        title="Delete photo and note"
                        onClick={() => {
                          store.deleteNote(photo.id);
                          toast.success("Photo removed from log");
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <section className="rounded-xl border border-dashed border-border py-16 text-center bg-card/40 p-6 space-y-3">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <ImageIcon className="size-6" />
            </div>
            <h3 className="font-display text-lg font-semibold uppercase tracking-wide">
              {photos.length === 0 ? "No Photos Logged Yet" : "No Matching Photos"}
            </h3>
            <p className="mx-auto max-w-sm text-xs text-muted-foreground leading-relaxed">
              {photos.length === 0
                ? "When crew members attach photos to their shift notes on the task board, they will automatically be cataloged here for supervisor inspection."
                : `No photos matched "${searchQuery}". Try searching by another crew name or date.`}
            </p>
          </section>
        )}
      </main>

      {/* Full Size Modal Lightbox */}
      <Dialog
        open={Boolean(selectedPhoto)}
        onOpenChange={(open) => !open && setSelectedPhoto(null)}
      >
        <DialogContent className="max-w-4xl p-4 sm:p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex flex-wrap items-center justify-between pr-4 gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                  {selectedPhoto?.by}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedPhoto?.at && new Date(selectedPhoto.at).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedPhoto && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => handleDownload(selectedPhoto)}
                  >
                    <Download className="size-3" /> Download Full Photo
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedPhoto?.photo && (
            <div className="mt-2 space-y-3">
              <div className="max-h-[75vh] flex items-center justify-center overflow-hidden rounded-lg bg-black/90 border border-border">
                <img
                  src={selectedPhoto.photo}
                  alt={selectedPhoto.text || "Field photo"}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-md"
                />
              </div>
              {selectedPhoto.text && (
                <div className="rounded-lg bg-muted/40 p-3.5 border border-border/70 text-xs sm:text-sm text-foreground">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block mb-1">
                    Crew Note / Report:
                  </span>
                  {selectedPhoto.text}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <footer className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        <p>{admin.config.districtTitle}</p>
        <p className="mt-1">Designed and Developed by Thomas Roberts</p>
      </footer>
    </div>
  );
}
