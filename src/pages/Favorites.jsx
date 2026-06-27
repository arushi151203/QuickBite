import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Star, Clock, ShoppingBag, Utensils } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useRestaurants } from '../hooks/useRestaurants'

export default function Favorites() {
  const [activeTab, setActiveTab] = useState('restaurants')
  const { favorites, toggleFavorite, dishFavorites, toggleDishFavorite } = useApp()
  const { restaurants, loading, error } = useRestaurants()
  const navigate = useNavigate()

  const allDishes = restaurants.flatMap(r =>
    r.menu.map(item => ({ ...item, restaurantName: r.name, restaurantId: r.id }))
  )

  const favoriteRestaurants = restaurants.filter(r => favorites.includes(r.id))
  const favoriteDishes = allDishes.filter(d => dishFavorites.includes(d.id))

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
        <p className="text-red-500 text-center">Failed to load data. Make sure the backend is running.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Heart size={24} className="fill-red-500 text-red-500" />
            Your Favorites
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Restaurants and dishes you love
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'restaurants'
                ? 'bg-primary text-white shadow-md shadow-orange-200'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-400'
            }`}
          >
            <Utensils size={15} />
            Restaurants
            {favoriteRestaurants.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === 'restaurants' ? 'bg-white/20 text-white' : 'bg-primary/10 text-orange-600'
              }`}>
                {favoriteRestaurants.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('dishes')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'dishes'
                ? 'bg-primary text-white shadow-md shadow-orange-200'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-400'
            }`}
          >
            <ShoppingBag size={15} />
            Favourite Dishes
            {favoriteDishes.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === 'dishes' ? 'bg-white/20 text-white' : 'bg-primary/10 text-orange-600'
              }`}>
                {favoriteDishes.length}
              </span>
            )}
          </button>
        </div>

        {/* ── RESTAURANTS TAB ── */}
        {activeTab === 'restaurants' && (
          <>
            {favoriteRestaurants.length === 0 ? (
              <EmptyState
                icon={<Heart size={40} className="text-gray-300 dark:text-gray-600" />}
                title="No favourite restaurants yet"
                subtitle="Tap the ❤️ on any restaurant to save it here"
                cta="Browse Restaurants"
                onCta={() => navigate('/restaurants')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {favoriteRestaurants.map(r => (
                  <div
                    key={r.id}
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
                        <span className={`absolute top-3 left-3 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          r.badgeColor === 'green' ? 'bg-green-500' :
                          r.badgeColor === 'purple' ? 'bg-purple-500' : 'bg-primary'
                        }`}>
                          {r.badge}
                        </span>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); toggleFavorite(r.id) }}
                        className="absolute top-3 right-3 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                      >
                        <Heart size={15} className="fill-red-500 text-red-500" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{r.name}</h3>
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
                        <span className="font-medium text-gray-700 dark:text-gray-300">₹{r.startingPrice} for one</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2.5">{r.reviewCount.toLocaleString()} reviews</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── DISHES TAB ── */}
        {activeTab === 'dishes' && (
          <>
            {favoriteDishes.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag size={40} className="text-gray-300 dark:text-gray-600" />}
                title="No favourite dishes yet"
                subtitle="Tap the ❤️ on any dish to save it here"
                cta="Explore Restaurants"
                onCta={() => navigate('/restaurants')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteDishes.map(dish => (
                  <div
                    key={dish.id}
                    onClick={() => navigate(`/restaurant/${dish.restaurantId}`)}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${dish.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                            </div>
                            {dish.isBestseller && (
                              <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-full">
                                🔥 Bestseller
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{dish.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{dish.restaurantName}</p>
                        </div>
                        {/* Remove from fav */}
                        <button
                          onClick={e => { e.stopPropagation(); toggleDishFavorite(dish.id) }}
                          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Heart size={15} className="fill-red-500 text-red-500" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 mt-2 mb-1">
                        <Star size={11} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{dish.rating}</span>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">₹{dish.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon, title, subtitle, cta, onCta }) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-6">{subtitle}</p>
      <button
        onClick={onCta}
        className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
      >
        {cta}
      </button>
    </div>
  )
}