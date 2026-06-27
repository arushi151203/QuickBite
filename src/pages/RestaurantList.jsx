import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Star, Clock, Heart, ChevronDown, MapPin } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useRestaurants } from '../hooks/useRestaurants'

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'nearest', label: 'Nearest' },
  { value: 'popular', label: 'Most Popular' },
]

const badgeColors = {
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-primary',
}

export default function RestaurantList() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recommended')
  const [sortOpen, setSortOpen] = useState(false)
  const [pureVeg, setPureVeg] = useState(false)
  const [offersOnly, setOffersOnly] = useState(false)
  const { favorites, toggleFavorite } = useApp()
  const { restaurants, loading, error } = useRestaurants()
  const navigate = useNavigate()

  const categoryParam = searchParams.get('category')

  useEffect(() => {
    if (categoryParam) setSearch('')
  }, [categoryParam])

  let filtered = [...restaurants]

  // Category filter from home page
  if (categoryParam) {
    filtered = filtered.filter(r =>
      r.category.toLowerCase() === categoryParam.toLowerCase() ||
      r.cuisine.toLowerCase().includes(categoryParam.toLowerCase())
    )
  }

  // Search
  if (search) {
    filtered = filtered.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(search.toLowerCase())
    )
  }

  // Chips
  if (pureVeg) filtered = filtered.filter(r => r.isVeg)
  if (offersOnly) filtered = filtered.filter(r => r.offers)

  // Sort
  filtered.sort((a, b) => {
    if (sort === 'rating') return b.rating - a.rating
    if (sort === 'nearest') return parseFloat(a.distance) - parseFloat(b.distance)
    if (sort === 'popular') return b.reviewCount - a.reviewCount
    return 0
  })

  const sortLabel = sortOptions.find(s => s.value === sort)?.label

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <p className="text-red-500 text-center">Failed to load restaurants. Make sure the backend is running.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {categoryParam ? `${categoryParam} Restaurants` : 'Restaurants near you'}
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={13} className="text-orange-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Malviya Nagar, Jaipur · {filtered.length} restaurants available
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-8">

          {/* Search */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 flex-1 min-w-[200px] max-w-sm shadow-sm">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search restaurants..."
              className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(o => !o)}
              className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:border-orange-400 transition-colors"
            >
              Sort: {sortLabel}
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-30">
                {sortOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSort(opt.value); setSortOpen(false) }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      sort === opt.value
                        ? 'text-orange-600 font-semibold bg-orange-50 dark:bg-orange-900/20'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pure Veg Chip */}
          <button
            onClick={() => setPureVeg(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              pureVeg
                ? 'bg-green-500 text-white border-green-500 shadow-md'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-green-400'
            }`}
          >
            <span className="w-3 h-3 rounded-sm border-2 border-current flex items-center justify-center">
              <span className={`w-1.5 h-1.5 rounded-full ${pureVeg ? 'bg-white' : 'bg-green-500'}`} />
            </span>
            Pure Veg
          </button>

          {/* Offers Chip */}
          <button
            onClick={() => setOffersOnly(o => !o)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              offersOnly
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-orange-400'
            }`}
          >
            🏷️ Offers Available
          </button>

          {/* Clear filters */}
          {(pureVeg || offersOnly || categoryParam) && (
            <button
              onClick={() => { setPureVeg(false); setOffersOnly(false); navigate('/restaurants') }}
              className="text-sm text-gray-400 hover:text-orange-600 transition-colors underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No restaurants found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(r => (
              <RestaurantCard
                key={r.id}
                r={r}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RestaurantCard({ r, favorites, toggleFavorite, navigate }) {
  const isFav = favorites.includes(r.id)
  return (
    <div
      onClick={() => navigate(`/restaurant/${r.id}`)}
      className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={r.image}
          alt={r.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
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
          <div className="flex items-center gap-1 flex-shrink-0 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-lg">
            <Star size={11} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-400">{r.rating}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">{r.cuisine}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <Clock size={11} />
               <span>{r.deliveryTime}</span>
          </div>
            <span className="text-gray-300 dark:text-gray-600">•</span>
          <div className="flex items-center gap-1">
            <MapPin size={11} />
              <span>{r.distance}</span>
          </div>
            <span className="text-gray-300 dark:text-gray-600">•</span>
             <span className="font-medium text-gray-700 dark:text-gray-300">
                  ₹{r.startingPrice} for one
             </span>
       </div>
        <p className="text-xs text-gray-400 mt-2.5">{r.reviewCount.toLocaleString()} reviews</p>
      </div>
    </div>
  )
}