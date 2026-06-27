import { Router } from 'express'
import pool from '../config/database.js'

const router = Router()

function formatMenuItem(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    rating: parseFloat(row.rating),
    isVeg: row.is_veg,
    category: row.category,
    isBestseller: row.is_bestseller,
    isOffer: row.is_offer,
    image: row.image,
  }
}

function formatRestaurant(row, menu = []) {
  return {
    id: row.id,
    name: row.name,
    cuisine: row.cuisine,
    rating: parseFloat(row.rating),
    deliveryTime: row.delivery_time,
    deliveryFee: row.delivery_fee,
    distance: row.distance,
    startingPrice: row.starting_price,
    reviewCount: row.review_count,
    image: row.image,
    badge: row.badge,
    badgeColor: row.badge_color,
    isVeg: row.is_veg,
    isFeatured: row.is_featured,
    isTrending: row.is_trending,
    offers: row.offers,
    category: row.category,
    menu,
  }
}

router.get('/', async (req, res) => {
  try {
    const restaurantsResult = await pool.query('SELECT * FROM restaurants ORDER BY id')
    const menuResult = await pool.query('SELECT * FROM menu_items ORDER BY id')

    const menuByRestaurant = menuResult.rows.reduce((acc, item) => {
      if (!acc[item.restaurant_id]) acc[item.restaurant_id] = []
      acc[item.restaurant_id].push(formatMenuItem(item))
      return acc
    }, {})

    const restaurants = restaurantsResult.rows.map(row =>
      formatRestaurant(row, menuByRestaurant[row.id] || [])
    )

    res.json(restaurants)
  } catch (err) {
    console.error('Restaurants list error:', err)
    res.status(500).json({ message: 'Failed to fetch restaurants' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const restaurantResult = await pool.query('SELECT * FROM restaurants WHERE id = $1', [id])

    if (restaurantResult.rows.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' })
    }

    const menuResult = await pool.query(
      'SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY id',
      [id]
    )

    res.json(formatRestaurant(
      restaurantResult.rows[0],
      menuResult.rows.map(formatMenuItem)
    ))
  } catch (err) {
    console.error('Restaurant detail error:', err)
    res.status(500).json({ message: 'Failed to fetch restaurant' })
  }
})

export default router
