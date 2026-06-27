import { Router } from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { computeEstimatedDelivery } from '../utils/deliveryTime.js'

const router = Router()

function formatOrderItem(row) {
  return {
    id: row.id,
    menuItemId: row.menu_item_id,
    name: row.name,
    price: row.price,
    quantity: row.quantity,
    image: row.image,
  }
}

function formatOrder(row, items = []) {
  const createdAt = row.created_at
  const year = new Date(createdAt).getFullYear()

  return {
    id: row.id,
    orderNumber: `QB-${year}-${String(row.id).padStart(5, '0')}`,
    restaurantId: row.restaurant_id,
    restaurantName: row.restaurant_name,
    restaurantImage: row.restaurant_image || null,
    deliveryTime: row.delivery_time || null,
    status: row.status,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    gst: row.gst,
    discount: row.discount,
    total: row.total,
    paymentMethod: row.payment_method,
    deliveryAddress: row.delivery_address,
    estimatedDelivery: row.estimated_delivery,
    estimatedMinutes: row.estimated_minutes,
    createdAt,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    items: items.map(formatOrderItem),
  }
}

router.post('/', authenticate, async (req, res) => {
  const client = await pool.connect()

  try {
    const {
      items,
      paymentMethod,
      address,
      subtotal,
      deliveryFee,
      gst,
      discount = 0,
      total,
      restaurantId,
    } = req.body

    if (!items?.length || !restaurantId || !address || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required order details' })
    }

    const restaurantResult = await client.query(
      'SELECT id, name, delivery_time, image FROM restaurants WHERE id = $1',
      [restaurantId]
    )

    if (restaurantResult.rows.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' })
    }

    const restaurant = restaurantResult.rows[0]
    const { estimatedDelivery, estimatedMinutes } = computeEstimatedDelivery(restaurant.delivery_time)

    await client.query('BEGIN')

    const orderResult = await client.query(
      `INSERT INTO orders (
        user_id, restaurant_id, restaurant_name, status,
        subtotal, delivery_fee, gst, discount, total,
        payment_method, delivery_address, estimated_delivery, estimated_minutes
      ) VALUES ($1,$2,$3,'placed',$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        req.user.id,
        restaurantId,
        restaurant.name,
        subtotal,
        deliveryFee,
        gst,
        discount,
        total,
        paymentMethod,
        JSON.stringify(address),
        estimatedDelivery,
        estimatedMinutes,
      ]
    )

    const order = orderResult.rows[0]

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, name, price, quantity, image)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [order.id, item.id, item.name, item.price, item.qty, item.image || null]
      )
    }

    await client.query('COMMIT')

    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1 ORDER BY id',
      [order.id]
    )

    res.status(201).json(formatOrder(
      { ...order, restaurant_image: restaurant.image, delivery_time: restaurant.delivery_time },
      itemsResult.rows
    ))
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Create order error:', err)
    res.status(500).json({ message: 'Failed to place order' })
  } finally {
    client.release()
  }
})

router.get('/', authenticate, async (req, res) => {
  try {
    const ordersResult = await pool.query(
      `SELECT o.*, r.image AS restaurant_image, r.delivery_time
       FROM orders o
       LEFT JOIN restaurants r ON r.id = o.restaurant_id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    )

    const orderIds = ordersResult.rows.map(o => o.id)
    if (orderIds.length === 0) return res.json([])

    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ANY($1) ORDER BY id',
      [orderIds]
    )

    const itemsByOrder = itemsResult.rows.reduce((acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = []
      acc[item.order_id].push(item)
      return acc
    }, {})

    res.json(ordersResult.rows.map(row => formatOrder(row, itemsByOrder[row.id] || [])))
  } catch (err) {
    console.error('List orders error:', err)
    res.status(500).json({ message: 'Failed to fetch orders' })
  }
})

router.get('/:id', authenticate, async (req, res) => {
  try {
    const orderResult = await pool.query(
      `SELECT o.*, r.image AS restaurant_image, r.delivery_time
       FROM orders o
       LEFT JOIN restaurants r ON r.id = o.restaurant_id
       WHERE o.id = $1 AND o.user_id = $2`,
      [req.params.id, req.user.id]
    )

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1 ORDER BY id',
      [req.params.id]
    )

    res.json(formatOrder(orderResult.rows[0], itemsResult.rows))
  } catch (err) {
    console.error('Get order error:', err)
    res.status(500).json({ message: 'Failed to fetch order' })
  }
})

router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body
    const valid = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']
    if (!valid.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, req.params.id, req.user.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.json({ success: true, status })
  } catch (err) {
    console.error('Update status error:', err)
    res.status(500).json({ message: 'Failed to update status' })
  }
})

export default router
