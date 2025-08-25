// app/auth/layout.tsx
import { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-container">
      {children}
    </div>
  )
}
