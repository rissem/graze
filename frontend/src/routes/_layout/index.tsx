import { createFileRoute } from "@tanstack/react-router"

import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  const { user: currentUser } = useAuth()

  return (
    <>
      <div className="container max-w-full">
        <div className="pt-12 m-4">
          <p className="text-2xl truncate max-w-sm">
            Hi, {currentUser?.full_name || currentUser?.email} 👋🏼
          </p>
          <p className="text-2xl">Welcome back, nice to see you again!</p>
        </div>
      </div>
    </>
  )
}
