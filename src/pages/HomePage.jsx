import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Star, Clock, MapPin, Heart,
  ChevronRight, Zap, Tag, Gift
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useRestaurants } from '../hooks/useRestaurants'

const categories = [
  { name: 'Pizza', emoji: '🍕', bg: 'bg-red-50', filter: 'Italian' },
  { name: 'Burgers', emoji: '🍔', bg: 'bg-yellow-50', filter: 'American' },
  { name: 'Indian', emoji: '🍛', bg: 'bg-orange-50', filter: 'Indian' },
  { name: 'Chinese', emoji: '🥡', bg: 'bg-pink-50', filter: 'Chinese' },
  { name: 'Desserts', emoji: '🍰', bg: 'bg-purple-50', filter: 'Desserts' },
  { name: 'Beverages', emoji: '☕', bg: 'bg-blue-50', filter: 'Beverages' },
  { name: 'Sushi', emoji: '🍱', bg: 'bg-green-50', filter: 'Japanese' },
  { name: 'Healthy', emoji: '🥗', bg: 'bg-teal-50', filter: 'Healthy' },
]

const aiRecommendations = [
  { id: 101, name: 'Butter Chicken', restaurant: 'Spice Garden', restaurantId: 1, price: 329, match: 96, reason: 'You love Indian curries', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80' },
  { id: 302, name: 'Pepperoni Feast', restaurant: 'Bella Italia', restaurantId: 3, price: 449, match: 95, reason: 'Top pick in your area', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80' },
  { id: 501, name: 'Classic Smash Burger', restaurant: 'Burger Republic', restaurantId: 5, price: 299, match: 82, reason: 'Trending near you', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80' },
  { id: 201, name: 'Chocolate Lava Cake', restaurant: 'The Sweet Spot', restaurantId: 2, price: 199, match: 91, reason: 'Based on past orders', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80' },
]

const badgeColors = {
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-primary',
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const { favorites, toggleFavorite } = useApp()
  const { restaurants, loading, error } = useRestaurants()
  const navigate = useNavigate()

  const featured = restaurants.filter(r => r.isFeatured)

  // Search filter
  const searchResults = searchQuery.trim()
    ? restaurants.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const handleCategoryClick = (filter) => {
    navigate(`/restaurants?category=${filter}`)
  }

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
        <p className="text-red-500 text-center">Failed to load restaurants. Make sure the backend is running.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── HERO ── */}
      <section className="relative h-[520px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80"
          alt="hero food"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />

        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-24">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3">
            Order food that<br />
            <span className="text-orange-600">makes you smile</span>
          </h1>
          <p className="text-white/80 text-base sm:text-lg mb-8 max-w-lg">
            From local favourites to trending restaurants —<br className="hidden sm:block" />
            delivered fresh in 30 minutes.
          </p>

          {/* Search Bar with dropdown results */}
          <div className="relative max-w-xl">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 shadow-2xl">
              <Search size={20} className="text-gray-400 flex-shrink-0" />
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowResults(true) }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 150)}
                onKeyDown={e => e.key === 'Enter' && navigate('/restaurants')}
                placeholder="Search restaurants or dishes..."
                className="flex-1 outline-none text-gray-700 dark:text-gray-200 dark:bg-transparent text-sm sm:text-base placeholder-gray-400"
              />
              <button
                onClick={() => navigate('/restaurants')}
                className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors flex-shrink-0"
              >
                Search
              </button>
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                  {searchResults.length} restaurant{searchResults.length > 1 ? 's' : ''} found
                </p>
                {searchResults.map(r => (
                  <button
                    key={r.id}
                    onMouseDown={() => navigate(`/restaurant/${r.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <img src={r.image} alt={r.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{r.cuisine}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star size={11} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{r.rating}</span>
                    </div>
                  </button>
                ))}
                <button
                  onMouseDown={() => navigate('/restaurants')}
                  className="w-full px-4 py-3 text-sm text-orange-600 font-medium hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors border-t border-gray-100 dark:border-gray-700 text-center"
                >
                  See all restaurants →
                </button>
              </div>
            )}

            {/* No results */}
            {showResults && searchQuery.trim() && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 text-center z-50">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">No restaurants found</p>
                <p className="text-xs text-gray-400 mt-1">Try a different name or cuisine</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6">
            {[['500+', 'Restaurants'], ['30 min', 'Avg Delivery'], ['4.8★', 'App Rating']].map(([val, label]) => (
              <div key={label}>
                <p className="text-white font-bold text-lg leading-none">{val}</p>
                <p className="text-white/60 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

        {/* ── FEATURED RESTAURANTS ── */}
        <section>
          <SectionHeader
            title="Featured Restaurants"
            subtitle="Handpicked by our food editors"
            link="/restaurants"
            linkText="View all"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map(r => (
              <RestaurantCard
                key={r.id}
                r={r}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                navigate={navigate}
              />
            ))}
          </div>
        </section>

        {/* ── AI RECOMMENDATIONS (Dishes) ── */}
        <section>
          <SectionHeader
            title="Recommended For You"
            subtitle="Dishes personalized based on your taste profile"
            link="/restaurants"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {aiRecommendations.map(item => (
              <div
                key={item.id}
                onClick={() => navigate(`/restaurant/${item.restaurantId}`)}
                className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">by {item.restaurant}</p>
                  <p className="text-[11px] text-orange-600 flex items-center gap-1 mt-1.5">
                    <Zap size={9} /> {item.reason}
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm mt-1">₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── POPULAR CATEGORIES ── */}
        <section>
          <SectionHeader title="What are you craving?" subtitle="Tap a category to explore restaurants" />
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.filter)}
                className={`${cat.bg} dark:bg-gray-800 rounded-2xl p-3 flex flex-col items-center gap-2 hover:scale-105 transition-transform`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── TODAY'S DEALS ── */}
        <section>
          <SectionHeader title="Today's Deals 🏷️" subtitle="Limited time offers just for you" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Tag size={22} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-xl">50% OFF</p>
                <p className="text-white/80 text-sm">First 3 orders</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap size={22} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-xl">Free Delivery</p>
                <p className="text-white/80 text-sm">Orders above ₹299</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Gift size={22} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-xl">Surprise Box</p>
                <p className="text-white/80 text-sm">Chef picks daily</p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-white mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">Q</div>
                <span className="text-lg font-bold">Quick<span className="text-orange-600">Bite</span></span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">Delivering happiness to your doorstep. Fresh food, fast delivery, every time.</p>
            </div>
            <div>
              <p className="font-semibold mb-3 text-sm">Company</p>
              {['About Us', 'Careers', 'Press', 'Blog'].map(l => (
                <p key={l} className="text-gray-400 text-sm mb-2 hover:text-white cursor-pointer transition-colors">{l}</p>
              ))}
            </div>
            <div>
              <p className="font-semibold mb-3 text-sm">For You</p>
              {['Restaurants', 'My Cart', 'Track Order', 'Offers & Deals'].map(l => (
                <p key={l} className="text-gray-400 text-sm mb-2 hover:text-white cursor-pointer transition-colors">{l}</p>
              ))}
            </div>
            <div>
              <p className="font-semibold mb-3 text-sm">Contact</p>
              <p className="text-gray-400 text-sm mb-2">📞 1800-123-4567</p>
              <p className="text-gray-400 text-sm mb-2">✉️ support@quickbite.in</p>
              <p className="text-gray-400 text-sm">📍 Malviya Nagar, Jaipur 302017</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-500 text-xs">© 2026 QuickBite Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex gap-4">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                <span key={l} className="text-gray-500 text-xs hover:text-white cursor-pointer transition-colors">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
function SectionHeader({ title, subtitle, link, linkText = 'See all' }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {link && (
        <button onClick={() => navigate(link)} className="flex items-center gap-1 text-orange-600 text-sm font-medium hover:underline">
          {linkText} <ChevronRight size={15} />
        </button>
      )}
    </div>
  )
}

function RestaurantCard({ r, favorites, toggleFavorite, navigate }) {
  const isFav = favorites.includes(r.id)
  const badgeColors = {
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-primary',
  }
  return (
    <div
      onClick={() => navigate(`/restaurant/${r.id}`)}
      className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="relative h-44 overflow-hidden">
        <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {r.badge && (
          <span className={`absolute top-3 left-3 ${badgeColors[r.badgeColor] || 'bg-primary'} text-white text-[11px] font-semibold px-2.5 py-1 rounded-full`}>
            {r.badge}
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation(); toggleFavorite(r.id) }}
          className="absolute top-3 right-3 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart size={15} className={isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{r.name}</h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-green-600">{r.rating}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">{r.cuisine}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock size={11} />
            <span>{r.deliveryTime}</span>
          </div>
          <span className="text-gray-300">•</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">₹{r.startingPrice} for one</span>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400">{r.reviewCount.toLocaleString()} reviews</p>
        </div>
      </div>
    </div>
  )
}