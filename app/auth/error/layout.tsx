import { ReactNode } from "react"

export default function AuthErrorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="w-full max-w-md p-6 rounded-xl shadow-md bg-white border border-red-200">
        {children}
      </div>
    </div>
  )
}
