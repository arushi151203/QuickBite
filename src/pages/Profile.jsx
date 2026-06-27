import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Camera, Save, Home, Briefcase, Plus, Trash2, Check, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

const iconMap = { Home, Work: Briefcase, Other: MapPin }

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Jaipur',
  })

  const [addresses, setAddresses] = useState([])
  const [addressesLoading, setAddressesLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newAddr, setNewAddr] = useState({ type: 'Home', full: '' })
  const [addrSaving, setAddrSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || 'Jaipur',
      })
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    setAddressesLoading(true)
    api.getAddresses()
      .then(setAddresses)
      .catch((err) => {
        setError(
          err.message === 'Route not found'
            ? 'Address API unavailable — restart the backend: cd backend && npm run dev'
            : 'Failed to load saved addresses'
        )
      })
      .finally(() => setAddressesLoading(false))
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const { user: updated } = await api.updateProfile({
        name: profile.name,
        phone: profile.phone,
        city: profile.city,
      })
      updateUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddAddress = async () => {
    if (!newAddr.full.trim()) return
    setAddrSaving(true)
    setError('')
    try {
      const added = await api.addAddress({
        type: newAddr.type,
        fullAddress: newAddr.full,
        isDefault: addresses.length === 0,
      })
      setAddresses(prev => [...prev, added])
      setNewAddr({ type: 'Home', full: '' })
      setAdding(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setAddrSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteAddress(id)
      setAddresses(prev => {
        const next = prev.filter(a => a.id !== id)
        if (next.length > 0 && !next.some(a => a.default)) {
          next[0] = { ...next[0], default: true }
        }
        return next
      })
      const refreshed = await api.getAddresses()
      setAddresses(refreshed)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSetDefault = async (id) => {
    try {
      await api.setDefaultAddress(id)
      setAddresses(prev => prev.map(a => ({ ...a, default: a.id === id })))
    } catch (err) {
      setError(err.message)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 size={32} className="animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">My Profile</h1>

        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {profile.name ? profile.name[0].toUpperCase() : '?'}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors">
              <Camera size={14} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-3 font-medium">{profile.name}</p>
          <p className="text-xs text-gray-400">{profile.email}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-5 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Personal Information</p>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl">{error}</p>
          )}

          <ProfileInput
            icon={User}
            label="Full Name"
            value={profile.name}
            onChange={v => setProfile(p => ({ ...p, name: v }))}
            placeholder="Your full name"
          />
          <ProfileInput
            icon={Mail}
            label="Email Address"
            value={profile.email}
            onChange={() => {}}
            placeholder="your@email.com"
            type="email"
            readOnly
            hint="Email cannot be changed"
          />
          <ProfileInput
            icon={Phone}
            label="Phone Number"
            value={profile.phone}
            onChange={v => setProfile(p => ({ ...p, phone: v }))}
            placeholder="10-digit mobile number"
            type="tel"
          />
          <ProfileInput
            icon={MapPin}
            label="City"
            value={profile.city}
            onChange={v => setProfile(p => ({ ...p, city: v }))}
            placeholder="Your city"
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-3.5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-primary hover:bg-primary-dark text-white'
            } disabled:opacity-60`}
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : saved ? (
              <><Check size={16} /> Saved Successfully!</>
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Saved Addresses</p>
            <button
              onClick={() => setAdding(a => !a)}
              className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold hover:underline"
            >
              <Plus size={14} /> Add New
            </button>
          </div>

          {addressesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-orange-600" />
            </div>
          ) : addresses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No saved addresses yet. Add one above.</p>
          ) : (
            <div className="space-y-3">
              {addresses.map(addr => {
                const Icon = iconMap[addr.type] || MapPin
                return (
                  <div
                    key={addr.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      addr.default
                        ? 'border-primary bg-orange-50/50 dark:bg-orange-900/10'
                        : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        addr.default ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <Icon size={16} className={addr.default ? 'text-orange-600' : 'text-gray-400'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{addr.type}</p>
                          {addr.default && (
                            <span className="text-[10px] bg-primary/10 text-orange-600 px-2 py-0.5 rounded-full font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{addr.full}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!addr.default && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            title="Set as default"
                            className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border border-gray-200 dark:border-gray-600"
                          >
                            <Check size={13} className="text-gray-400 hover:text-green-500" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(addr.id)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-gray-200 dark:border-gray-600"
                        >
                          <Trash2 size={13} className="text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {adding && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Add New Address</p>
              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Type</label>
                <div className="flex gap-2">
                  {['Home', 'Work', 'Other'].map(t => (
                    <button
                      key={t}
                      onClick={() => setNewAddr(a => ({ ...a, type: t }))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        newAddr.type === t
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={newAddr.full}
                onChange={e => setNewAddr(a => ({ ...a, full: e.target.value }))}
                placeholder="House/Flat no., Street, Area, City, Pincode"
                rows={3}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:border-primary transition-colors resize-none mb-3"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setAdding(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAddress}
                  disabled={addrSaving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {addrSaving && <Loader2 size={14} className="animate-spin" />}
                  Save Address
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProfileInput({ icon: Icon, label, value, onChange, placeholder, type = 'text', readOnly, hint }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
        {label}
      </label>
      <div className={`flex items-center gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 transition-colors ${readOnly ? 'opacity-70' : 'focus-within:border-primary'}`}>
        <Icon size={16} className="text-gray-400 flex-shrink-0" />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          autoComplete="off"
          className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full"
        />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}
