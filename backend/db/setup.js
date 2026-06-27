import bcrypt from 'bcryptjs'
import pool from '../config/database.js'
import restaurants from '../../src/data/restaurants.js'

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  city VARCHAR(100) DEFAULT 'Jaipur',
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);

CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cuisine VARCHAR(255),
  rating DECIMAL(2,1),
  delivery_time VARCHAR(50),
  delivery_fee INTEGER DEFAULT 0,
  distance VARCHAR(50),
  starting_price INTEGER,
  review_count INTEGER,
  image TEXT,
  badge VARCHAR(100),
  badge_color VARCHAR(50),
  is_veg BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  offers BOOLEAN DEFAULT false,
  category VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  rating DECIMAL(2,1),
  is_veg BOOLEAN DEFAULT false,
  category VARCHAR(100),
  is_bestseller BOOLEAN DEFAULT false,
  is_offer BOOLEAN DEFAULT false,
  image TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES restaurants(id),
  restaurant_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'placed',
  subtotal INTEGER NOT NULL,
  delivery_fee INTEGER DEFAULT 0,
  gst INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  payment_method VARCHAR(50),
  delivery_address JSONB,
  estimated_delivery TIMESTAMPTZ,
  estimated_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER,
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  image TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

CREATE TABLE IF NOT EXISTS user_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'Home',
  full_address TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
`

async function setup() {
  try {
    console.log('Creating tables...')
    await pool.query(schema)

    // Migrate existing databases
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
    `)
    await pool.query(`
      UPDATE users SET email_verified = true WHERE email = 'demo@quickbite.com';
    `)

    const userCount = await pool.query('SELECT COUNT(*) FROM users')
    if (parseInt(userCount.rows[0].count) === 0) {
      console.log('Seeding demo user...')
      const hash = await bcrypt.hash('password123', 10)
      await pool.query(
        `INSERT INTO users (name, email, password_hash, phone, city, email_verified)
         VALUES ($1, $2, $3, $4, $5, true)`,
        ['Demo User', 'demo@quickbite.com', hash, '9876543210', 'Jaipur']
      )
      console.log('Demo user: demo@quickbite.com / password123')
    }

    const restaurantCount = await pool.query('SELECT COUNT(*) FROM restaurants')
    if (parseInt(restaurantCount.rows[0].count) === 0) {
      console.log('Seeding restaurants and menus...')

      for (const r of restaurants) {
        await pool.query(
          `INSERT INTO restaurants (
            id, name, cuisine, rating, delivery_time, delivery_fee, distance,
            starting_price, review_count, image, badge, badge_color,
            is_veg, is_featured, is_trending, offers, category
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
          [
            r.id, r.name, r.cuisine, r.rating, r.deliveryTime, r.deliveryFee,
            r.distance, r.startingPrice, r.reviewCount, r.image, r.badge,
            r.badgeColor, r.isVeg, r.isFeatured, r.isTrending, r.offers, r.category,
          ]
        )

        for (const item of r.menu) {
          await pool.query(
            `INSERT INTO menu_items (
              id, restaurant_id, name, description, price, rating,
              is_veg, category, is_bestseller, is_offer, image
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
            [
              item.id, r.id, item.name, item.description, item.price, item.rating,
              item.isVeg, item.category, item.isBestseller, item.isOffer, item.image,
            ]
          )
        }
      }

      console.log(`Seeded ${restaurants.length} restaurants`)
    } else {
      console.log('Database already seeded, skipping restaurant data')
    }

    const demoUser = await pool.query(`SELECT id FROM users WHERE email = 'demo@quickbite.com'`)
    if (demoUser.rows.length > 0) {
      const addrCount = await pool.query(
        'SELECT COUNT(*) FROM user_addresses WHERE user_id = $1',
        [demoUser.rows[0].id]
      )
      if (parseInt(addrCount.rows[0].count) === 0) {
        console.log('Seeding demo user addresses...')
        await pool.query(
          `INSERT INTO user_addresses (user_id, type, full_address, is_default) VALUES
           ($1, 'Home', '42, 4th Cross, 5th Block, Malviya Nagar, Jaipur 302017', true),
           ($1, 'Work', 'B-12, Vaishali Nagar, Near Metro Station, Jaipur 302021', false)`,
          [demoUser.rows[0].id]
        )
      }
    }

    console.log('Database setup complete!')
  } catch (err) {
    console.error('Setup failed:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

setup()
