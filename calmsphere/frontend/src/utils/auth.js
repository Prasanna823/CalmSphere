// JWT token storage and retrieval helpers

export const getToken = () => {
  return localStorage.getItem('calmsphere_token')
}

export const setToken = (token) => {
  localStorage.setItem('calmsphere_token', token)
}

export const removeToken = () => {
  localStorage.removeItem('calmsphere_token')
}

export const isTokenExpired = (token) => {
  if (!token) return true
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const now = Date.now() / 1000
    return payload.exp < now
  } catch (error) {
    return true
  }
}

export const getUserFromToken = (token) => {
  if (!token || isTokenExpired(token)) return null
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      email: payload.sub,
      name: payload.name
    }
  } catch (error) {
    return null
  }
}
