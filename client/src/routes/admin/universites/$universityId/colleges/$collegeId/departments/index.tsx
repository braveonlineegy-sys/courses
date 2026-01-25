import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/admin/universites/$universityId/colleges/$collegeId/departments/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/admin/universites/$universityId/colleges/$collegeId/departments/"!
    </div>
  )
}
