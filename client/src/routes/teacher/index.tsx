import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { requireRole } from "@/lib/auth";

export const Route = createFileRoute("/teacher/")({
  beforeLoad: async () => {
    const session = await requireRole("TEACHER");
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
  component: TeacherLayout,
});

function TeacherLayout() {
  return (
    <div className="teacher-layout">
      <aside className="teacher-sidebar">
        <h2>Teacher Panel</h2>
        <nav>
          <a href="/teacher">Dashboard</a>
        </nav>
      </aside>
      <main className="teacher-content">
        <Outlet />
      </main>
    </div>
  );
}
