"use client"

import { AuthDebug } from "@/components/auth-debug"

export default function AuthDebugPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      <AuthDebug />
    </div>
  )
}
