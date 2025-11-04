import { useEffect, useState, useRef } from 'react'
import { TYPES, UNIT_MAP, ICON_LABEL_MAP } from '../utils/sensorConstants'

export function useLiveSensorData() {
    const [liveData, setLiveData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)

    const timeoutRef = useRef(null)
    const intervalRef = useRef(null)

    async function fetchMinuteData() {
        try {
            setLoading(true)
            const apiKey = import.meta.env.VITE_API_KEY || ''
            const res = await fetch('https://api.giordanoberwig.xyz/api/sensor-data/minute/all?order=desc&limit=1', {
                headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
            })

            if (!res.ok) {
                console.error('Failed to fetch minute data, HTTP', res.status)
                return
            }

            const json = await res.json()

            const mapped = TYPES.map(type => {
                const arr = json?.data?.[type]
                const first = Array.isArray(arr) && arr.length > 0 ? arr[0] : null
                const val = first?.avg_value ?? '—'

                return { key: type, label: ICON_LABEL_MAP[type], value: val ?? '—', unit: UNIT_MAP[type] }
            })

            setLiveData(mapped)
            setLastUpdated(new Date().toISOString())
        } catch (err) {
            console.error('Failed to fetch minute data', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        function schedule() {
            const now = new Date()
            const next = new Date(now)
            if (now.getSeconds() < 30) {
                next.setSeconds(30, 0)
            } else {
                next.setMinutes(now.getMinutes() + 1, 30, 0)
            }
            const delay = next.getTime() - now.getTime()

            timeoutRef.current = setTimeout(() => {
                fetchMinuteData()
                intervalRef.current = setInterval(fetchMinuteData, 60_000)
            }, delay)
        }

        schedule()
        fetchMinuteData()

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    return { liveData, loading, lastUpdated, refetch: fetchMinuteData }
}

