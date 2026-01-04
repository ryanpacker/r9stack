// Types for authentication

export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  profilePictureUrl: string | null
}

export interface SessionData {
  user?: User
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
}
