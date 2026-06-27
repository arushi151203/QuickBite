

import pool from '../config/database.js'
import { generateToken } from './email.js'

export async function createAuthToken(userId, type, expiresHours) {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000)

  await pool.query(
    'DELETE FROM auth_tokens WHERE user_id = $1 AND type = $2',
    [userId, type]
  )

  await pool.query(
    `INSERT INTO auth_tokens (user_id, token, type, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, token, type, expiresAt]
  )

  return token
}

export async function consumeAuthToken(token, type) {
  const result = await pool.query(
    `SELECT at.*, u.email, u.name
     FROM auth_tokens at
     JOIN users u ON u.id = at.user_id
     WHERE at.token = $1 AND at.type = $2 AND at.expires_at > NOW()`,
    [token, type]
  )

  if (result.rows.length === 0) return null

  const row = result.rows[0]
  await pool.query('DELETE FROM auth_tokens WHERE id = $1', [row.id])
  return row
}

export async function findValidToken(token, type) {
  const result = await pool.query(
    `SELECT at.*, u.email, u.name
     FROM auth_tokens at
     JOIN users u ON u.id = at.user_id
     WHERE at.token = $1 AND at.type = $2 AND at.expires_at > NOW()`,
    [token, type]
  )
  return result.rows[0] || null
}
