import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Star, Clock, MapPin, Heart,
  Search, Plus, Minus, ShoppingCart, X, ChevronRight
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useRestaurant } from './useRestaurants'

const menuSections = ['Starters', 'Main Course', 'Desserts', 'Beverages']

export default function RestaurantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { favorites, toggleFavorite, cart, addToCart, updateQty, cartTotal, cartCount, dishFavorites, toggleDishFavorite, cartRestaurantId, clearCart} = useApp()

  const { restaurant, loading, error } = useRestaurant(id)
  
  useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
}, [])  

  const [search, setSearch] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  const [nonVegOnly, setNonVegOnly] = useState(false)
  const [offersOnly, setOffersOnly] = useState(false)
  const [bestseller, setBestseller] = useState(false)
 const [activeSection, setActiveSection] = useState('Best Sellers')
const [conflictItem, setConflictItem] = useState(null)

  const sectionRefs = useRef({})

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4">
        <p className="text-red-500 text-center">Failed to load restaurant. Make sure the backend is running.</p>
      </div>
    )
  }

  if (!restaurant) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">🍽️</p>
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">Restaurant not found</p>
        <button onClick={() => navigate('/restaurants')} className="mt-4 text-orange-600 hover:underline text-sm">
          ← Back to restaurants
        </button>
      </div>
    </div>
  )

  const isFav = favorites.includes(restaurant.id)

  // Group menu by category
  const groupedMenu = {
    'Best Sellers': restaurant.menu.filter((_, i) => i < 2),
    'Starters': restaurant.menu.filter(item => item.category === 'Starters'),
    'Main Course': restaurant.menu.filter(item => item.category === 'Main Course'),
    'Desserts': restaurant.menu.filter(item => item.category === 'Desserts'),
    'Beverages': restaurant.menu.filter(item => item.category === 'Beverages'),
  }

  // Filter menu items
  const filterItem = (item) => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) &&
      !item.description.toLowerCase().includes(search.toLowerCase())) return false
    if (vegOnly && !item.isVeg) return false
    if (nonVegOnly && item.isVeg) return false
    if (offersOnly && !item.isOffer) return false
    if (bestseller && !item.isBestseller) return false
    return true
  }
  
  const handleAddToCart = (item) => {
  if (cart.length > 0 && cartRestaurantId !== restaurant.id) {
    setConflictItem(item)
    return
  }
  addToCart(item, restaurant)
 }

  const scrollToSection = (section) => {
    setActiveSection(section)
    const el = sectionRefs.current[section]
    if (el) {
      const offset = 200
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const getItemQty = (itemId) => {
    const item = cart.find(i => i.id === itemId)
    return item ? item.qty : 0
  }

  const restaurantCartItems = cart.filter(i => i.restaurantId === restaurant.id)
  const restaurantCartTotal = restaurantCartItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  const restaurantCartCount = restaurantCartItems.reduce((sum, i) => sum + i.qty, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Hero Banner */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-700 dark:text-gray-200" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{restaurant.name}</h1>
            <p className="text-white/80 text-sm">{restaurant.cuisine}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                <Star size={13} className="fill-yellow-400 text-yellow-400" />
                <span className="text-white text-xs font-semibold">{restaurant.rating}</span>
                <span className="text-white/70 text-xs">({restaurant.reviewCount.toLocaleString()})</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                <Clock size={13} className="text-white/80" />
                <span className="text-white text-xs">{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                <MapPin size={13} className="text-white/80" />
                <span className="text-white text-xs">{restaurant.distance}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => toggleFavorite(restaurant.id)}
            className="w-10 h-10 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <Heart size={18} className={isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8">

          {/* ── LEFT: Menu Sidebar (Desktop) ── */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
              <p className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm border-b border-gray-100 dark:border-gray-800">Menu</p>
              {menuSections.map(section => {
                const items = groupedMenu[section] || []
                if (items.length === 0) return null
                return (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className={`w-full text-left px-4 py-3 text-sm transition-all border-l-2 ${
                      activeSection === section
                        ? 'text-orange-600 font-semibold border-primary bg-orange-50 dark:bg-orange-900/20'
                        : 'text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {section}
                    <span className="ml-1 text-xs text-gray-400">({items.length})</span>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* ── CENTER: Menu Content ── */}
          <div className="flex-1 min-w-0">

            {/* Search + Filter chips */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-6 shadow-sm">
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5 mb-3">
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search dishes..."
                  className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full"
                />
                {search && (
                  <button onClick={() => setSearch('')}>
                    <X size={14} className="text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Filter chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <FilterChip
                  label="Veg"
                  active={vegOnly}
                  onClick={() => { setVegOnly(v => !v); setNonVegOnly(false) }}
                  color="green"
                  dot
                />
                <FilterChip
                  label="Non-Veg"
                  active={nonVegOnly}
                  onClick={() => { setNonVegOnly(v => !v); setVegOnly(false) }}
                  color="red"
                  dot
                />
                <FilterChip
                  label="🏷️ Offers"
                  active={offersOnly}
                  onClick={() => setOffersOnly(v => !v)}
                  color="orange"
                />
                <FilterChip
                  label="🔥 Bestseller"
                  active={bestseller}
                  onClick={() => setBestseller(v => !v)}
                  color="orange"
                />
              </div>
            </div>

            {/* Mobile Menu Nav */}
            <div className="lg:hidden overflow-x-auto mb-6">
              <div className="flex gap-2 pb-1">
                {menuSections.map(section => {
                  const items = groupedMenu[section] || []
                  if (items.length === 0) return null
                  return (
                    <button
                      key={section}
                      onClick={() => scrollToSection(section)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        activeSection === section
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {section}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Menu Sections */}
            {menuSections.map(section => {
              const items = (groupedMenu[section] || []).filter(filterItem)
              if (items.length === 0) return null
              return (
                <div
                  key={section}
                  ref={el => sectionRefs.current[section] = el}
                  className="mb-8"
                >
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    {section}
                    <span className="text-sm font-normal text-gray-400">({items.length} items)</span>
                  </h2>
                  <div className="space-y-3">
                    {items.map(item => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        qty={getItemQty(item.id)}
                        onAdd={() => handleAddToCart(item)}
                        onInc={() => updateQty(item.id, 1)}
                        onDec={() => updateQty(item.id, -1)}
                         isFavDish={dishFavorites.includes(item.id)}
                         onToggleFavDish={() => toggleDishFavorite(item.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── RIGHT: Sticky Cart (Desktop) ── */}
          {restaurantCartCount > 0 && (
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="bg-primary/10 dark:bg-orange-900/20 px-4 py-3 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800">
                  <ShoppingCart size={16} className="text-orange-600" />
                  <span className="text-sm font-semibold text-orange-600">
                    {restaurantCartCount} items added
                  </span>
                  <span className="text-xs text-gray-500 ml-1">from {restaurant.name}</span>
                </div>
                <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                  {restaurantCartItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                        {item.name} ×{item.qty}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">
                        ₹{item.price * item.qty}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{restaurantCartTotal}</span>
                </div>
                <div className="px-4 pb-4">
                  <button
                    onClick={() => navigate('/cart')}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    View Cart & Checkout
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Conflict Modal */}
      {conflictItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
              Start a new cart?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Your cart has items from{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {cart[0]?.restaurantName}
              </span>. Adding this will clear your current cart.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConflictItem(null)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300"
              >
                Keep Current
              </button>
              <button
                onClick={() => {
                  clearCart()
                  addToCart(conflictItem, restaurant)
                  setConflictItem(null)
                }}
                className="flex-1 py-3 rounded-2xl bg-primary text-white text-sm font-semibold"
              >
                Yes, Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Cart Bar */}
      {restaurantCartCount > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg">
          <button
            onClick={() => navigate('/cart')}
            className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-between px-5"
          >
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{restaurantCartCount} items</span>
            <span>View Cart & Checkout</span>
            <span className="font-bold">₹{restaurantCartTotal}</span>
          </button>
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, active, onClick, color, dot }) {
  const colors = {
    green: active ? 'bg-green-500 text-white border-green-500' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-green-400',
    red: active ? 'bg-red-500 text-white border-red-500' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-red-400',
    orange: active ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-orange-400',
  }
  const dotColors = { green: 'bg-green-500', red: 'bg-red-500'  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${colors[color]}`}
    >
      {dot && <span className={`w-2 h-2 rounded-full ${active ? 'bg-white' : dotColors[color]}`} />}
      {label}
    </button>
  )
}

function MenuItemCard({ item, qty, onAdd, onInc, onDec, isFavDish, onToggleFavDish }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex gap-4 hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">

        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
            <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${item.isVeg ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {item.isVeg ? 'Veg' : 'Non-Veg'}
          </span>
          {item.isBestseller && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">
              🔥 Bestseller
            </span>
          )}
          {item.isOffer && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              🏷️ Offer
            </span>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <Star size={11} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-500">{item.rating}</span>
          </div>
        </div>

        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{item.name}</h3>
          {/* Heart button */}
          <button
            onClick={onToggleFavDish}
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Heart
              size={15}
              className={isFavDish ? 'fill-red-500 text-red-500' : 'text-gray-300 dark:text-gray-600'}
            />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-2">{item.description}</p>
        <p className="font-bold text-gray-900 dark:text-white">₹{item.price}</p>
      </div>

      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <div className="w-24 h-20 rounded-xl overflow-hidden">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        </div>
        {qty === 0 ? (
          <button
            onClick={onAdd}
            className="w-24 bg-primary hover:bg-primary-dark text-white text-xs font-semibold py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1"
          >
            <Plus size={13} /> Add
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-primary rounded-xl px-2 py-1.5 w-24 justify-between">
            <button onClick={onDec} className="text-white hover:scale-110 transition-transform">
              <Minus size={13} />
            </button>
            <span className="text-white text-sm font-bold">{qty}</span>
            <button onClick={onInc} className="text-white hover:scale-110 transition-transform">
              <Plus size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}