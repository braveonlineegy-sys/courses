import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { requireRole } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const session = await requireRole("ADMIN");
    if (!session) {
      throw redirect({ to: "/login" });
    }
    return { user: session.user };
  },
  pendingComponent: () => (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p>Loading...</p>
    </div>
  ),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <a href="/admin">Dashboard</a>
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
