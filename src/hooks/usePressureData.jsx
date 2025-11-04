import { useEffect, useState, useRef } from 'react'

export function usePressureData() {
    const [pressureData, setPressureData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isUsingMockData, setIsUsingMockData] = useState(true)

    const intervalRef = useRef(null)
    const lastDataRef = useRef([])

    const createSlidingWindow = (newData, previousData = []) => {
        const TARGET_POINTS = 60
        if (!newData || newData.length === 0) {
            return previousData
        }
        if (previousData.length === 0) {
            return newData.slice(-TARGET_POINTS)
        }
        const lastTimestamp = previousData.length > 0
            ? Math.max(...previousData.map(d => d.timestamp.getTime()))
            : 0
        const reallyNewData = newData.filter(point =>
            point.timestamp.getTime() > lastTimestamp
        )
        if (reallyNewData.length === 0) {
            return previousData
        }
        const combinedData = [...previousData, ...reallyNewData]
        const slidingData = combinedData.slice(-TARGET_POINTS)
        return slidingData
    }

    async function fetchPressureData() {
        try {
            setLoading(true)
            setError(null)
            const apiKey = import.meta.env.VITE_API_KEY || ''
            const res = await fetch('https://api.giordanoberwig.xyz/api/sensor-data/minute/pressure?order=desc&limit=60', {
                headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
            })
            if (!res.ok) {
                throw new Error(`Failed to fetch pressure data, HTTP ${res.status}`)
            }
            const json = await res.json()
            const pressureArray = json?.data || []
            if (!Array.isArray(pressureArray) || pressureArray.length === 0) {
                setPressureData([])
                lastDataRef.current = []
                setIsUsingMockData(false)
                setLoading(false)
                return
            }
            // Convert timestamps to Date objects and value to number
            // Adaptando para o formato da API: avg_value, min_value, max_value
            const parsedData = pressureArray.map(d => ({
                ...d,
                timestamp: new Date(d.minute_timestamp || d.timestamp),
                value: Number(d.avg_value ?? d.value),
                min: Number(d.min_value ?? d.min),
                max: Number(d.max_value ?? d.max)
            }))
            const slidingData = createSlidingWindow(parsedData, lastDataRef.current)
            setPressureData(slidingData)
            lastDataRef.current = slidingData
            setIsUsingMockData(false)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPressureData()
        intervalRef.current = setInterval(fetchPressureData, 60000)
        return () => clearInterval(intervalRef.current)
    }, [])

    const refetch = () => fetchPressureData()

    return { pressureData, loading, error, refetch, isUsingMockData }
}
