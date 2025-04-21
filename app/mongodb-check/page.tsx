"use client"

import { DatabaseStatus } from "@/components/db-status"
import { DataIntegrityCheck } from "@/components/data-integrity"
import { MongoDBDataDisplay } from "@/components/mongodb-data-display"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function MongoDBCheckPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tertiary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">MongoDB Integration Check</h1>
        <DatabaseStatus />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataIntegrityCheck />
        <MongoDBDataDisplay />
      </div>
    </div>
  )
}
