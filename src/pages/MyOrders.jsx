import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Clock, ChevronRight, RotateCcw } from 'lucide-react'
import { api } from '../services/api'

const statusStyles = {
  placed: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  confirmed: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  preparing: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  out_for_delivery: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

const statusLabels = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function formatOrderDate(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return `Today, ${time}`
  if (isYesterday) return `Yesterday, ${time}`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + `, ${time}`
}

export default function MyOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getOrders()
      .then(setOrders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">My Orders</h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={36} className="text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">No orders yet</h3>
            <p className="text-sm text-gray-400 mb-6">Your order history will appear here</p>
            <button
              onClick={() => navigate('/restaurants')}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Order Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const itemNames = order.items.map(i => i.name)
              const isActive = ['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status)
              const isDelivered = order.status === 'delivered'
              const isCancelled = order.status === 'cancelled'

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 p-4">
                    <img
                      src={order.restaurantImage || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=80'}
                      alt={order.restaurantName}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{order.restaurantName}</h3>
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusStyles[order.status] || statusStyles.placed}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                        {itemNames.join(', ')}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock size={11} />
                          <span>{formatOrderDate(order.createdAt)}</span>
                        </div>
                        <span>•</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">₹{order.total}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                    <p className="text-xs text-gray-400">{order.orderNumber}</p>
                    <div className="flex items-center gap-3">
                      {isActive && (
                        <button
                          onClick={() => navigate(`/track-order/${order.id}`)}
                          className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                        >
                          Track Order
                          <ChevronRight size={12} />
                        </button>
                      )}
                      {(isDelivered || isCancelled) && (
                        <button
                          onClick={() => navigate(`/restaurant/${order.restaurantId}`)}
                          className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                        >
                          <RotateCcw size={12} />
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}