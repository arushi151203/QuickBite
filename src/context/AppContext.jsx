import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false)
  const [location, setLocation] = useState('Malviya Nagar, Jaipur')
  const [cart, setCart] = useState([])
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [dishFavorites, setDishFavorites] = useState([])
  const [savedAddresses, setSavedAddresses] = useState([
    { label: 'Home', address: 'Malviya Nagar, Jaipur' },
    { label: 'Work', address: 'Vaishali Nagar, Jaipur' },
  ])
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', title: 'Order Delivered!', message: 'Your Butter Chicken from Spice Garden has arrived', time: '2 min ago', read: false },
    { id: 2, type: 'offer', title: '50% OFF today!', message: 'Use code FIRST50. Valid till midnight', time: '1 hr ago', read: false },
    { id: 3, type: 'cashback', title: '₹120 Cashback credited', message: 'From your last Bella Italia order', time: '3 hr ago', read: true },
  ])

  const toggleDark = () => {
    setDarkMode(d => !d)
    document.documentElement.classList.toggle('dark')
  }

  // Mark a single notification as read
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const addToCart = (item, restaurant) => {
    setCart(prev => {
      if (prev.length > 0 && prev[0].restaurantId !== restaurant.id) {
        return prev
      }
      const exists = prev.find(i => i.id === item.id)
      if (exists) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...item, qty: 1, restaurantName: restaurant.name, restaurantId: restaurant.id }]
    })
  }

  const clearCart = () => {
    setCart([])
    setAppliedCoupon(null)
  }

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId))
  }

  const updateQty = (itemId, delta) => {
    setCart(prev => prev
      .map(i => i.id === itemId ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0)
    )
  }

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const toggleDishFavorite = (id) => {
    setDishFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartRestaurantId = cart.length > 0 ? cart[0].restaurantId : null
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <AppContext.Provider value={{
      darkMode, toggleDark,
      location, setLocation,
      cart, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal, cartRestaurantId,
      appliedCoupon, setAppliedCoupon,
      favorites, toggleFavorite,
      dishFavorites, toggleDishFavorite,
      savedAddresses, setSavedAddresses,
      notifications, markAsRead, markAllAsRead, unreadCount,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)