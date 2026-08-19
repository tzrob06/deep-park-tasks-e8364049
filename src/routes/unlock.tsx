import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { TreePine } from "lucide-react";
import { PARKS } from "@/data/parks";
import { unlockPark } from "@/lib/gate.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/unlock")({
  head: () => ({
    meta: [
      { title: "Park Sign In · DEEP Park Maintenance" },
      {
        name: "description",
        content: "Enter your park's shared crew password to open the DEEP maintenance task board.",
      },
      { property: "og:title", content: "Park Sign In · DEEP Park Maintenance" },
      {
        property: "og:description",
        content: "Shared crew sign-in for the CT DEEP park maintenance task board.",
      },
    ],
  }),
  component: Unlock,
});

function Unlock() {
  const router = useRouter();
  const unlock = useServerFn(unlockPark);
  const [parkId, setParkId] = useState(PARKS[0]!.id);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(false);
    const { ok } = await unlock({ data: { parkId, password } });
    setPending(false);
    if (ok) await router.navigate({ to: "/" });
    else setError(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center topo-bg px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-panel">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <TreePine className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-xl font-semibold uppercase tracking-wide">
              DEEP Park Maintenance
            </span>
            <span className="block text-xs text-muted-foreground">Crew sign in</span>
          </span>
        </div>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Select your park
            </span>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {PARKS.map((park) => (
                <button
                  key={park.id}
                  type="button"
                  onClick={() => setParkId(park.id)}
                  className={cn(
                    "rounded-lg border p-3 text-left font-display text-sm font-semibold uppercase tracking-wide transition-colors",
                    park.id === parkId
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-muted",
                  )}
                >
                  {park.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Park password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1"
              placeholder="Shared crew password"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive">
              That password doesn&rsquo;t match this park. Check with your supervisor.
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={!password.trim() || pending}>
            {pending ? "Checking…" : "Open task board"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            You&rsquo;ll stay signed in on this device.
          </p>
        </form>
      </div>
    </div>
  );
}
