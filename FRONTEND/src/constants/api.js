export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1800/api'

export const getErrorMessage = async (response) => {
  try {
    const data = await response.json()
    return data.message || data.error || 'Request failed'
  } catch {
    return 'Request failed'
  }
}

export const getNetworkErrorMessage = (error) => {
  if (error instanceof TypeError) {
    return `Cannot reach backend API at ${API_URL}. Start the backend server and try again.`
  }

  return error.message || 'Request failed'
}
