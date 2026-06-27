import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  MapPin, ChevronDown, Search, Navigation, Clock,
  Bell, ShoppingCart, User, Moon, Sun, Check,
  Package, Tag, Wallet, Heart, Settings, LogOut, X
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const {
    darkMode, toggleDark,
    location: userLocation, setLocation,
    cartCount, unreadCount, notifications,
    markAsRead, markAllAsRead,
  } = useApp()
  const { user, logout } = useAuth()

  const [locationOpen, setLocationOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')

  // 2 default recent searches pre-filled, new ones added on top when user selects
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('qb_recent_locations') || '[]')
      // If localStorage is empty (first visit), show 2 default recents
      if (stored.length === 0) {
        return ['C-Scheme, Jaipur', 'Mansarovar, Jaipur']
      }
      return stored
    } catch {
      return ['C-Scheme, Jaipur', 'Mansarovar, Jaipur']
    }
  })

  const navigate = useNavigate()
  const currentPath = useLocation()
  const locationRef = useRef()
  const notifRef = useRef()
  const profileRef = useRef()

  useEffect(() => {
    function handleClick(e) {
      if (locationRef.current && !locationRef.current.contains(e.target)) setLocationOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Select a location → save to recents, max 5
  const selectLocation = (address) => {
    setLocation(address)
    setLocationOpen(false)
    setLocationSearch('')
    setRecentSearches(prev => {
      const updated = [address, ...prev.filter(r => r !== address)].slice(0, 5)
      localStorage.setItem('qb_recent_locations', JSON.stringify(updated))
      return updated
    })
  }

  // Remove one recent entry on X click
  const removeRecent = (e, address) => {
    e.stopPropagation()
    setRecentSearches(prev => {
      const updated = prev.filter(r => r !== address)
      localStorage.setItem('qb_recent_locations', JSON.stringify(updated))
      return updated
    })
  }

  const notifIcon = (type) => {
    if (type === 'success') return <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"><Check size={16} className="text-green-600" /></div>
    if (type === 'offer') return <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0"><Tag size={16} className="text-orange-600" /></div>
    if (type === 'cashback') return <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0"><Wallet size={16} className="text-purple-600" /></div>
  }

  const query = locationSearch.toLowerCase()
  const filteredRecent = recentSearches.filter(r => r.toLowerCase().includes(query))

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white text-lg font-bold">Q</div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Quick<span className="text-orange-600">Bite</span>
            </span>
          </Link>

          {/* Location Selector */}
          <div className="relative flex-shrink-0" ref={locationRef}>
            <button
              onClick={() => { setLocationOpen(o => !o); setNotifOpen(false); setProfileOpen(false) }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <MapPin size={16} className="text-orange-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[140px] truncate">
                {userLocation}
              </span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
            </button>

            {locationOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">

                {/* Search Bar */}
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                    <Search size={15} className="text-gray-400 flex-shrink-0" />
                    <input
                      autoFocus
                      value={locationSearch}
                      onChange={e => setLocationSearch(e.target.value)}
                      placeholder="Search location..."
                      className="bg-transparent text-sm outline-none w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
                    />
                    {locationSearch && (
                      <button onClick={() => setLocationSearch('')}>
                        <X size={14} className="text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto">

                  {/* Detect Current Location */}
                  <button
                    onClick={() => selectLocation('Current Location')}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                      <Navigation size={15} className="text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-orange-600">Detect Current Location</p>
                      <p className="text-[11px] text-gray-400">Using GPS</p>
                    </div>
                  </button>

                  {/* Recent Searches */}
                  {filteredRecent.length > 0 && (
                    <div className="px-4 pt-3 pb-2">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Searches</p>
                      {filteredRecent.map((recent, i) => {
                        const isActive = userLocation === recent
                        return (
                          <button
                            key={i}
                            onClick={() => selectLocation(recent)}
                            className="w-full flex items-center gap-3 py-2.5 hover:text-orange-600 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                              <Clock size={14} className={isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-orange-600'} />
                            </div>
                            <span className={`flex-1 text-left text-sm ${isActive ? 'text-orange-600 font-medium' : 'text-gray-600 dark:text-gray-300 group-hover:text-orange-600'}`}>
                              {recent}
                            </span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isActive && <Check size={14} className="text-orange-600" />}
                              <button
                                onClick={(e) => removeRecent(e, recent)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              >
                                <X size={12} className="text-gray-400" />
                              </button>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Empty state when search has no results */}
                  {locationSearch && filteredRecent.length === 0 && (
                    <div className="px-4 py-6 text-center">
                      <MapPin size={24} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No matching locations found</p>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentPath.pathname === '/'
                  ? 'text-white bg-primary'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Home
            </Link>
            <Link
              to="/restaurants"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentPath.pathname === '/restaurants' || currentPath.pathname.startsWith('/restaurant/')
                  ? 'text-white bg-primary'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Restaurants
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* Dark Mode */}
            <button
              onClick={toggleDark}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(o => !o); setLocationOpen(false); setProfileOpen(false) }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-orange-600 font-medium hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* List — scrolls when more than ~4 notifications */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell size={24} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                            !n.read ? 'bg-orange-50/50 dark:bg-gray-800/50' : ''
                          }`}
                        >
                          {notifIcon(n.type)}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                            <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                          </div>
                          {!n.read && <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer hint */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 text-center">
                      <p className="text-xs text-gray-400">Click a notification to mark it as read</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(o => !o); setLocationOpen(false); setNotifOpen(false) }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <User size={18} />
              </button>

              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                  {user && (
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  )}
                  {[
                    { icon: User, label: 'My Profile', to: '/profile' },
                    { icon: Package, label: 'My Orders', to: '/orders' },
                    { icon: Heart, label: 'Favorites', to: '/favorites' },
                    { icon: Settings, label: 'Settings', to: '/settings' },
                  ].map(item => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <item.icon size={15} className="text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{item.label}</span>
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => { logout(); navigate('/login'); setProfileOpen(false) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <LogOut size={15} className="text-red-500" />
                      <span className="text-sm text-red-500 font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors ml-1"
            >
              <ShoppingCart size={16} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bg-white text-orange-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </nav>
  )
}