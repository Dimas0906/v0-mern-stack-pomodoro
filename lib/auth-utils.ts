// Cookie management functions
export const authCookies = {
  // Set auth cookie
  set: (userData: any) => {
    document.cookie = `pomodoro-auth=true; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
  },

  // Remove auth cookie
  remove: () => {
    document.cookie = "pomodoro-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  },

  // Check if auth cookie exists
  exists: (): boolean => {
    return document.cookie.split(";").some((item) => item.trim().startsWith("pomodoro-auth="))
  },
}

// Local storage management functions
export const authStorage = {
  // Set user data in local storage
  setUser: (userData: any) => {
    localStorage.setItem("pomodoro-user", JSON.stringify(userData))
  },

  // Get user data from local storage
  getUser: () => {
    try {
      const userData = localStorage.getItem("pomodoro-user")
      return userData ? JSON.parse(userData) : null
    } catch (e) {
      console.error("Error parsing user data from localStorage:", e)
      return null
    }
  },

  // Remove user data from local storage
  removeUser: () => {
    localStorage.removeItem("pomodoro-user")
  },
}
