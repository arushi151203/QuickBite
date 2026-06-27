import { useState } from 'react'
import {
  Bell, Moon, Globe, Shield, HelpCircle,
  ChevronRight, LogOut, Smartphone
} from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Settings() {
  const { darkMode, toggleDark } = useApp()
  const [notifications, setNotifications] = useState({
    orders: true,
    offers: true,
    recommendations: false,
    sms: true,
  })
  const [language, setLanguage] = useState('English')

  const toggle = (key) => setNotifications(n => ({ ...n, [key]: !n[key] }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <SettingsToggle
            icon={Moon}
            label="Dark Mode"
            sub="Switch to dark theme"
            value={darkMode}
            onToggle={toggleDark}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsToggle
            icon={Bell}
            label="Order Updates"
            sub="Get notified about your order status"
            value={notifications.orders}
            onToggle={() => toggle('orders')}
          />
          <SettingsToggle
            icon={Bell}
            label="Offers & Deals"
            sub="Receive discount and cashback alerts"
            value={notifications.offers}
            onToggle={() => toggle('offers')}
          />
          <SettingsToggle
            icon={Bell}
            label="Recommendations"
            sub="Personalized food suggestions"
            value={notifications.recommendations}
            onToggle={() => toggle('recommendations')}
          />
          <SettingsToggle
            icon={Smartphone}
            label="SMS Alerts"
            sub="Receive order updates via SMS"
            value={notifications.sms}
            onToggle={() => toggle('sms')}
          />
        </SettingsSection>

        {/* Language */}
        <SettingsSection title="Language & Region">
          <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <Globe size={17} className="text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Language</p>
                <p className="text-xs text-gray-400">{language}</p>
              </div>
            </div>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="text-sm text-orange-600 font-medium bg-transparent outline-none cursor-pointer"
            >
              {['English', 'Hindi', 'Gujarati', 'Tamil', 'Telugu'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </SettingsSection>

        {/* Support */}
        <SettingsSection title="Support">
          {[
            { icon: Shield, label: 'Privacy Policy', sub: 'How we handle your data' },
            { icon: HelpCircle, label: 'Help & Support', sub: 'FAQs and contact us' },
            { icon: HelpCircle, label: 'Terms of Service', sub: 'Read our terms' },
          ].map(item => (
            <button
              key={item.label}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  <item.icon size={17} className="text-gray-500 dark:text-gray-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
        </SettingsSection>

        {/* Logout */}
        <button className="w-full flex items-center gap-3 px-4 py-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-red-200 dark:hover:border-red-800 transition-colors mt-4">
          <div className="w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
            <LogOut size={17} className="text-red-500" />
          </div>
          <span className="text-sm font-semibold text-red-500">Logout</span>
        </button>

        <p className="text-center text-xs text-gray-400 mt-6">QuickBite v2.0 · Made with ❤️ in Jaipur</p>
      </div>
    </div>
  )
}

function SettingsSection({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-4">
      <p className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
        {title}
      </p>
      <div className="p-2">
        {children}
      </div>
    </div>
  )
}

function SettingsToggle({ icon: Icon, label, sub, value, onToggle }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
          <Icon size={17} className="text-gray-500 dark:text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-xs text-gray-400">{sub}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
          value ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-all duration-300 ${
          value ? 'left-5' : 'left-0.5'
        }`} />
      </button>
    </div>
  )
}