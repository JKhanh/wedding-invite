import { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import jwt from 'jsonwebtoken'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret'
const COOKIE_NAME = 'admin-token'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Admin login
    const { password } = req.body

    if (!password || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    // Create JWT token
    const token = jwt.sign(
      { admin: true, iat: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Set HTTP-only cookie
    const cookie = serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
      sameSite: 'strict'
    })

    res.setHeader('Set-Cookie', cookie)
    res.status(200).json({ success: true })

  } else if (req.method === 'DELETE') {
    // Admin logout
    const cookie = serialize(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: -1, // Expire immediately
      path: '/',
      sameSite: 'strict'
    })

    res.setHeader('Set-Cookie', cookie)
    res.status(200).json({ success: true })

  } else if (req.method === 'GET') {
    // Check admin authentication status
    const token = req.cookies[COOKIE_NAME]

    if (!token) {
      return res.status(401).json({ authenticated: false })
    }

    try {
      jwt.verify(token, JWT_SECRET)
      res.status(200).json({ authenticated: true })
    } catch (error) {
      res.status(401).json({ authenticated: false })
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}