"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Database, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function DatabaseStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/db-status")
        const data = await response.json()

        if (response.ok && data.status === "connected") {
          setStatus("connected")
        } else {
          setStatus("disconnected")
          setError(data.error || "Could not connect to database")
        }
      } catch (err) {
        setStatus("disconnected")
        setError("Failed to check database status")
      }
    }

    checkStatus()

    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Badge
              variant={status === "connected" ? "success" : "destructive"}
              className="flex items-center gap-1 cursor-help"
            >
              <Database className="h-3 w-3" />
              {status === "loading" ? "Checking DB..." : status === "connected" ? "DB Connected" : "DB Disconnected"}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {status === "connected" ? (
            <p>MongoDB connection is active</p>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p>{error || "Database connection issue"}</p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
