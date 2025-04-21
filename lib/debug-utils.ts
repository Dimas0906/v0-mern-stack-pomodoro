// Debug utility functions

// Safe JSON stringify that handles circular references
export function safeStringify(obj: any, indent = 2): string {
  const cache = new Set()
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (cache.has(value)) {
          return "[Circular]"
        }
        cache.add(value)
      }
      return value
    },
    indent,
  )
}

// Log authentication events with timestamp
export function logAuthEvent(event: string, data?: any): void {
  const timestamp = new Date().toISOString()
  console.log(`[AUTH ${timestamp}] ${event}`)
  if (data) {
    console.log(safeStringify(data))
  }
}

// Check if localStorage is available and working
export function checkLocalStorage(): boolean {
  try {
    localStorage.setItem("test", "test")
    localStorage.removeItem("test")
    return true
  } catch (e) {
    console.error("localStorage is not available:", e)
    return false
  }
}

// Debug helper to check user authentication state
export function debugAuthState(): void {
  try {
    const user = localStorage.getItem("pomodoro-user")
    console.log("[DEBUG] Auth State Check:")
    console.log("User in localStorage:", user ? JSON.parse(user) : "Not found")
  } catch (e) {
    console.error("Error checking auth state:", e)
  }
}
