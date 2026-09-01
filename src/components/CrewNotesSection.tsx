import { useState, useRef } from "react";
import {
  Camera,
  Image as ImageIcon,
  Pin,
  PinOff,
  Plus,
  Trash2,
  X,
  Maximize2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { compressImageFile } from "@/lib/image-utils";
import type { CrewNote } from "@/lib/task-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CrewNotesSection({
  selectedDate,
  crewName,
  isAdmin,
  isCrew = false,
  notes,
  onAddNote,
  onDeleteNote,
  onTogglePin,
  onRequireCrewFocus,
}: {
  selectedDate: string;
  crewName: string;
  isAdmin: boolean;
  isCrew?: boolean | undefined;
  notes: {
    pinned: CrewNote[];
    daySpecific: CrewNote[];
    allForDay: CrewNote[];
  };
  onAddNote: (
    date: string,
    text: string,
    options?: {
      isPinned?: boolean | undefined;
      photo?: string | undefined;
      photoName?: string | undefined;
    },
  ) => CrewNote | null;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRequireCrewFocus: () => void;
}) {
  const [noteText, setNoteText] = useState("");
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [attachedPhotoName, setAttachedPhotoName] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Lightbox modal state
  const [lightboxPhoto, setLightboxPhoto] = useState<CrewNote | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const { dataUrl, name } = await compressImageFile(file);
      setAttachedPhoto(dataUrl);
      setAttachedPhotoName(name);
      toast.success("Photo attached! It will save with your note.");
    } catch (err) {
      console.error(err);
      toast.error("Could not process photo. Please try another image.");
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearAttachedPhoto = () => {
    setAttachedPhoto(null);
    setAttachedPhotoName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crewName.trim()) {
      onRequireCrewFocus();
      toast.error("Please enter your name in 'Crew on shift' before posting a note.");
      return;
    }

    if (!noteText.trim() && !attachedPhoto) {
      toast.error("Please enter a note or attach a photo.");
      return;
    }

    const created = onAddNote(selectedDate, noteText, {
      photo: attachedPhoto ?? undefined,
      photoName: attachedPhotoName ?? undefined,
    });

    if (created) {
      setNoteText("");
      handleClearAttachedPhoto();
      toast.success("Shift note posted!");
    }
  };

  const formattedDate = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-panel space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3.5">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-5 text-primary" />
          <h2 className="font-display text-xl sm:text-2xl font-semibold uppercase tracking-wide">
            Shift Notes & Passdown
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium">{notes.allForDay.length} note{notes.allForDay.length === 1 ? "" : "s"}</span>
          {notes.pinned.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">
              <Pin className="size-2.5" /> {notes.pinned.length} Pinned
            </span>
          )}
        </div>
      </div>

      {/* 1. PINNED NOTICES (Visible across all days) */}
      {notes.pinned.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-500">
            <Pin className="size-3" />
            <span>Pinned Park Notices (Active All Shifts)</span>
          </div>
          <div className="space-y-2">
            {notes.pinned.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isAdmin={isAdmin}
                onDelete={onDeleteNote}
                onTogglePin={onTogglePin}
                onViewPhoto={setLightboxPhoto}
                isPinnedView
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. DAY-SPECIFIC NOTES */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Notes for {formattedDate}
        </div>

        {notes.daySpecific.length === 0 && notes.pinned.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground space-y-1">
            <p>No shift notes or maintenance reports for {formattedDate}.</p>
            {isCrew && (
              <p className="text-[11px] text-muted-foreground/70">
                Leave passdown notes, equipment alerts, or field photos below.
              </p>
            )}
          </div>
        ) : null}

        {notes.daySpecific.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isAdmin={isAdmin}
            onDelete={onDeleteNote}
            onTogglePin={onTogglePin}
            onViewPhoto={setLightboxPhoto}
          />
        ))}
      </div>

      {/* 3. ADD NOTE FORM (Hidden in View-Only Mode) */}
      {isCrew ? (
        <form onSubmit={handleSubmit} className="border-t border-border/70 pt-4 space-y-3">
          <div>
            <Input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Leave a shift note, equipment update, or repair notice..."
              className="h-10 text-sm"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>

          {/* Attached Photo Preview */}
          {attachedPhoto && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2 text-xs">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border bg-black">
                <img
                  src={attachedPhoto}
                  alt="Attached preview"
                  className="size-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {attachedPhotoName || "Field photo attached"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Will be included in note & saved to Boss Photo Log
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-destructive shrink-0"
                onClick={handleClearAttachedPhoto}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}

          {isCompressing && (
            <p className="text-xs text-primary animate-pulse">Processing photo...</p>
          )}

          {/* Bottom controls: Add Photo & Submit */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="size-3.5" />
              {attachedPhoto ? "Change Photo" : "Add Photo"}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 gap-1 text-xs"
              disabled={(!noteText.trim() && !attachedPhoto) || isCompressing}
            >
              <Plus className="size-3.5" /> Post Note
            </Button>
          </div>
        </form>
      ) : (
        <div className="border-t border-border/70 pt-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <AlertCircle className="size-3.5 text-muted-foreground/80" />
          <span>Viewing in Read-Only mode. Sign in as Crew to submit shift notes or attach photos.</span>
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog
        open={Boolean(lightboxPhoto)}
        onOpenChange={(open) => !open && setLightboxPhoto(null)}
      >
        <DialogContent className="max-w-3xl p-4 sm:p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center justify-between pr-4">
              <span>{lightboxPhoto?.by} · Field Photo</span>
              <span className="text-xs font-normal text-muted-foreground">
                {lightboxPhoto?.at && new Date(lightboxPhoto.at).toLocaleString()}
              </span>
            </DialogTitle>
          </DialogHeader>
          {lightboxPhoto?.photo && (
            <div className="mt-2 space-y-3">
              <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-lg bg-black/80 border border-border">
                <img
                  src={lightboxPhoto.photo}
                  alt={lightboxPhoto.text || "Field photo"}
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-md"
                />
              </div>
              {lightboxPhoto.text && (
                <p className="text-sm text-foreground bg-muted/40 p-3 rounded-md border border-border/70">
                  {lightboxPhoto.text}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function NoteCard({
  note,
  isAdmin,
  onDelete,
  onTogglePin,
  onViewPhoto,
  isPinnedView,
}: {
  note: CrewNote;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onViewPhoto: (note: CrewNote) => void;
  isPinnedView?: boolean;
}) {
  const formattedTime = new Date(note.at).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const formattedDate = new Date(note.at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={cn(
        "group rounded-lg border p-3 transition-colors",
        note.isPinned
          ? "border-amber-500/40 bg-amber-500/5 shadow-2xs"
          : "border-border bg-muted/20 hover:bg-muted/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
            {note.by}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {formattedDate} at {formattedTime}
          </span>
          {note.isPinned && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-500">
              <Pin className="size-2.5" /> Pinned
            </span>
          )}
        </div>

        {/* Action buttons (Restricted to Boss Mode) */}
        {isAdmin && (
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onTogglePin(note.id)}
              title={note.isPinned ? "Unpin note" : "Pin note to top"}
              className={cn(
                "p-1 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
                note.isPinned && "text-amber-500 hover:text-amber-600",
              )}
            >
              {note.isPinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete(note.id);
                toast.info("Note removed");
              }}
              title="Delete note"
              className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Note Text */}
      {note.text && (
        <p className="mt-2 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {note.text}
        </p>
      )}

      {/* Attached Photo Thumbnail */}
      {note.photo && (
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => onViewPhoto(note)}
            className="group/photo relative inline-flex items-center gap-2 rounded-lg border border-border bg-black/40 p-1.5 text-left text-xs transition-all hover:border-primary cursor-pointer"
          >
            <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-black">
              <img
                src={note.photo}
                alt={note.text || "Field note attachment"}
                className="size-full object-cover transition-transform group-hover/photo:scale-105"
              />
            </div>
            <div className="pr-2 min-w-0">
              <p className="flex items-center gap-1 font-medium text-foreground text-xs">
                <Maximize2 className="size-3 text-primary" /> View Full Photo
              </p>
              <p className="text-[10px] text-muted-foreground">Click to inspect</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
