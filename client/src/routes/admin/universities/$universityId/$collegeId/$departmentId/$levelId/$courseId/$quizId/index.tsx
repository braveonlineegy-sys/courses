import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/admin/universities/$universityId/$collegeId/$departmentId/$levelId/$courseId/$quizId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/admin/universities/$universityId/$collegeId/$departmentId/$levelId/$courseId/$quizId/"!
    </div>
  )
}
