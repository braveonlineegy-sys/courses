import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/teacher/courses/$courseId/$quizId/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/teacher/courses/$courseId/$quizId/"!</div>;
}
