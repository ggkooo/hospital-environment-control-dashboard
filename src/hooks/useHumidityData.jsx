import { useEffect, useState, useRef } from 'react'

export function useHumidityData() {
    const [humidityData, setHumidityData] = useState([])
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

    async function fetchHumidityData() {
        try {
            setLoading(true)
            setError(null)
            const apiKey = import.meta.env.VITE_API_KEY || ''
            const res = await fetch('https://api.giordanoberwig.xyz/api/sensor-data/minute/humidity?order=desc&limit=60', {
                headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
            })
            if (!res.ok) {
                throw new Error(`Failed to fetch humidity data, HTTP ${res.status}`)
            }
            const json = await res.json()
            const humidityArray = json?.data || []
            if (!Array.isArray(humidityArray) || humidityArray.length === 0) {
                setHumidityData([])
                lastDataRef.current = []
                setIsUsingMockData(false)
                return
            }
            const formattedData = humidityArray.map(item => ({
                timestamp: new Date(item.minute_timestamp),
                value: parseFloat(item.avg_value) || 0,
                min: parseFloat(item.min_value) || 0,
                max: parseFloat(item.max_value) || 0
            })).filter(item => !isNaN(item.value))
            const sortedData = formattedData.sort((a, b) => a.timestamp - b.timestamp)
            if (sortedData.length === 0) {
                return
            }
            const slidingData = createSlidingWindow(sortedData, lastDataRef.current)
            setHumidityData(slidingData)
            lastDataRef.current = slidingData
            setIsUsingMockData(false)
        } catch (err) {
            setError(`API Error: ${err.message}`)
            setHumidityData([])
            lastDataRef.current = []
            setIsUsingMockData(false)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHumidityData()
        intervalRef.current = setInterval(fetchHumidityData, 60000)
        return () => clearInterval(intervalRef.current)
    }, [])

    return {
        humidityData,
        loading,
        error,
        refetch: fetchHumidityData,
        isUsingMockData
    }
}
