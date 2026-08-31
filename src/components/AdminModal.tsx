import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/lib/admin-store";
import { useParks } from "@/lib/park-store";
import {
  Building2,
  Check,
  FolderPlus,
  KeyRound,
  Lock,
  LogOut,
  Palette,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme, type ThemeId } from "@/lib/theme-store";
import { cn } from "@/lib/utils";

export function AdminModal({
  trigger,
  defaultTab = "parks",
  isOpen,
  onOpenChange,
}: {
  trigger?: React.ReactNode;
  defaultTab?: "parks" | "titles" | "theme" | "security";
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const admin = useAdmin();
  const parks = useParks();
  const themeObj = useTheme();

  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  // Login form state
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState(false);

  // New Park form state
  const [newParkName, setNewParkName] = useState("");
  const [newParkSubtitle, setNewParkSubtitle] = useState("");

  // Titles form state
  const [siteTitle, setSiteTitle] = useState(admin.config.siteTitle);
  const [districtTitle, setDistrictTitle] = useState(admin.config.districtTitle);
  const [weeklyTitle, setWeeklyTitle] = useState(admin.config.categoryTitles.weekly ?? "Weekly Tasks");
  const [monthlyTitle, setMonthlyTitle] = useState(admin.config.categoryTitles.monthly ?? "Monthly Tasks");
  const [seasonalTitle, setSeasonalTitle] = useState(admin.config.categoryTitles.seasonal ?? "Seasonal Tasks");

  // Security form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (admin.unlock(passcode)) {
      setLoginError(false);
      setPasscode("");
      toast.success("Boss Mode unlocked");
    } else {
      setLoginError(true);
      toast.error("Incorrect passcode");
    }
  };

  const handleAddPark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParkName.trim()) return;
    const park = parks.addPark(newParkName.trim());
    if (newParkSubtitle.trim()) {
      admin.setParkMetadata(park.id, { subtitle: newParkSubtitle.trim() });
    }
    setNewParkName("");
    setNewParkSubtitle("");
    toast.success(`Park "${park.name}" added`);
  };

  const handleSaveTitles = (e: React.FormEvent) => {
    e.preventDefault();
    admin.setSiteTitle(siteTitle);
    admin.setDistrictTitle(districtTitle);
    admin.setCategoryTitle("weekly", weeklyTitle);
    admin.setCategoryTitle("monthly", monthlyTitle);
    admin.setCategoryTitle("seasonal", seasonalTitle);
    toast.success("Titles updated successfully");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      toast.error("Passcode must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passcodes do not match");
      return;
    }
    admin.changePassword(newPassword);
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Boss passcode changed successfully");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            {admin.isAdmin ? (
              <>
                <ShieldCheck className="size-3.5 text-primary" />
                <span className="font-semibold text-primary">Boss Mode</span>
              </>
            ) : (
              <>
                <Lock className="size-3.5" />
                <span>Admin</span>
              </>
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <DialogTitle className="font-display text-xl uppercase tracking-wide">
                  Boss Control Panel
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Manage park sites, customize titles, and configure maintenance settings.
                </DialogDescription>
              </div>
            </div>
            {admin.isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1.5"
                onClick={() => {
                  admin.lock();
                  toast.info("Logged out of Boss Mode");
                }}
              >
                <LogOut className="size-3" /> Exit Boss Mode
              </Button>
            )}
          </div>
        </DialogHeader>

        {!admin.isAdmin ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="mt-4 space-y-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <KeyRound className="size-4 text-primary" />
                <span>Enter Boss Passcode</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This area is restricted to supervisors and maintenance directors.
              </p>
              <div className="space-y-2">
                <Label htmlFor="admin-passcode" className="text-xs">
                  Passcode
                </Label>
                <Input
                  id="admin-passcode"
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (loginError) setLoginError(false);
                  }}
                  placeholder="Enter passcode..."
                  className={cn(
                    "h-10",
                    loginError && "border-destructive focus-visible:ring-destructive",
                  )}
                  autoFocus
                />
                {loginError && (
                  <p className="text-xs text-destructive font-medium flex items-center gap-1">
                    <ShieldAlert className="size-3.5" /> Incorrect passcode. Please try again.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!passcode.trim()}>
                <KeyRound className="size-4" /> Unlock
              </Button>
            </div>
          </form>
        ) : (
          /* Admin Tabs */
          <Tabs defaultValue={defaultTab} className="mt-2 space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="parks" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Building2 className="size-3.5" /> Parks
              </TabsTrigger>
              <TabsTrigger value="titles" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Tag className="size-3.5" /> Titles
              </TabsTrigger>
              <TabsTrigger value="theme" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Palette className="size-3.5" /> Theme
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Lock className="size-3.5" /> Passcode
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: PARKS MANAGEMENT */}
            <TabsContent value="parks" className="space-y-4 pt-1">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Configured Park Sites ({parks.parks.length})
                  </h3>
                </div>

                <div className="space-y-3 divide-y divide-border/60">
                  {parks.parks.map((park) => {
                    const meta = admin.config.parkMetadata[park.id] ?? {
                      subtitle: "A Connecticut State Park",
                      tag: "",
                    };

                    return (
                      <div key={park.id} className="pt-3 first:pt-0 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{park.name}</span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              ({park.id})
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Are you sure you want to remove ${park.name}? This cannot be undone.`,
                                  )
                                ) {
                                  parks.removePark(park.id);
                                  toast.success(`Removed "${park.name}"`);
                                }
                              }}
                              disabled={parks.parks.length <= 1}
                              title="Delete Park"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Park Editable Subtitle */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <Label htmlFor={`sub-${park.id}`} className="text-[11px] text-muted-foreground">
                              Subtitle / Region
                            </Label>
                            <Input
                              id={`sub-${park.id}`}
                              defaultValue={meta.subtitle}
                              placeholder="e.g. Southbury / Oxford, CT"
                              className="h-8 text-xs mt-1"
                              onBlur={(e) => {
                                admin.setParkMetadata(park.id, { subtitle: e.target.value });
                                toast.success(`Updated subtitle for ${park.name}`);
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`tag-${park.id}`} className="text-[11px] text-muted-foreground">
                              Badge Tag
                            </Label>
                            <Input
                              id={`tag-${park.id}`}
                              defaultValue={meta.tag ?? ""}
                              placeholder="e.g. Headquarters"
                              className="h-8 text-xs mt-1"
                              onBlur={(e) => {
                                admin.setParkMetadata(park.id, { tag: e.target.value });
                                toast.success(`Updated tag for ${park.name}`);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add New Park Section */}
              <form
                onSubmit={handleAddPark}
                className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 p-4 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <FolderPlus className="size-3.5 text-primary" />
                  <span>Add New Park Site</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="new-park-name" className="text-xs">
                      Park Name *
                    </Label>
                    <Input
                      id="new-park-name"
                      value={newParkName}
                      onChange={(e) => setNewParkName(e.target.value)}
                      placeholder="e.g. Kettletown State Park"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-park-sub" className="text-xs">
                      Subtitle / Location
                    </Label>
                    <Input
                      id="new-park-sub"
                      value={newParkSubtitle}
                      onChange={(e) => setNewParkSubtitle(e.target.value)}
                      placeholder="e.g. Southbury, CT"
                      className="h-9"
                    />
                  </div>
                </div>
                <Button type="submit" size="sm" disabled={!newParkName.trim()} className="w-full">
                  <Plus className="size-3.5" /> Add Park
                </Button>
              </form>
            </TabsContent>

            {/* TAB 2: NAMES & TITLES */}
            <TabsContent value="titles" className="space-y-4 pt-1">
              <form onSubmit={handleSaveTitles} className="space-y-4">
                <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/20">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Header & District Branding
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="site-title" className="text-xs">
                      Site Title
                    </Label>
                    <Input
                      id="site-title"
                      value={siteTitle}
                      onChange={(e) => setSiteTitle(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district-title" className="text-xs">
                      District Subtitle / Footer
                    </Label>
                    <Input
                      id="district-title"
                      value={districtTitle}
                      onChange={(e) => setDistrictTitle(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/20">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Task Category Section Titles
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="cat-weekly" className="text-xs">
                      Weekly Category Title
                    </Label>
                    <Input
                      id="cat-weekly"
                      value={weeklyTitle}
                      onChange={(e) => setWeeklyTitle(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-monthly" className="text-xs">
                      Monthly Category Title
                    </Label>
                    <Input
                      id="cat-monthly"
                      value={monthlyTitle}
                      onChange={(e) => setMonthlyTitle(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-seasonal" className="text-xs">
                      Seasonal Category Title
                    </Label>
                    <Input
                      id="cat-seasonal"
                      value={seasonalTitle}
                      onChange={(e) => setSeasonalTitle(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit">
                    <Save className="size-4" /> Save All Titles
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* TAB: THEME & VISUAL STYLING */}
            <TabsContent value="theme" className="space-y-4 pt-1">
              <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/20">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Website Color Theme
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Select your preferred palette. Changes apply immediately across all devices.
                  </p>
                </div>

                <div className="grid gap-2.5">
                  {themeObj.themes.map((t) => {
                    const isSelected = t.id === themeObj.theme;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          themeObj.setTheme(t.id as ThemeId);
                          toast.success(`Theme switched to "${t.name}"`);
                        }}
                        className={cn(
                          "flex items-center justify-between rounded-xl border p-3 text-left transition-all cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary/10 font-semibold ring-1 ring-primary shadow-xs"
                            : "border-border bg-card hover:bg-muted/50 hover:border-border/80",
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex items-center -space-x-1.5 shrink-0">
                            <span
                              className="size-5 rounded-full border border-black/20 shadow-2xs"
                              style={{ backgroundColor: t.swatches.primary }}
                            />
                            <span
                              className="size-5 rounded-full border border-black/20 shadow-2xs"
                              style={{ backgroundColor: t.swatches.accent }}
                            />
                            <span
                              className="size-5 rounded-full border border-black/20 shadow-2xs"
                              style={{ backgroundColor: t.swatches.bg }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold truncate">{t.name}</span>
                              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                {t.badge}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-normal mt-0.5">
                              {t.description}
                            </p>
                          </div>
                        </div>
                        {isSelected && <Check className="size-5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* TAB: PASSWORD & SECURITY */}
            <TabsContent value="security" className="space-y-4 pt-1">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/20">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Change Boss Passcode
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="new-pw" className="text-xs">
                      New Passcode
                    </Label>
                    <Input
                      id="new-pw"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 4 characters)..."
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pw" className="text-xs">
                      Confirm Passcode
                    </Label>
                    <Input
                      id="confirm-pw"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password..."
                      className="h-9"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="mt-2"
                    disabled={!newPassword.trim() || newPassword !== confirmPassword}
                  >
                    <Check className="size-3.5" /> Update Passcode
                  </Button>
                </div>
              </form>

              <div className="rounded-xl border border-border p-4 bg-muted/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Reset Configuration</p>
                  <p className="text-[11px] text-muted-foreground">
                    Reset site titles and category names back to factory defaults.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    admin.resetToDefaults();
                    setSiteTitle("DEEP Park Maintenance");
                    setDistrictTitle("Connecticut DEEP · Western District Parks Maintenance");
                    setWeeklyTitle("Weekly Tasks");
                    setMonthlyTitle("Monthly Tasks");
                    setSeasonalTitle("Seasonal Tasks");
                    toast.success("Site configuration reset to default");
                  }}
                >
                  <RotateCcw className="size-3.5" /> Reset Defaults
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
