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
  HardHat,
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
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AdminModal({
  trigger,
  defaultTab = "parks",
  initialLoginTab = "crew",
  isOpen,
  onOpenChange,
}: {
  trigger?: React.ReactNode;
  defaultTab?: "parks" | "titles" | "security";
  initialLoginTab?: "crew" | "boss";
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const admin = useAdmin();
  const parks = useParks();

  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  // Login form state
  const [loginTab, setLoginTab] = useState<"crew" | "boss">(initialLoginTab);
  const [crewPasswordInput, setCrewPasswordInput] = useState("");
  const [bossPasswordInput, setBossPasswordInput] = useState("");
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

  // Boss Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Crew Password change state
  const [newCrewPassword, setNewCrewPassword] = useState("");
  const [confirmCrewPassword, setConfirmCrewPassword] = useState("");

  // New park state
  const [newParkName, setNewParkName] = useState("");
  const [newParkTag, setNewParkTag] = useState("");

  const handleCrewLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (admin.loginCrew(crewPasswordInput)) {
      setLoginError(false);
      setCrewPasswordInput("");
      setOpen(false);
      toast.success("Crew Mode enabled! You can now check off tasks and post notes.");
    } else {
      setLoginError(true);
      toast.error("Incorrect crew passcode. Please try again.");
    }
  };

  const handleBossLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (admin.loginBoss(bossPasswordInput)) {
      setLoginError(false);
      setBossPasswordInput("");
      setOpen(false);
      toast.success("Boss Mode unlocked!");
    } else {
      setLoginError(true);
      toast.error("Incorrect supervisor passcode. Please try again.");
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
      toast.error("Boss passcode must be at least 4 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Boss passcodes do not match.");
      return;
    }
    admin.changePassword(newPassword);
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Supervisor Boss passcode successfully updated!");
  };

  const handleChangeCrewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCrewPassword.trim().length < 4) {
      toast.error("Crew passcode must be at least 4 characters long.");
      return;
    }
    if (newCrewPassword !== confirmCrewPassword) {
      toast.error("Crew passcodes do not match.");
      return;
    }
    admin.changeCrewPassword(newCrewPassword);
    setNewCrewPassword("");
    setConfirmCrewPassword("");
    toast.success("Crew passcode successfully updated!");
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
                    : admin.isCrew
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {admin.isAdmin ? (
                  <ShieldCheck className="size-5" />
                ) : admin.isCrew ? (
                  <HardHat className="size-5" />
                ) : (
                  <KeyRound className="size-5" />
                )}
              </span>
              <div>
                <DialogTitle className="font-display text-xl uppercase tracking-wide">
                  {admin.isAdmin
                    ? "Supervisor / Boss Control Panel"
                    : admin.isCrew
                      ? "Park Crew & Supervisor Access"
                      : "Sign In to DEEP Tasks"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {admin.isAdmin
                    ? "Manage park sites, customize titles, and configure security passcodes."
                    : admin.isCrew
                      ? "You are logged in as Crew. Enter supervisor passcode to unlock Boss Mode."
                      : "Choose Crew login to check off tasks, or Boss login for site management."}
                </DialogDescription>
              </div>
            </div>
            {(admin.isCrew || admin.isAdmin) && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => {
                  admin.logout();
                  setOpen(false);
                  toast.info("Logged out. Returned to View-Only mode.");
                }}
              >
                <LogOut className="size-3.5" /> Sign Out
              </Button>
            )}
          </div>
        </DialogHeader>

        {!admin.isAdmin ? (
          /* Login Tabs (Crew Login vs Boss Login) */
          <Tabs
            value={loginTab}
            onValueChange={(val) => {
              setLoginTab(val as "crew" | "boss");
              setLoginError(false);
            }}
            className="mt-3 space-y-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="crew" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
                <HardHat className="size-3.5" /> Crew Login
              </TabsTrigger>
              <TabsTrigger value="boss" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
                <Lock className="size-3.5" /> Boss Login
              </TabsTrigger>
            </TabsList>

            {/* TAB: CREW LOGIN */}
            <TabsContent value="crew" className="space-y-4 pt-1">
              {admin.isCrew && !admin.isAdmin ? (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <Check className="size-4 text-emerald-500" /> Currently Signed In as Crew
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You have active access to check off tasks, enter crew names, and post shift notes.
                  </p>
                  <div className="pt-2 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        admin.logout();
                        toast.info("Logged out of Crew mode.");
                      }}
                    >
                      <LogOut className="size-3.5" /> Log Out to View-Only
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setLoginTab("boss")}
                    >
                      <ShieldCheck className="size-3.5" /> Switch to Boss Login
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCrewLogin} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="crew-password">Crew Passcode</Label>
                      <span className="text-[11px] text-muted-foreground">Default: deep1234</span>
                    </div>
                    <div className="relative">
                      <Input
                        id="crew-password"
                        type={showPassword ? "text" : "password"}
                        value={crewPasswordInput}
                        onChange={(e) => {
                          setCrewPasswordInput(e.target.value);
                          setLoginError(false);
                        }}
                        placeholder="Enter crew password (e.g. deep1234)..."
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
                    {loginError && loginTab === "crew" && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
                        <ShieldAlert className="size-3.5" /> Incorrect crew passcode. Please try again.
                      </p>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Signing in as Crew allows you to record shift completions, enter crew names, and share field passdown notes & photos.
                  </p>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <HardHat className="size-4" /> Sign In as Crew
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>

            {/* TAB: BOSS LOGIN */}
            <TabsContent value="boss" className="space-y-4 pt-1">
              <form onSubmit={handleBossLogin} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="boss-password">Supervisor / Boss Passcode</Label>
                    <span className="text-[11px] text-muted-foreground">Default: deepadmin</span>
                  </div>
                  <div className="relative">
                    <Input
                      id="boss-password"
                      type={showPassword ? "text" : "password"}
                      value={bossPasswordInput}
                      onChange={(e) => {
                        setBossPasswordInput(e.target.value);
                        setLoginError(false);
                      }}
                      placeholder="Enter supervisor password..."
                      className="pr-10 h-10 text-base sm:text-sm"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      autoComplete="current-password"
                      enterKeyHint="go"
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
                  {loginError && loginTab === "boss" && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
                      <ShieldAlert className="size-3.5" /> Incorrect supervisor passcode. Please try again.
                    </p>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Supervisor access unlocks master task library editing, site-wide photo inspection, adding/removing parks, and changing passcodes.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Lock className="size-4" /> Unlock Boss Mode
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        ) : (
          /* Admin Tabs (for Boss) */
          <Tabs defaultValue={defaultTab} className="mt-2 space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="parks" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Building2 className="size-3.5" /> Parks
              </TabsTrigger>
              <TabsTrigger value="titles" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Tag className="size-3.5" /> Titles
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Lock className="size-3.5" /> Passcodes
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
                                title="Delete park"
                                className="size-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Are you sure you want to delete "${park.name}" and all its task data?`,
                                    )
                                  ) {
                                    parks.deletePark(park.id);
                                    toast.info(`Deleted park "${park.name}"`);
                                  }
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
              <form onSubmit={handleAddPark} className="border-t border-border pt-3 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FolderPlus className="size-3.5" /> Add New Park Site
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="new-park-name" className="text-xs">
                      Park Name *
                    </Label>
                    <Input
                      id="new-park-name"
                      value={newParkName}
                      onChange={(e) => setNewParkName(e.target.value)}
                      placeholder="e.g. Kettletown"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-park-tag" className="text-xs">
                      Town / Location Tag
                    </Label>
                    <Input
                      id="new-park-tag"
                      value={newParkTag}
                      onChange={(e) => setNewParkTag(e.target.value)}
                      placeholder="e.g. Southbury, CT"
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={!newParkName.trim()}>
                    <Plus className="size-3.5" /> Add Park
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* TAB 2: SITE TITLES & CATEGORIES */}
            <TabsContent value="titles" className="space-y-4 pt-1">
              <form onSubmit={handleSaveTitles} className="space-y-4">
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Header & Branding Titles
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="site-title" className="text-xs">
                      Main Site Title
                    </Label>
                    <Input
                      id="site-title"
                      value={siteTitle}
                      onChange={(e) => setSiteTitle(e.target.value)}
                      placeholder="DEEP Park Maintenance"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district-title" className="text-xs">
                      Footer / District Title
                    </Label>
                    <Input
                      id="district-title"
                      value={districtTitle}
                      onChange={(e) => setDistrictTitle(e.target.value)}
                      placeholder="Connecticut DEEP · Western District Parks Maintenance"
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-3 border-t border-border pt-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Task Category Headings
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

            {/* TAB 3: PASSWORD & SECURITY (Boss & Crew Passcodes) */}
            <TabsContent value="security" className="space-y-4 pt-1">
              {/* 1. Change Boss Passcode */}
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Change Supervisor / Boss Passcode
                    </h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Used by supervisors to manage park configurations, edit master library, and set site titles.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="new-pw" className="text-xs">
                        New Boss Passcode
                      </Label>
                      <Input
                        id="new-pw"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 4 characters..."
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="confirm-pw" className="text-xs">
                        Confirm Boss Passcode
                      </Label>
                      <Input
                        id="confirm-pw"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter passcode..."
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newPassword.trim() || newPassword !== confirmPassword}
                    >
                      <Check className="size-3.5" /> Update Boss Passcode
                    </Button>
                  </div>
                </div>
              </form>

              {/* 2. Change Crew Passcode */}
              <form onSubmit={handleChangeCrewPassword} className="space-y-3">
                <div className="space-y-3 rounded-xl border border-amber-500/30 p-4 bg-amber-500/5">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Change Crew Member Passcode
                    </h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Shared with park maintenance workers to log in, check off tasks, and post shift notes. (Default: <code>deep1234</code>)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="new-crew-pw" className="text-xs">
                        New Crew Passcode
                      </Label>
                      <Input
                        id="new-crew-pw"
                        type="password"
                        value={newCrewPassword}
                        onChange={(e) => setNewCrewPassword(e.target.value)}
                        placeholder="Min 4 characters..."
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="confirm-crew-pw" className="text-xs">
                        Confirm Crew Passcode
                      </Label>
                      <Input
                        id="confirm-crew-pw"
                        type="password"
                        value={confirmCrewPassword}
                        onChange={(e) => setConfirmCrewPassword(e.target.value)}
                        placeholder="Re-enter passcode..."
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      variant="outline"
                      className="border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                      disabled={!newCrewPassword.trim() || newCrewPassword !== confirmCrewPassword}
                    >
                      <Check className="size-3.5" /> Update Crew Passcode
                    </Button>
                  </div>
                </div>
              </form>

              {/* 3. Reset Defaults */}
              <div className="rounded-xl border border-border p-4 bg-muted/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Reset Configuration</p>
                  <p className="text-[11px] text-muted-foreground">
                    Reset titles, categories, and default passcodes back to factory settings.
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
                    toast.success("Site configuration reset to defaults (Boss: deepadmin, Crew: deep1234)");
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
