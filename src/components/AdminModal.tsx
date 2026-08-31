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
  Eye,
  EyeOff,
  FolderPlus,
  KeyRound,
  Lock,
  LogOut,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AdminModal({
  trigger,
  defaultTab = "parks",
  isOpen,
  onOpenChange,
}: {
  trigger?: React.ReactNode;
  defaultTab?: "parks" | "titles" | "security";
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const admin = useAdmin();
  const parks = useParks();

  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  // Login form state
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);

  // Site titles state
  const [siteTitle, setSiteTitle] = useState(admin.config.siteTitle);
  const [districtTitle, setDistrictTitle] = useState(admin.config.districtTitle);
  const [weeklyTitle, setWeeklyTitle] = useState(
    admin.config.categoryTitles["weekly"] ?? "Weekly Tasks",
  );
  const [monthlyTitle, setMonthlyTitle] = useState(
    admin.config.categoryTitles["monthly"] ?? "Monthly Tasks",
  );
  const [seasonalTitle, setSeasonalTitle] = useState(
    admin.config.categoryTitles["seasonal"] ?? "Seasonal Tasks",
  );

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // New park state
  const [newParkName, setNewParkName] = useState("");
  const [newParkTag, setNewParkTag] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (admin.login(passwordInput)) {
      setLoginError(false);
      setPasswordInput("");
      setOpen(false);
      toast.success("Boss Mode unlocked!");
    } else {
      setLoginError(true);
      toast.error("Incorrect password. Please try again.");
    }
  };

  const handleSaveTitles = (e: React.FormEvent) => {
    e.preventDefault();
    admin.updateSiteTitle(siteTitle, undefined, districtTitle);
    admin.updateCategoryTitle("weekly", weeklyTitle);
    admin.updateCategoryTitle("monthly", monthlyTitle);
    admin.updateCategoryTitle("seasonal", seasonalTitle);
    toast.success("Site titles and categories saved!");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim().length < 4) {
      toast.error("Password must be at least 4 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    admin.changePassword(newPassword);
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Admin password successfully updated!");
  };

  const handleAddPark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParkName.trim()) return;
    const id = parks.addPark(newParkName.trim());
    if (id && newParkTag.trim()) {
      admin.updateParkMetadata(id, {
        subtitle: "A Connecticut State Park",
        tag: newParkTag.trim(),
      });
    }
    setNewParkName("");
    setNewParkTag("");
    toast.success(`Park "${newParkName.trim()}" added!`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="flex items-center gap-2.5">
              <span
                className={`flex size-9 items-center justify-center rounded-lg ${
                  admin.isAdmin
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {admin.isAdmin ? (
                  <ShieldCheck className="size-5" />
                ) : (
                  <KeyRound className="size-5" />
                )}
              </span>
              <div>
                <DialogTitle className="font-display text-xl uppercase tracking-wide">
                  {admin.isAdmin ? "Supervisor / Boss Control Panel" : "Boss Admin Access"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {admin.isAdmin
                    ? "Edit park names, category titles, site branding, and security settings."
                    : "Enter your supervisor passcode to unlock site editing privileges."}
                </DialogDescription>
              </div>
            </div>
            {admin.isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => {
                  admin.logout();
                  setOpen(false);
                  toast.info("Logged out of Boss Mode");
                }}
              >
                <LogOut className="size-3.5" /> Exit Boss Mode
              </Button>
            )}
          </div>
        </DialogHeader>

        {!admin.isAdmin ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Supervisor Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setLoginError(false);
                  }}
                  placeholder="Enter boss password..."
                  className="pr-10 h-10 text-base sm:text-sm"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="current-password"
                  enterKeyHint="go"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="size-4.5" />
                  ) : (
                    <Eye className="size-4.5" />
                  )}
                </button>
              </div>
              {loginError && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
                  <ShieldAlert className="size-3.5" /> Incorrect passcode. Please try again.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <KeyRound className="size-4" /> Unlock Boss Mode
              </Button>
            </div>
          </form>
        ) : (
          /* Admin Tabs */
          <Tabs defaultValue={defaultTab} className="mt-2 space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="parks" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Building2 className="size-3.5" /> Parks
              </TabsTrigger>
              <TabsTrigger value="titles" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Tag className="size-3.5" /> Titles
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
                        <div className="flex items-center gap-2">
                          <div className="flex-1 space-y-1">
                            <Label className="text-[11px] text-muted-foreground font-medium">
                              Park Name
                            </Label>
                            <Input
                              defaultValue={park.name}
                              onBlur={(e) => {
                                if (e.target.value.trim() && e.target.value !== park.name) {
                                  parks.renamePark(park.id, e.target.value.trim());
                                  toast.success(`Renamed to "${e.target.value.trim()}"`);
                                }
                              }}
                              className="h-9 font-medium"
                            />
                          </div>

                          <div className="flex-1 space-y-1">
                            <Label className="text-[11px] text-muted-foreground font-medium">
                              Town / Location Tag
                            </Label>
                            <Input
                              defaultValue={meta.tag ?? ""}
                              placeholder="e.g. Southbury / Oxford, CT"
                              onBlur={(e) => {
                                admin.updateParkMetadata(park.id, {
                                  subtitle: meta.subtitle || "A Connecticut State Park",
                                  tag: e.target.value.trim(),
                                });
                                toast.success(`Updated location tag for ${park.name}`);
                              }}
                              className="h-9"
                            />
                          </div>

                          {parks.parks.length > 1 && (
                            <div className="pt-5">
                              <Button
                                variant="ghost"
                                size="icon"
                                title={`Delete ${park.name}`}
                                className="size-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  parks.removePark(park.id);
                                  toast.success(`Removed park "${park.name}"`);
                                }}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add New Park Form */}
              <form
                onSubmit={handleAddPark}
                className="mt-4 rounded-xl border border-dashed border-border p-3.5 bg-muted/30 space-y-3"
              >
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Plus className="size-3.5" /> Add New Park Site
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    value={newParkName}
                    onChange={(e) => setNewParkName(e.target.value)}
                    placeholder="New park name..."
                    className="h-9"
                  />
                  <Input
                    value={newParkTag}
                    onChange={(e) => setNewParkTag(e.target.value)}
                    placeholder="Location / Town (optional)..."
                    className="h-9"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={!newParkName.trim()}>
                    <Plus className="size-3.5" /> Add Park Site
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* TAB 2: NAMES & TITLES */}
            <TabsContent value="titles" className="space-y-4 pt-1">
              <form onSubmit={handleSaveTitles} className="space-y-4">
                <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/20">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Header & Branding Titles
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="site-title" className="text-xs">
                      Main Website Title
                    </Label>
                    <Input
                      id="site-title"
                      value={siteTitle}
                      onChange={(e) => setSiteTitle(e.target.value)}
                      placeholder="e.g. DEEP Park Maintenance"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district-title" className="text-xs">
                      District & Agency Footer
                    </Label>
                    <Input
                      id="district-title"
                      value={districtTitle}
                      onChange={(e) => setDistrictTitle(e.target.value)}
                      placeholder="e.g. Connecticut DEEP · Western District Parks Maintenance"
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/20">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Task Category Section Names
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="cat-weekly" className="text-xs">
                      Category 1 Name (Weekly)
                    </Label>
                    <Input
                      id="cat-weekly"
                      value={weeklyTitle}
                      onChange={(e) => setWeeklyTitle(e.target.value)}
                      placeholder="Weekly Tasks"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-monthly" className="text-xs">
                      Category 2 Name (Monthly)
                    </Label>
                    <Input
                      id="cat-monthly"
                      value={monthlyTitle}
                      onChange={(e) => setMonthlyTitle(e.target.value)}
                      placeholder="Monthly Tasks"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-seasonal" className="text-xs">
                      Category 3 Name (Seasonal)
                    </Label>
                    <Input
                      id="cat-seasonal"
                      value={seasonalTitle}
                      onChange={(e) => setSeasonalTitle(e.target.value)}
                      placeholder="Seasonal Tasks"
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
