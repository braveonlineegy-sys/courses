import { requireRole } from "@/lib/auth";
import { Link, Outlet, redirect } from "@tanstack/react-router";
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

const LINKS = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/universities", label: "Universities" },
  { to: "/admin/teachers", label: "Teachers" },
  { to: "/admin/students", label: "Students" },
];

function AdminPage() {
  return (
    <div className="admin-layout flex h-screen bg-background">
      <aside className="admin-sidebar w-64 border-r p-4 bg-card">
        <h2 className="text-xl font-bold mb-6 px-2">Admin Panel</h2>
        <nav className="space-y-1">
          <Link
            to="/admin"
            className="block px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            activeProps={{
              className: "bg-accent text-accent-foreground font-medium",
            }}
            activeOptions={{ exact: true }}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/universities"
            className="block px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            activeProps={{
              className: "bg-accent text-accent-foreground font-medium",
            }}
          >
            Universities
          </Link>
        </nav>
      </aside>
      <main className="admin-content flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
