


import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { api } from '../services/api'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const verifiedRef = useRef(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Verification token is missing.')
      return
    }

    if (verifiedRef.current) return
    verifiedRef.current = true

    api.verifyEmail(token)
      .then(data => {
        setStatus('success')
        setMessage(data.message)
      })
      .catch(err => {
        setStatus('error')
        setMessage(err.message)
      })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md text-center">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
          {status === 'loading' && (
            <>
              <Loader2 size={40} className="animate-spin text-orange-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verifying your email...</h2>
              <p className="text-sm text-gray-500">Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email verified!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-block w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark"
              >
                Sign In
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verification failed</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
              <Link to="/login" className="text-orange-600 font-semibold hover:underline">
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
