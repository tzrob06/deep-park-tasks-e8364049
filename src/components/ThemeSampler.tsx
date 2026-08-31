import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Palette, Sparkles, X } from "lucide-react";
import { useTheme, type ThemeId } from "@/lib/theme-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeSampler() {
  const { theme, setTheme, themes, themeInfo } = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-border bg-card/95 px-3.5 py-2 text-xs font-semibold shadow-lg backdrop-blur hover:bg-muted/80 transition-all cursor-pointer"
        title="Open Theme Previewer"
      >
        <Palette className="size-4 text-primary" />
        <span>Theme: {themeInfo.name}</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-80 rounded-2xl border border-border bg-card/95 p-3.5 shadow-2xl backdrop-blur transition-all">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-3.5" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide">
              Theme Sampler
            </h3>
            <p className="text-[10px] text-muted-foreground">Click any theme to preview live</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground"
            onClick={() => setIsOpen(false)}
            title="Close Previewer"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <div className="mt-3 space-y-1.5">
          {themes.map((t) => {
            const isSelected = t.id === theme;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as ThemeId)}
                className={cn(
                  "flex w-full items-center justify-between gap-2.5 rounded-xl border p-2 text-left text-xs transition-all cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/10 font-semibold shadow-xs"
                    : "border-border/60 bg-card hover:bg-muted/50 hover:border-border",
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Swatches */}
                  <div className="flex items-center -space-x-1 shrink-0">
                    <span
                      className="size-4 rounded-full border border-black/20 shadow-2xs"
                      style={{ backgroundColor: t.swatches.primary }}
                    />
                    <span
                      className="size-4 rounded-full border border-black/20 shadow-2xs"
                      style={{ backgroundColor: t.swatches.accent }}
                    />
                    <span
                      className="size-4 rounded-full border border-black/20 shadow-2xs"
                      style={{ backgroundColor: t.swatches.bg }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium truncate">{t.name}</span>
                      <span className="rounded bg-muted px-1.5 py-0.2 text-[9px] font-semibold text-muted-foreground uppercase">
                        {t.badge}
                      </span>
                    </div>
                  </div>
                </div>
                {isSelected ? (
                  <Check className="size-4 text-primary shrink-0" />
                ) : (
                  <span className="text-[10px] text-muted-foreground opacity-60">Try</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
