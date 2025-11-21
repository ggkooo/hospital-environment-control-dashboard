import { useState, useEffect } from 'react'

export function useAccessLogData() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/access-logs', {
                    headers: {
                        'X-API-KEY': import.meta.env.VITE_API_KEY
                    }
                })
                if (!response.ok) {
                    throw new Error('Failed to fetch access logs')
                }
                const data = await response.json()
                setLogs(data)
            } catch (err) {
                setError(err.message)
                console.error('Error fetching access logs:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchLogs()
    }, [])

    return { logs, loading, error }
}
