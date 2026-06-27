import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Trash2, Plus, Minus, Tag, X,
  ChevronRight, ArrowLeft, ShieldCheck, Zap
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { COUPONS, getOrderTotals } from '../utils/coupons'

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartTotal, appliedCoupon, setAppliedCoupon } = useApp()
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const navigate = useNavigate()

  const { deliveryFee, gst, discount, finalTotal } = getOrderTotals(cartTotal, appliedCoupon)

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase()
    if (COUPONS[code]) {
      setAppliedCoupon(code)
      setCouponError('')
      setCouponInput('')
    } else {
      setCouponError('Invalid coupon code. Try FIRST50, SAVE20, or QB180')
      setAppliedCoupon(null)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponError('')
    setCouponInput('')
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={40} className="text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Looks like you haven't added anything yet. Let's fix that!</p>
          <button
            onClick={() => navigate('/restaurants')}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-2xl font-semibold transition-colors"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    )
  }

  // Group cart items by restaurant
  const grouped = cart.reduce((acc, item) => {
    const key = item.restaurantName
    if (!acc[key]) acc[key] = { name: key, id: item.restaurantId, items: [] }
    acc[key].items.push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-800 hover:border-orange-400 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Cart</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{cart.reduce((s, i) => s + i.qty, 0)} items</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Cart Items ── */}
          <div className="lg:col-span-2 space-y-4">

            {Object.values(grouped).map(group => (
              <div key={group.name} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                {/* Restaurant header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Order from {group.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      group.items.forEach(i => removeFromCart(i.id))
                    }}
                    className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {group.items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">₹{item.price} each</p>
                        {/* Qty controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-primary rounded-xl px-2 py-1">
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              className="text-white hover:scale-110 transition-transform"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="text-white text-sm font-bold w-4 text-center">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              className="text-white hover:scale-110 transition-transform"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white flex-shrink-0">
                        ₹{item.price * item.qty}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Coupon */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={16} className="text-orange-600" />
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Apply Coupon</p>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">"{appliedCoupon}" applied</p>
                      <p className="text-xs text-green-600 dark:text-green-500">You save ₹{discount}!</p>
                    </div>
                  </div>
                  <button onClick={removeCoupon}>
                    <X size={16} className="text-green-600 hover:text-green-800" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value); setCouponError('') }}
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                      placeholder="Enter coupon code..."
                      className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:border-primary transition-colors"
                    />
                    <button
                      onClick={applyCoupon}
                      className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500 mt-2">{couponError}</p>
                  )}
                  {/* Quick codes */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {Object.keys(COUPONS).map(code => (
                      <button
                        key={code}
                        onClick={() => { setCouponInput(code); setCouponError('') }}
                        className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 border border-orange-200 dark:border-orange-200 px-3 py-1.5 rounded-full hover:bg-orange-50 transition-colors font-medium"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden sticky top-24">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <p className="font-semibold text-gray-900 dark:text-white">Order Summary</p>
              </div>

              <div className="px-5 py-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-500 font-medium' : 'font-medium text-gray-900 dark:text-white'}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">GST (5%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{gst}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Discount</span>
                    <span className="font-medium text-green-500">-₹{discount}</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl px-3 py-2">
                    <p className="text-xs text-orange-600">
                      Add ₹{299 - cartTotal} more for free delivery!
                    </p>
                  </div>
                )}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-orange-600 text-lg">₹{finalTotal}</span>
                </div>
              </div>

              <div className="px-5 pb-5">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ChevronRight size={18} />
                </button>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <ShieldCheck size={12} className="text-green-500" />
                    Secure
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Zap size={12} className="text-orange-600" />
                    Fast Delivery
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}