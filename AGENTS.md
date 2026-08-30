<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Base44 dev environment

This is a Lovable TanStack Start + Vite + Bun app (SSR). It runs in Base44 via
`docker compose -f docker-compose.base44.yml up -d` (Bun image, source bind-mounted,
`bun run dev` with live reload). No external secrets are required.

Non-obvious setup notes:
- The `@lovable.dev/vite-tanstack-config` wrapper hardcodes the dev server to port
  **8080** (not Vite's default 5173, and not the `PORT` env var). The compose file
  maps host `3000 -> container 8080` accordingly. Do not "fix" this to 3000:3000.
- The wrapper does NOT set Vite `allowedHosts`, so Vite 403-blocks the preview's
  external hostname by default. `vite.config.ts` sets
  `vite: { server: { allowedHosts: true } }` to allow the Base44 preview origin.
  Keep this — removing it makes the preview return 403.
- The app is client-hydrated: SSR returns an empty loading shell
  (`<div class="min-h-screen topo-bg">`) until the parks store hydrates from
  localStorage, then the ParkPicker renders. An empty body on first paint is normal.

Verify it works: `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/`
should return 200 with the DEEP Park Maintenance Task Board title.
