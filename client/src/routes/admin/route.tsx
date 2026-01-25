import { requireRole } from "@/lib/auth";
import { Outlet, redirect } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  beforeLoad: async ({ location }) => {
    const session = await requireRole("ADMIN");
    if (!session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { user: session.user };
  },
  pendingComponent: () => (
    <div className="loading-container p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <p className="mt-2 text-muted-foreground">Loading...</p>
    </div>
  ),
});

function AdminPage() {
  return (
    <div className="">
      <Outlet />
    </div>
  );
}
