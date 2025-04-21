// This is a mock Redis client for client-side use
// It uses localStorage instead of actual Redis

export const redis = {
  get: async (key: string) => {
    try {
      const value = localStorage.getItem(`redis-${key}`)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error(`Error getting ${key} from mock Redis:`, error)
      return null
    }
  },

  set: async (key: string, value: any) => {
    try {
      localStorage.setItem(`redis-${key}`, JSON.stringify(value))
      return "OK"
    } catch (error) {
      console.error(`Error setting ${key} in mock Redis:`, error)
      return null
    }
  },
}
