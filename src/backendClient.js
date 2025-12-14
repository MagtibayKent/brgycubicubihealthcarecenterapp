// backendClient.js
// Utility to call backend privileged endpoints

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4242'

export const backendClient = {
  async getClinicStats() {
    const res = await fetch(`${BACKEND_URL}/api/stats/clinic`)
    if (!res.ok) throw new Error('Failed to fetch clinic stats')
    return res.json()
  },

  async health() {
    const res = await fetch(`${BACKEND_URL}/health`)
    if (!res.ok) throw new Error('Backend health check failed')
    return res.json()
  }
}
