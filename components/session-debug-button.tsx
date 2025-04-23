"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"

interface SessionDebugButtonProps {
  sessions: any[]
  onCreateTestSession: () => void
}

export function SessionDebugButton({ sessions, onCreateTestSession }: SessionDebugButtonProps) {
  const { user } = useAuth()
  const [showDebug, setShowDebug] = useState(false)

  const toggleDebug = () => {
    setShowDebug(!showDebug)
    if (!showDebug) {
      console.group("Session Debug Info")
      console.log("Current user:", user)
      console.log("Sessions count:", sessions.length)
      console.log("Sessions:", sessions)
      console.groupEnd()
    }
  }

  return (
    <div>
      <Button variant="outline" size="sm" onClick={toggleDebug}>
        {showDebug ? "Hide Debug" : "Debug"}
      </Button>

      {showDebug && (
        <div className="mt-2 p-2 border rounded text-xs">
          <p>User ID: {user?.id || "Not logged in"}</p>
          <p>Sessions: {sessions.length}</p>
          <Button variant="outline" size="sm" onClick={onCreateTestSession} className="mt-2">
            Create Test Session
          </Button>
        </div>
      )}
    </div>
  )
}
