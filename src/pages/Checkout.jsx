import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, CreditCard, Smartphone,
  Banknote, ShieldCheck, Zap, Check
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { getOrderTotals } from '../utils/coupons'

export default function Checkout() {
  const { cart, cartTotal, clearCart, appliedCoupon } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const orderPlacedRef = useRef(false)

  useEffect(() => {
    if (cart.length === 0 && !orderPlacedRef.current) {
      navigate('/cart', { replace: true })
    }
  }, [cart, navigate])

  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [placing, setPlacing] = useState(false)
  const [placeError, setPlaceError] = useState('')

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    landmark: '',
    city: user?.city || 'Jaipur',
    pincode: '',
  })

  useEffect(() => {
    if (user) {
      setAddress(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        city: prev.city || user.city || 'Jaipur',
      }))
    }
  }, [user])

  const [upiId, setUpiId] = useState('')
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' })

  const { deliveryFee, gst, discount, finalTotal } = getOrderTotals(cartTotal, appliedCoupon)

  const handlePlaceOrder = async () => {
    setPlacing(true)
    setPlaceError('')
    orderPlacedRef.current = true

    try {
      const order = await api.createOrder({
        items: cart,
        paymentMethod,
        address,
        subtotal: cartTotal,
        deliveryFee,
        gst,
        discount,
        couponCode: appliedCoupon,
        total: finalTotal,
        restaurantId: cart[0].restaurantId,
      })

      clearCart()
      navigate(`/track-order/${order.id}`, { replace: true })
    } catch (err) {
      orderPlacedRef.current = false
      setPlaceError(err.message)
      setPlacing(false)
    }
  }

 const isAddressValid = 
  address.name.trim() &&
  /^\d{10}$/.test(address.phone.trim()) &&
  address.street.trim() &&
  address.city.trim() &&
  address.pincode.trim().length === 6
  
  const isPaymentValid = () => {
  if (paymentMethod === 'upi') return upiId.trim().includes('@')
  if (paymentMethod === 'card') return card.number.replace(/\s/g, '').length === 16 && card.expiry.length === 7 && card.cvv.length === 3
  if (paymentMethod === 'cod') return true
  return false
 }

 const canPlaceOrder = isAddressValid && isPaymentValid()

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Checkout</h1>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-3 mb-8">
          {[
            { num: 1, label: 'Cart' },
            { num: 2, label: 'Delivery' },
            { num: 3, label: 'Payment' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s.num < step + 1
                    ? 'bg-green-500 text-white'
                    : s.num === step + 1
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}>
                  {s.num < step + 1 ? <Check size={13} /> : s.num}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${
                  s.num === step + 1
                    ? 'text-orange-600'
                    : s.num < step + 1
                    ? 'text-green-500'
                    : 'text-gray-400'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className={`h-0.5 w-12 sm:w-20 rounded ${
                  s.num < step + 1 ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Form ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Delivery Address */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <MapPin size={16} className="text-orange-600" />
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Delivery Address</p>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  value={address.name}
                  onChange={v => setAddress(a => ({ ...a, name: v }))}
                  placeholder="Your full name"
                />
                <div>
                   <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                      Phone Number
                   </label>
                   <input
                      value={address.phone}
                      onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      autoComplete="off"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:border-primary transition-colors"
                    />
                    {address.phone && !/^\d{10}$/.test(address.phone) && (
                      <p className="text-xs text-red-500 mt-1">Enter a valid 10-digit mobile number</p>
                    )}
                </div>
                <div className="sm:col-span-2">
                  <InputField
                    label="Street Address"
                    value={address.street}
                    onChange={v => setAddress(a => ({ ...a, street: v }))}
                    placeholder="House/Flat no., Street, Area"
                  />
                </div>
                <InputField
                  label="Landmark"
                  value={address.landmark}
                  onChange={v => setAddress(a => ({ ...a, landmark: v }))}
                  placeholder="Near..."
                />
                <InputField
                  label="City"
                  value={address.city}
                  onChange={v => setAddress(a => ({ ...a, city: v }))}
                  placeholder="City"
                />
                <InputField
                  label="Pincode"
                  value={address.pincode}
                  onChange={v => setAddress(a => ({ ...a, pincode: v }))}
                  placeholder="6-digit pincode"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <CreditCard size={16} className="text-orange-600" />
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Payment Method</p>
              </div>
              <div className="p-5">

                {/* Payment Tabs */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { id: 'upi', icon: Smartphone, label: 'UPI', sub: 'Google Pay, PhonePe, Paytm' },
                    { id: 'card', icon: CreditCard, label: 'Card', sub: 'Credit & Debit cards' },
                    { id: 'cod', icon: Banknote, label: 'Cash on Delivery', sub: 'Pay at doorstep' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === m.id
                          ? 'border-primary bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <m.icon size={20} className={paymentMethod === m.id ? 'text-orange-600' : 'text-gray-400'} />
                      <div className="text-center">
                        <p className={`text-xs font-semibold ${paymentMethod === m.id ? 'text-orange-600' : 'text-gray-700 dark:text-gray-300'}`}>
                          {m.label}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">{m.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* UPI Input */}
                {paymentMethod === 'upi' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">UPI ID</label>
                    <input
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:border-primary transition-colors"
                    />
                  </div>
                )}

                {/* Card Input */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Card Number</label>
                      <input
                        value={card.number}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
                          const formatted = raw.match(/.{1,4}/g)?.join(' ') || ''
                          setCard(c => ({ ...c, number: formatted }))
                        }}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">MM / YY</label>
                        <input
                          value={card.expiry}
                          onChange={e => {
                            const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
                            const formatted = raw.length > 2 ? `${raw.slice(0, 2)} / ${raw.slice(2)}` : raw
                            setCard(c => ({ ...c, expiry: formatted }))
                         }}
                          placeholder="MM / YY"
                          maxLength={7}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">CVV</label>
                        <input
                          value={card.cvv}
                          onChange={e => setCard(c => ({ ...c, cvv: e.target.value }))}
                          placeholder="•••"
                          maxLength={3}
                          type="password"
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* COD */}
                {paymentMethod === 'cod' && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
                    <Banknote size={20} className="text-green-500 flex-shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Pay with cash when your order arrives at your doorstep. Keep exact change handy.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden sticky top-24">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <p className="font-semibold text-gray-900 dark:text-white">Order Summary</p>
              </div>

              {/* Items */}
              <div className="px-5 py-3 max-h-40 overflow-y-auto space-y-2 border-b border-gray-100 dark:border-gray-800">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 truncate flex-1 mr-2">
                      {item.name} ×{item.qty}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white flex-shrink-0">
                      ₹{item.price * item.qty}
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-5 py-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Delivery</span>
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
                    <span className="text-gray-500 dark:text-gray-400">
                      Discount {appliedCoupon && `(${appliedCoupon})`}
                    </span>
                    <span className="font-medium text-green-500">-₹{discount}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-orange-600 text-lg">₹{finalTotal}</span>
                </div>
              </div>

              <div className="px-5 pb-5">
                {placeError && (
                  <p className="text-xs text-red-500 text-center mb-3">{placeError}</p>
                )}
                <button
                  onClick={handlePlaceOrder}
                  disabled={!canPlaceOrder || placing}
                  className={`w-full py-3.5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    placing
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : !canPlaceOrder
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-dark text-white shadow-md shadow-orange-200'
                  }`}
                >
                  {placing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Placing Order...
                   </>
                 ) : (
                  `Place Order · ₹${finalTotal}`
                 )}
               </button>

               {!canPlaceOrder && !placing && (
                  <p className="text-xs text-center text-gray-400 mt-2">
                    {!isAddressValid
                      ? 'Please fill in your delivery address'
                      : 'Please enter valid payment details'}
                  </p>
                )}

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

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
        {label}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:border-primary transition-colors"
      />
    </div>
  )
}