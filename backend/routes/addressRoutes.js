import { Router } from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

function formatAddress(row) {
  return {
    id: row.id,
    type: row.type,
    full: row.full_address,
    default: row.is_default,
  }
}

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM user_addresses
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at ASC`,
      [req.user.id]
    )
    res.json(result.rows.map(formatAddress))
  } catch (err) {
    console.error('Get addresses error:', err)
    res.status(500).json({ message: 'Failed to fetch addresses' })
  }
})

router.post('/', authenticate, async (req, res) => {
  try {
    const { type = 'Home', fullAddress, isDefault = false } = req.body

    if (!fullAddress?.trim()) {
      return res.status(400).json({ message: 'Address is required' })
    }

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM user_addresses WHERE user_id = $1',
      [req.user.id]
    )
    const isFirst = parseInt(countResult.rows[0].count) === 0
    const setDefault = isDefault || isFirst

    if (setDefault) {
      await pool.query(
        'UPDATE user_addresses SET is_default = false WHERE user_id = $1',
        [req.user.id]
      )
    }

    const result = await pool.query(
      `INSERT INTO user_addresses (user_id, type, full_address, is_default)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, type, fullAddress.trim(), setDefault]
    )

    res.status(201).json(formatAddress(result.rows[0]))
  } catch (err) {
    console.error('Add address error:', err)
    res.status(500).json({ message: 'Failed to add address' })
  }
})

router.patch('/:id/default', authenticate, async (req, res) => {
  try {
    const { id } = req.params

    const existing = await pool.query(
      'SELECT id FROM user_addresses WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    )
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Address not found' })
    }

    await pool.query(
      'UPDATE user_addresses SET is_default = false WHERE user_id = $1',
      [req.user.id]
    )
    const result = await pool.query(
      'UPDATE user_addresses SET is_default = true WHERE id = $1 RETURNING *',
      [id]
    )

    res.json(formatAddress(result.rows[0]))
  } catch (err) {
    console.error('Set default address error:', err)
    res.status(500).json({ message: 'Failed to update address' })
  }
})

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params

    const existing = await pool.query(
      'SELECT id, is_default FROM user_addresses WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    )
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Address not found' })
    }

    const wasDefault = existing.rows[0].is_default

    await pool.query('DELETE FROM user_addresses WHERE id = $1', [id])

    if (wasDefault) {
      await pool.query(
        `UPDATE user_addresses SET is_default = true
         WHERE id = (
           SELECT id FROM user_addresses WHERE user_id = $1
           ORDER BY created_at ASC LIMIT 1
         )`,
        [req.user.id]
      )
    }

    res.json({ message: 'Address deleted' })
  } catch (err) {
    console.error('Delete address error:', err)
    res.status(500).json({ message: 'Failed to delete address' })
  }
})

export default router
