// API utility functions for client-side use

// Base API URL
const API_BASE_URL = "/api"

// Generic fetch function with error handling
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "An error occurred")
  }

  return response.json()
}

// Task API functions
export const TaskAPI = {
  // Get all tasks
  getTasks: () => fetchAPI<any[]>("/tasks"),

  // Get a specific task
  getTask: (id: string) => fetchAPI<any>(`/tasks/${id}`),

  // Create a new task
  createTask: (task: { title: string; description?: string }) =>
    fetchAPI<any>("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    }),

  // Update a task
  updateTask: (id: string, updates: any) =>
    fetchAPI<any>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  // Delete a task
  deleteTask: (id: string) =>
    fetchAPI<{ message: string }>(`/tasks/${id}`, {
      method: "DELETE",
    }),
}

// Session API functions
export const SessionAPI = {
  // Get all sessions
  getSessions: () => fetchAPI<any[]>("/sessions"),

  // Create a new session
  createSession: (session: { taskId: string; taskTitle: string; duration: number }) =>
    fetchAPI<any>("/sessions", {
      method: "POST",
      body: JSON.stringify(session),
    }),
}

// Settings API functions
export const SettingsAPI = {
  // Get user settings
  getSettings: () => fetchAPI<any>("/settings"),

  // Update user settings
  updateSettings: (settings: any) =>
    fetchAPI<any>("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),
}

// Timer state API functions
export const TimerStateAPI = {
  // Get timer state
  getTimerState: () => fetchAPI<any>("/timer-state"),

  // Update timer state
  updateTimerState: (state: any) =>
    fetchAPI<any>("/timer-state", {
      method: "PUT",
      body: JSON.stringify(state),
    }),
}

// Auth API functions
export const AuthAPI = {
  // Register a new user
  register: (userData: { name: string; email: string; password: string }) =>
    fetchAPI<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  // Login a user
  login: (credentials: { email: string; password: string }) =>
    fetchAPI<{ user: any; success: boolean }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
}
