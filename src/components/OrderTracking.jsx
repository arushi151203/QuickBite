import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CheckCircle, Clock, ChefHat, Bike, Package,
  MapPin, Star, Home, X
} from 'lucide-react'
import { api } from '../services/api'

const stepConfig = [
  { id: 1, label: 'Order Placed', sub: 'Your order has been received', icon: CheckCircle, offsetMin: 0 },
  { id: 2, label: 'Restaurant Confirmed', sub: (name) => `${name} accepted your order`, icon: Package, offsetMin: 2 },
  { id: 3, label: 'Preparing Your Food', sub: 'Chef is cooking your order', icon: ChefHat, offsetMin: 4 },
  { id: 4, label: 'Out for Delivery', sub: 'Rider is on the way', icon: Bike, offsetMin: null, live: true },
  { id: 5, label: 'Delivered', sub: 'Enjoy your meal!', icon: CheckCircle, offsetMin: null },
]

// What toast to show at each step transition
const stepToasts = {
  1: { message: 'Order placed successfully! 🎉', color: 'bg-green-500' },
  // 2: { message: 'Restaurant confirmed your order 🍽️', color: 'bg-blue-500' },
  // 3: { message: 'Chef is preparing your food 👨‍🍳', color: 'bg-orange-500' },
  4: { message: 'Your order is out for delivery 🛵', color: 'bg-purple-500' },
  5: { message: 'Order delivered! Enjoy your meal 🎉', color: 'bg-green-500' },
}

// Map step number to DB status string
const stepToStatus = {
  1: 'placed',
  2: 'confirmed',
  3: 'preparing',
  4: 'out_for_delivery',
  5: 'delivered',
}

