import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import appCss from "@/styles.css?url";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AdminProvider } from "@/lib/admin-store";
import { ParkProvider } from "@/lib/park-store";
import { TaskProvider } from "@/lib/task-store";
import { PhotoProvider } from "@/lib/photo-store";
import { RecurringProvider } from "@/lib/recurring-store";
import { TemplateProvider } from "@/lib/template-store";

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#08b26b" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DEEP Tasks" />
        <meta name="application-name" content="DEEP Tasks" />
        <title>DEEP Park Maintenance Task Board</title>
        <meta name="description" content="Task tracking for Connecticut DEEP park maintenance crews." />
        <meta name="author" content="Connecticut DEEP" />
        <meta property="og:title" content="DEEP Park Maintenance Task Board" />
        <meta property="og:description" content="Task tracking for Connecticut DEEP park maintenance crews." />
        <meta property="og:image" content="/icon-512.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />

        <link rel="stylesheet" href={appCss} />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" sizes="180x180" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-120x120.png" sizes="120x120" />
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        {children}
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="deep_parks_theme">
      <AdminProvider>
        <ParkProvider>
          <TemplateProvider>
            <RecurringProvider>
              <TaskProvider>
                <PhotoProvider>
                  <Outlet />
                  <Toaster richColors position="bottom-right" />
                </PhotoProvider>
              </TaskProvider>
            </RecurringProvider>
          </TemplateProvider>
        </ParkProvider>
      </AdminProvider>
    </ThemeProvider>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-6 text-center">
      <h2 className="text-xl font-bold font-display uppercase tracking-wide">Page Not Found</h2>
      <p className="text-sm text-muted-foreground">The requested view could not be located.</p>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-6 text-center">
      <h2 className="text-xl font-bold font-display uppercase tracking-wide text-destructive">Application Error</h2>
      <p className="text-xs text-muted-foreground max-w-md">{error.message}</p>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#08b26b" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "DEEP Tasks" },
      { name: "application-name", content: "DEEP Tasks" },
      { title: "DEEP Park Maintenance Task Board" },
      { name: "description", content: "Task tracking for Connecticut DEEP park maintenance crews." },
      { name: "author", content: "Connecticut DEEP" },
      { property: "og:title", content: "DEEP Park Maintenance Task Board" },
      { property: "og:description", content: "Task tracking for Connecticut DEEP park maintenance crews." },
      { property: "og:image", content: "/icon-512.png" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "icon", href: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { rel: "icon", href: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon-180x180.png", sizes: "180x180" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon-120x120.png", sizes: "120x120" },
      { rel: "apple-touch-icon-precomposed", href: "/apple-touch-icon-precomposed.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
