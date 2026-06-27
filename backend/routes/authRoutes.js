import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js'
import { findValidToken, consumeAuthToken, createAuthToken } from '../utils/authTokens.js'

const router = Router()
const isDev = process.env.NODE_ENV !== 'production'

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

function formatUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    emailVerified: row.email_verified ?? false,
  }
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, city } = req.body

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, city, email_verified)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id, name, email, phone, city, email_verified`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, phone?.trim() || null, city?.trim() || 'Jaipur']
    )

    const user = result.rows[0]
    const token = await createAuthToken(user.id, 'email_verify', 24)
    const verifyLink = await sendVerificationEmail(user.email, token)

    const response = {
      message: 'Account created! Please check your email to verify before signing in.',
      email: user.email,
    }

    if (isDev && !process.env.SMTP_HOST) {
      response.devLink = verifyLink
    }

    res.status(201).json(response)
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Server error during registration' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const result = await pool.query(
      'SELECT id, name, email, phone, city, password_hash, email_verified FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const row = result.rows[0]
    const valid = await bcrypt.compare(password, row.password_hash)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    if (!row.email_verified) {
      return res.status(403).json({
        message: 'Please verify your email before signing in.',
        needsVerification: true,
        email: row.email,
      })
    }

    const user = formatUser(row)
    const token = signToken(user)

    res.json({ token, user })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error during login' })
  }
})

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' })
    }

    const record = await findValidToken(token, 'email_verify')
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired verification link' })
    }

    const userResult = await pool.query(
      'SELECT email_verified FROM users WHERE id = $1',
      [record.user_id]
    )
    const alreadyVerified = userResult.rows[0]?.email_verified

    if (!alreadyVerified) {
      await pool.query('UPDATE users SET email_verified = true WHERE id = $1', [record.user_id])
    }

    res.json({
      message: alreadyVerified
        ? 'Email already verified! You can sign in.'
        : 'Email verified successfully! You can now sign in.',
    })
  } catch (err) {
    console.error('Verify email error:', err)
    res.status(500).json({ message: 'Server error during verification' })
  }
})

router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body
    if (!email?.trim()) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const result = await pool.query(
      'SELECT id, email, email_verified FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    if (result.rows.length === 0) {
      return res.json({ message: 'If that email is registered, a verification link has been sent.' })
    }

    const user = result.rows[0]
    if (user.email_verified) {
      return res.status(400).json({ message: 'Email is already verified. You can sign in.' })
    }

    const token = await createAuthToken(user.id, 'email_verify', 24)
    const verifyLink = await sendVerificationEmail(user.email, token)

    const response = {
      message: 'Verification email sent. Please check your inbox.',
    }

    if (isDev && !process.env.SMTP_HOST) {
      response.devLink = verifyLink
    }

    res.json(response)
  } catch (err) {
    console.error('Resend verification error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email?.trim()) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const result = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    const response = {
      message: 'If that email is registered, a password reset link has been sent.',
    }

    if (result.rows.length > 0) {
      const user = result.rows[0]
      const token = await createAuthToken(user.id, 'password_reset', 1)
      const resetLink = await sendPasswordResetEmail(user.email, token)

      if (isDev && !process.env.SMTP_HOST) {
        response.devLink = resetLink
      }
    }

    res.json(response)
  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const record = await consumeAuthToken(token, 'password_reset')
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired reset link' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, record.user_id])

    res.json({ message: 'Password reset successfully! You can now sign in.' })
  } catch (err) {
    console.error('Reset password error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, city } = req.body

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' })
    }

    const result = await pool.query(
      `UPDATE users SET name = $1, phone = $2, city = $3
       WHERE id = $4
       RETURNING id, name, email, phone, city, email_verified`,
      [name.trim(), phone?.trim() || null, city?.trim() || 'Jaipur', req.user.id]
    )

    res.json({ user: formatUser(result.rows[0]) })
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ message: 'Failed to update profile' })
  }
})

router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, city, email_verified FROM users WHERE id = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user: formatUser(result.rows[0]) })
  } catch (err) {
    console.error('Me error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
