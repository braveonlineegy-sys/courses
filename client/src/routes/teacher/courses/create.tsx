import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/teacher/courses/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/teacher/courses/create"!</div>
}
