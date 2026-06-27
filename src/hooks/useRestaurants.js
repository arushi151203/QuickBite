import { useState, useEffect } from 'react'
import { api } from '../services/api'

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getRestaurants()
      .then(setRestaurants)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { restaurants, loading, error }
}

export function useRestaurant(id) {
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.getRestaurant(id)
      .then(setRestaurant)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  return { restaurant, loading, error }
}