function formatTime(dateStr, addMinutes = 0) {
  const d = new Date(dateStr)
  d.setMinutes(d.getMinutes() + addMinutes)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
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

function getInitialStep(order) {
  if (order.status === 'delivered') return 5
  if (order.status === 'out_for_delivery') return 4
  if (order.status === 'preparing') return 3
  if (order.status === 'confirmed') return 2
  return 1
}

// Toast component
function Toast({ message, color, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 ${color} text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce min-w-max`}>
      <CheckCircle size={16} className="text-white flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X size={14} />
      </button>
    </div>
  )
}

export default function OrderTracking() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [toast, setToast] = useState(null)
  const [rated, setRated] = useState(0)
  const [hovered, setHovered] = useState(0)
  const shownToasts = useRef(new Set())
  const updatedSteps = useRef(new Set())

  useEffect(() => {
    api.getOrder(orderId)
      .then(data => {
        setOrder(data)
        const initial = getInitialStep(data)
        setCurrentStep(initial)
        // Mark all steps up to initial as already shown
        for (let i = 1; i <= initial; i++) {
          shownToasts.current.add(i)
          updatedSteps.current.add(i)
        }
        // Show toast only for step 1 on fresh load (just placed)
        if (initial === 1) {
          setToast(stepToasts[1])
          shownToasts.current.add(1)
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [orderId])

  // Auto-progress steps
  useEffect(() => {
    if (!order) return
    if (order.status === 'delivered' || order.status === 'cancelled') return
    if (currentStep >= 5) return

    const delays = { 1: 5000, 2: 6000, 3: 7000, 4: 8000 }
    const timer = setTimeout(() => {
      setCurrentStep(s => Math.min(s + 1, 5))
    }, delays[currentStep] || 6000)

    return () => clearTimeout(timer)
  }, [currentStep, order])

  // Show toast + update DB when step changes
  useEffect(() => {
    if (!order || currentStep < 1) return

    // Show toast if not shown before
    if (!shownToasts.current.has(currentStep)) {
      shownToasts.current.add(currentStep)
      setToast(stepToasts[currentStep])
    }

    // Update DB if not updated before
    if (!updatedSteps.current.has(currentStep)) {
      updatedSteps.current.add(currentStep)
      const newStatus = stepToStatus[currentStep]
      if (newStatus) {
        api.updateOrderStatus(orderId, newStatus).catch(() => {
          // silently fail — UI still works
        })
      }
    }
  }, [currentStep, order, orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Order not found'}</p>
          <button onClick={() => navigate('/orders')} className="text-primary text-sm font-semibold hover:underline">
            View My Orders
          </button>
        </div>
      </div>
    )
  }

  const etaDate = new Date(order.estimatedDelivery)
  const timeStr = etaDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  const deliveryAddress = order.deliveryAddress

  const steps = stepConfig.map(step => ({
    ...step,
    sub: typeof step.sub === 'function' ? step.sub(order.restaurantName) : step.sub,
    time: step.offsetMin !== null ? formatTime(order.createdAt, step.offsetMin) : null,
  }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          color={toast.color}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Tracking</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Order ID: {order.orderNumber}</p>
          </div>
        </div>

        {/* ETA Hero */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-white/80" />
              <span className="text-white/80 text-sm">
                {currentStep === 5 ? 'Delivered!' : 'Estimated Delivery'}
              </span>
            </div>
            <p className="text-white font-black text-5xl mb-2">
              {currentStep === 5 ? '🎉' : timeStr}
            </p>
            <p className="text-white/80 text-sm mb-1">
              {currentStep === 5
                ? 'Your order has been delivered!'
                : `Based on ${order.restaurantName}'s usual delivery time (~${order.estimatedMinutes} min)`
              }
            </p>
            <p className="text-white/70 text-xs mb-4">
              Ordered {formatOrderDate(order.createdAt)}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5">
                <p className="text-white/70 text-[10px] uppercase tracking-wider">Restaurant</p>
                <p className="text-white font-semibold text-sm">{order.restaurantName}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5">
                <p className="text-white/70 text-[10px] uppercase tracking-wider">Items</p>
                <p className="text-white font-semibold text-sm">{order.itemCount} dishes</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5">
                <p className="text-white/70 text-[10px] uppercase tracking-wider">Total</p>
                <p className="text-white font-semibold text-sm">₹{order.total.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-5">Order Status</h2>
          <div className="space-y-0">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id
              const isActive = currentStep === step.id
              const isPending = currentStep < step.id
              const isLast = index === steps.length - 1

              return (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      isCompleted
                        ? 'bg-primary text-white shadow-md shadow-orange-200'
                        : isActive
                        ? 'bg-primary text-white shadow-lg shadow-orange-300 ring-4 ring-orange-100 dark:ring-orange-900/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                      <step.icon size={18} />
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 h-10 mt-1 rounded transition-all duration-700 ${
                        isCompleted ? 'bg-primary' : 'bg-gray-100 dark:bg-gray-800'
                      }`} />
                    )}
                  </div>

                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-semibold text-sm transition-colors ${
                          isPending ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'
                        }`}>
                          {step.label}
                          {step.live && isActive && (
                            <span className="ml-2 text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">
                              LIVE
                            </span>
                          )}
                        </p>
                        <p className={`text-xs mt-0.5 ${
                          isPending ? 'text-gray-300 dark:text-gray-700' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {step.sub}
                        </p>
                      </div>
                      {step.time && !isPending && (
                        <span className="text-xs text-gray-400 flex-shrink-0">{step.time}</span>
                      )}
                      {step.id === 4 && isActive && (
                        <span className="text-xs text-primary font-medium">Est. {timeStr}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order Items + Delivery */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 mb-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order Items</h2>
          <div className="space-y-2 mb-4">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{item.name} ×{item.quantity}</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <h2 className="font-bold text-gray-900 dark:text-white mb-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            Delivery Details
          </h2>

          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Delivering to</p>
              {deliveryAddress ? (
                <>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {deliveryAddress.name} · {deliveryAddress.phone}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{deliveryAddress.street}</p>
                  <p className="text-xs text-gray-500">
                    {deliveryAddress.landmark && `${deliveryAddress.landmark}, `}
                    {deliveryAddress.city} {deliveryAddress.pincode}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400">Address not available</p>
              )}
            </div>
          </div>

          {/* Map placeholder */}
          <div className="relative h-36 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl overflow-hidden flex items-center justify-center">
            <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Live tracking coming soon</span>
            </div>
            <div className="absolute bottom-6 right-16 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Bike size={14} className="text-white" />
            </div>
            <div className="absolute top-4 left-10 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-md">
              <Home size={12} className="text-white" />
            </div>
          </div>
        </div>

        {/* Rating — shows when delivered */}
        {currentStep >= 5 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 mb-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-1">How was your order?</h2>
            <p className="text-xs text-gray-400 mb-4">Rate your experience with {order.restaurantName}</p>
            <div className="flex items-center gap-2 justify-center mb-3">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRated(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      star <= (hovered || rated)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-200 dark:text-gray-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rated > 0 && (
              <p className="text-center text-sm text-primary font-medium">
                {rated === 5 ? '🎉 Awesome! Glad you loved it!' :
                 rated === 4 ? '😊 Great! Thanks for the feedback!' :
                 rated === 3 ? '🙂 Thanks! We\'ll try to do better!' :
                 '😔 Sorry about that. We\'ll improve!'}
              </p>
            )}
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white py-3.5 rounded-2xl font-semibold transition-all"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}