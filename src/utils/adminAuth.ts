import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret'
const COOKIE_NAME = 'admin-token'

export function verifyAdminToken(req: NextApiRequest): boolean {
  const token = req.cookies[COOKIE_NAME]

  if (!token) {
    return false
  }

  try {
    jwt.verify(token, JWT_SECRET)
    return true
  } catch (error) {
    return false
  }
}

export function withAdminAuth(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!verifyAdminToken(req)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    return handler(req, res)
  }
}

export function useAdminAuth() {
  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/auth')
      const data = await response.json()
      return data.authenticated
    } catch (error) {
      return false
    }
  }

  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE'
      })
    } catch (error) {
      // Ignore errors on logout
    }
  }

  return { checkAuth, login, logout }
}